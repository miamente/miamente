import "./firebase-admin"; // Initialize Firebase Admin first
import { onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { bookAppointment, getAppointment, cancelAppointment } from "./appointments";
import { mockApprovePayment } from "./mock-payment";
import { adminConfirmPayment, adminFailPayment } from "./admin-payments";
import { cleanupHeldSlots } from "./cleanup";
import { sendEmailHandler } from "./email";
import { sendReminderEmails, sendPostSessionEmails } from "./reminders";
import { runReminders as runRemindersHandler } from "./reminders-https";
export const sendEmail = onCall(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new HttpsError("unauthenticated", "Auth required");
    }
    const { to, subject, html } = data;
    if (!to || !subject || !html) {
        throw new HttpsError("invalid-argument", "to, subject, and html are required");
    }
    return await sendEmailHandler(to, subject, html);
});
// Export the new appointment functions
export { bookAppointment, getAppointment, cancelAppointment };
// Export mock payment function
export { mockApprovePayment };
// Export admin payment functions
export { adminConfirmPayment, adminFailPayment };
// Export reminders HTTPS function
export const wompiWebhook = onRequest(async (req, res) => {
    res.status(200).send("ok");
});
export const runReminders = onSchedule("every 1 hours", async () => {
    await sendReminderEmails();
    await sendPostSessionEmails();
});
// Cleanup job to release held slots without payment
export const cleanupHeldSlotsJob = onSchedule("every 5 minutes", async () => {
    await cleanupHeldSlots();
});
// HTTPS function for running reminders (called by GitHub Actions)
export const runRemindersHttps = onRequest(async (req, res) => {
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
    try {
        const result = await runRemindersHandler(req, res);
        res.status(200).json(result);
    }
    catch (error) {
        logger.error("Error in runReminders HTTPS function:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
//# sourceMappingURL=index.js.map