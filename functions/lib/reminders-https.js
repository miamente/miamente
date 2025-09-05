import "./firebase-admin"; // Initialize Firebase Admin first
import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { sendEmailHandler, generateReminderEmailHtml } from "./email";
import { logger } from "firebase-functions/v2";
const db = getFirestore();
/**
 * Generate Jitsi URL for the appointment
 */
function generateJitsiUrl(appointmentId, professionalId) {
    const baseUrl = process.env.JITSI_BASE_URL || "https://meet.jit.si";
    const roomName = `miamente-${appointmentId}-${professionalId}`;
    // Add JWT token if configured
    const jwtToken = process.env.JITSI_JWT_SECRET;
    if (jwtToken) {
        return `${baseUrl}/${roomName}?jwt=${jwtToken}`;
    }
    return `${baseUrl}/${roomName}`;
}
/**
 * Send reminder email for an appointment
 */
async function sendReminderEmail(appointment, hoursUntil) {
    try {
        // Get user details
        const userDoc = await db.collection("users").doc(appointment.userId).get();
        if (!userDoc.exists) {
            logger.warn(`User not found for appointment ${appointment.id}`);
            return false;
        }
        const userData = userDoc.data();
        const userEmail = userData?.email;
        if (!userEmail) {
            logger.warn(`User email not found for appointment ${appointment.id}`);
            return false;
        }
        // Generate Jitsi URL
        const jitsiUrl = generateJitsiUrl(appointment.id, appointment.professionalId);
        // Create appointment date
        const appointmentDate = new Date(`${appointment.slot.date}T${appointment.slot.time}:00`);
        // Generate email HTML
        const emailHtml = generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil, appointment.professional?.fullName);
        // Send email
        const result = await sendEmailHandler(userEmail, `Recordatorio: Cita en ${hoursUntil} hora${hoursUntil > 1 ? "s" : ""}`, emailHtml);
        if (result.success) {
            logger.info(`Reminder email sent for appointment ${appointment.id} (${hoursUntil}h)`);
            return true;
        }
        else {
            logger.error(`Failed to send reminder email for appointment ${appointment.id}:`, result.error);
            return false;
        }
    }
    catch (error) {
        logger.error(`Error sending reminder email for appointment ${appointment.id}:`, error);
        return false;
    }
}
/**
 * Update appointment with reminder flag
 */
async function markReminderSent(appointmentId, reminderType) {
    try {
        const updateData = {
            updatedAt: FieldValue.serverTimestamp(),
        };
        if (reminderType === "24h") {
            updateData.sent24h = true;
            updateData.sent24hAt = FieldValue.serverTimestamp();
        }
        else {
            updateData.sent1h = true;
            updateData.sent1hAt = FieldValue.serverTimestamp();
        }
        await db.collection("appointments").doc(appointmentId).update(updateData);
        logger.info(`Marked ${reminderType} reminder as sent for appointment ${appointmentId}`);
    }
    catch (error) {
        logger.error(`Error marking reminder as sent for appointment ${appointmentId}:`, error);
        throw error;
    }
}
/**
 * Get appointments that need reminders
 */
async function getAppointmentsForReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    // Format dates for Firestore queries
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];
    try {
        // Get appointments for 24h reminders (tomorrow's appointments)
        const appointments24hSnapshot = await db
            .collection("appointments")
            .where("status", "==", "confirmed")
            .where("slot.date", "==", tomorrowStr)
            .where("sent24h", "==", false)
            .get();
        // Get appointments for 1h reminders (today's appointments within the next hour)
        const appointments1hSnapshot = await db
            .collection("appointments")
            .where("status", "==", "confirmed")
            .where("slot.date", "==", todayStr)
            .where("sent1h", "==", false)
            .get();
        // Filter 1h appointments by time (within the next hour)
        const appointments1h = appointments1hSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((appointment) => {
            const appointmentTime = new Date(`${appointment.slot.date}T${appointment.slot.time}:00`);
            const timeDiff = appointmentTime.getTime() - now.getTime();
            return timeDiff > 0 && timeDiff <= 60 * 60 * 1000; // Within next hour
        });
        const appointments24h = appointments24hSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return {
            "24h": appointments24h,
            "1h": appointments1h,
        };
    }
    catch (error) {
        logger.error("Error fetching appointments for reminders:", error);
        throw error;
    }
}
/**
 * Run reminders for appointments
 */
export const runReminders = onRequest({ region: "us-central1" }, async (req, res) => {
    // Set CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    // Only allow GET requests
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    // Verify authorization token
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.REMINDERS_AUTH_TOKEN;
    if (!expectedToken) {
        logger.error("REMINDERS_AUTH_TOKEN not configured");
        res.status(500).json({ error: "Server configuration error" });
        return;
    }
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        logger.warn("Unauthorized reminder request");
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const startTime = Date.now();
    const result = {
        success: true,
        remindersSent: {
            "24h": 0,
            "1h": 0,
        },
        errors: [],
        timestamp: new Date().toISOString(),
    };
    try {
        logger.info("Starting reminder process...");
        // Get appointments that need reminders
        const appointments = await getAppointmentsForReminders();
        logger.info(`Found ${appointments["24h"].length} appointments for 24h reminders`);
        logger.info(`Found ${appointments["1h"].length} appointments for 1h reminders`);
        // Process 24h reminders
        for (const appointment of appointments["24h"]) {
            try {
                const emailSent = await sendReminderEmail(appointment, 24);
                if (emailSent) {
                    await markReminderSent(appointment.id, "24h");
                    result.remindersSent["24h"]++;
                }
                else {
                    result.errors.push(`Failed to send 24h reminder for appointment ${appointment.id}`);
                }
            }
            catch (error) {
                const errorMsg = `Error processing 24h reminder for appointment ${appointment.id}: ${error}`;
                logger.error(errorMsg);
                result.errors.push(errorMsg);
            }
        }
        // Process 1h reminders
        for (const appointment of appointments["1h"]) {
            try {
                const emailSent = await sendReminderEmail(appointment, 1);
                if (emailSent) {
                    await markReminderSent(appointment.id, "1h");
                    result.remindersSent["1h"]++;
                }
                else {
                    result.errors.push(`Failed to send 1h reminder for appointment ${appointment.id}`);
                }
            }
            catch (error) {
                const errorMsg = `Error processing 1h reminder for appointment ${appointment.id}: ${error}`;
                logger.error(errorMsg);
                result.errors.push(errorMsg);
            }
        }
        const duration = Date.now() - startTime;
        logger.info(`Reminder process completed in ${duration}ms`);
        logger.info(`Sent ${result.remindersSent["24h"]} 24h reminders and ${result.remindersSent["1h"]} 1h reminders`);
        if (result.errors.length > 0) {
            logger.warn(`Reminder process completed with ${result.errors.length} errors`);
            result.success = false;
        }
        res.status(200).json({
            ...result,
            duration: `${duration}ms`,
            totalRemindersSent: result.remindersSent["24h"] + result.remindersSent["1h"],
        });
    }
    catch (error) {
        logger.error("Error in reminder process:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });
    }
});
//# sourceMappingURL=reminders-https.js.map