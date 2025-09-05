import "./firebase-admin"; // Initialize Firebase Admin first
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { sendEmailHandler, generateConfirmationEmailHtml } from "./email";
const db = getFirestore();
/**
 * Mock Payment Approval Function
 *
 * This function simulates payment approval for development and testing.
 * It should only be available in development/staging environments.
 *
 * In production, this would be replaced by actual payment gateway webhooks.
 */
export const mockApprovePayment = onCall({ region: "us-central1" }, async (request) => {
    const { appointmentId } = request.data;
    const { auth } = request;
    // Verify authentication
    if (!auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated to approve payments");
    }
    // Validate input
    if (!appointmentId) {
        throw new HttpsError("invalid-argument", "appointmentId is required");
    }
    try {
        // Use transaction to ensure atomicity
        const result = await db.runTransaction(async (transaction) => {
            // Get the appointment document
            const appointmentRef = db.collection("appointments").doc(appointmentId);
            const appointmentDoc = await transaction.get(appointmentRef);
            if (!appointmentDoc.exists) {
                throw new HttpsError("not-found", "Appointment not found");
            }
            const appointmentData = appointmentDoc.data();
            // Verify the appointment belongs to the authenticated user
            if (appointmentData?.userId !== auth.uid) {
                throw new HttpsError("permission-denied", "You can only approve your own appointments");
            }
            // Verify appointment is in a valid state for approval
            if (!["pending_payment", "pending_confirmation"].includes(appointmentData?.status)) {
                throw new HttpsError("failed-precondition", `Appointment status '${appointmentData?.status}' cannot be approved`);
            }
            // Generate Jitsi URL
            const jitsiUrl = generateJitsiUrl(appointmentId, appointmentData.professionalId);
            // Update appointment status to confirmed and mark as paid
            transaction.update(appointmentRef, {
                status: "confirmed",
                paid: true,
                payment: {
                    ...appointmentData.payment,
                    status: "approved",
                    approvedAt: FieldValue.serverTimestamp(),
                },
                jitsiUrl,
                confirmedAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
            // Update slot status to booked
            if (appointmentData?.slotId) {
                const slotRef = db.collection("availability").doc(appointmentData.slotId);
                transaction.update(slotRef, {
                    status: "booked",
                    bookedBy: auth.uid,
                    bookedAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }
            return {
                appointmentData,
                jitsiUrl,
            };
        });
        // Send confirmation email
        await sendConfirmationEmail(appointmentId, result.jitsiUrl, result.appointmentData);
        // Log successful approval
        console.log(`Mock payment approved successfully: ${appointmentId} for user ${auth.uid}`);
        return {
            success: true,
            message: "Payment approved successfully",
            appointmentId,
            jitsiUrl: result.jitsiUrl,
        };
    }
    catch (error) {
        console.error("Error approving mock payment:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to approve payment. Please try again.");
    }
});
/**
 * Generate Jitsi URL for the appointment
 */
function generateJitsiUrl(appointmentId, professionalId) {
    const baseUrl = process.env.JITSI_BASE_URL || "https://meet.jit.si";
    const roomName = `miamente-${appointmentId}-${professionalId}`;
    // Add JWT token if configured
    const jwtToken = process.env.JITSI_JWT_SECRET;
    if (jwtToken) {
        // In a real implementation, you would generate a proper JWT token
        // For now, we'll use a simple approach
        return `${baseUrl}/${roomName}?jwt=${jwtToken}`;
    }
    return `${baseUrl}/${roomName}`;
}
/**
 * Send confirmation email
 */
async function sendConfirmationEmail(appointmentId, jitsiUrl, appointmentData) {
    try {
        // Get user details
        const userRef = db.collection("users").doc(appointmentData?.userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.error("User not found for email confirmation");
            return;
        }
        const userData = userDoc.data();
        const userEmail = userData?.email;
        if (!userEmail) {
            console.error("User email not found for confirmation");
            return;
        }
        // Create appointment date
        const appointmentDate = new Date(`${appointmentData.slot.date}T${appointmentData.slot.time}:00`);
        // Generate email HTML using the centralized function
        const emailHtml = generateConfirmationEmailHtml(appointmentDate, jitsiUrl, appointmentData.professional?.fullName);
        // Send email using the centralized email handler
        const result = await sendEmailHandler(userEmail, "Cita Confirmada - Miamente", emailHtml);
        if (result.success) {
            console.log(`Confirmation email sent to ${userEmail} for appointment ${appointmentId}`);
        }
        else {
            console.error(`Failed to send confirmation email for appointment ${appointmentId}:`, result.error);
        }
    }
    catch (error) {
        console.error("Error sending confirmation email:", error);
        // Don't throw error for email failures
    }
}
//# sourceMappingURL=mock-payment.js.map