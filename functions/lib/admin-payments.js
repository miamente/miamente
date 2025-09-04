"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminFailPayment = exports.adminConfirmPayment = void 0;
require("./firebase-admin"); // Initialize Firebase Admin first
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const email_1 = require("./email");
const db = (0, firestore_1.getFirestore)();
/**
 * Check if user is admin
 */
async function isAdmin(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return false;
        }
        const userData = userDoc.data();
        return userData?.role === 'admin' || userData?.isAdmin === true;
    }
    catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}
/**
 * Log admin action to event_log
 */
async function logAdminAction(adminId, action, appointmentId) {
    try {
        await db.collection('event_log').add({
            adminId,
            action,
            appointmentId,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
        console.log(`Admin action logged: ${action} for appointment ${appointmentId} by admin ${adminId}`);
    }
    catch (error) {
        console.error('Error logging admin action:', error);
        // Don't throw error for logging failures
    }
}
/**
 * Generate Jitsi URL for the appointment
 */
function generateJitsiUrl(appointmentId, professionalId) {
    const baseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';
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
        const userRef = db.collection('users').doc(appointmentData?.userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.error('User not found for email confirmation');
            return;
        }
        const userData = userDoc.data();
        const userEmail = userData?.email;
        if (!userEmail) {
            console.error('User email not found for confirmation');
            return;
        }
        // Create appointment date
        const appointmentDate = new Date(`${appointmentData.slot.date}T${appointmentData.slot.time}:00`);
        // Generate email HTML using the centralized function
        const emailHtml = (0, email_1.generateConfirmationEmailHtml)(appointmentDate, jitsiUrl, appointmentData.professional?.fullName);
        // Send email using the centralized email handler
        const result = await (0, email_1.sendEmailHandler)(userEmail, 'Cita Confirmada - Miamente', emailHtml);
        if (result.success) {
            console.log(`Confirmation email sent to ${userEmail} for appointment ${appointmentId}`);
        }
        else {
            console.error(`Failed to send confirmation email for appointment ${appointmentId}:`, result.error);
        }
    }
    catch (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw error for email failures
    }
}
/**
 * Admin Confirm Payment Function
 *
 * Allows admin users to confirm payments for appointments.
 * Changes appointment status to confirmed, marks as paid, updates slot to booked,
 * generates Jitsi URL, and sends confirmation email.
 */
exports.adminConfirmPayment = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    const { appointmentId } = request.data;
    const { auth } = request;
    // Verify authentication
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const adminId = auth.uid;
    // Verify admin privileges
    const isAdminUser = await isAdmin(adminId);
    if (!isAdminUser) {
        throw new https_1.HttpsError('permission-denied', 'Only admin users can confirm payments');
    }
    // Validate input
    if (!appointmentId) {
        throw new https_1.HttpsError('invalid-argument', 'appointmentId is required');
    }
    try {
        // Use transaction to ensure atomicity
        const result = await db.runTransaction(async (transaction) => {
            // Get the appointment document
            const appointmentRef = db.collection('appointments').doc(appointmentId);
            const appointmentDoc = await transaction.get(appointmentRef);
            if (!appointmentDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Appointment not found');
            }
            const appointmentData = appointmentDoc.data();
            // Verify appointment is in a valid state for confirmation
            if (!['pending_payment', 'pending_confirmation'].includes(appointmentData?.status)) {
                throw new https_1.HttpsError('failed-precondition', `Appointment status '${appointmentData?.status}' cannot be confirmed`);
            }
            // Generate Jitsi URL
            const jitsiUrl = generateJitsiUrl(appointmentId, appointmentData.professionalId);
            // Update appointment status to confirmed and mark as paid
            transaction.update(appointmentRef, {
                status: 'confirmed',
                paid: true,
                payment: {
                    ...appointmentData.payment,
                    status: 'approved',
                    approvedAt: firestore_1.FieldValue.serverTimestamp()
                },
                jitsiUrl,
                confirmedAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
            // Update slot status to booked
            if (appointmentData?.slotId) {
                const slotRef = db.collection('availability').doc(appointmentData.slotId);
                transaction.update(slotRef, {
                    status: 'booked',
                    bookedBy: appointmentData.userId,
                    bookedAt: firestore_1.FieldValue.serverTimestamp(),
                    updatedAt: firestore_1.FieldValue.serverTimestamp()
                });
            }
            return {
                appointmentData,
                jitsiUrl
            };
        });
        // Log admin action
        await logAdminAction(adminId, 'admin_confirm_payment', appointmentId);
        // Send confirmation email
        await sendConfirmationEmail(appointmentId, result.jitsiUrl, result.appointmentData);
        // Log successful confirmation
        console.log(`Admin payment confirmation successful: ${appointmentId} by admin ${adminId}`);
        return {
            success: true,
            message: 'Payment confirmed successfully',
            appointmentId,
            jitsiUrl: result.jitsiUrl
        };
    }
    catch (error) {
        console.error('Error confirming payment:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to confirm payment. Please try again.');
    }
});
/**
 * Admin Fail Payment Function
 *
 * Allows admin users to mark payments as failed.
 * Changes appointment status to payment_failed and releases the slot.
 */
exports.adminFailPayment = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    const { appointmentId } = request.data;
    const { auth } = request;
    // Verify authentication
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const adminId = auth.uid;
    // Verify admin privileges
    const isAdminUser = await isAdmin(adminId);
    if (!isAdminUser) {
        throw new https_1.HttpsError('permission-denied', 'Only admin users can fail payments');
    }
    // Validate input
    if (!appointmentId) {
        throw new https_1.HttpsError('invalid-argument', 'appointmentId is required');
    }
    try {
        // Use transaction to ensure atomicity
        await db.runTransaction(async (transaction) => {
            // Get the appointment document
            const appointmentRef = db.collection('appointments').doc(appointmentId);
            const appointmentDoc = await transaction.get(appointmentRef);
            if (!appointmentDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Appointment not found');
            }
            const appointmentData = appointmentDoc.data();
            // Verify appointment is in a valid state for failure
            if (!['pending_payment', 'pending_confirmation'].includes(appointmentData?.status)) {
                throw new https_1.HttpsError('failed-precondition', `Appointment status '${appointmentData?.status}' cannot be marked as failed`);
            }
            // Update appointment status to payment_failed
            transaction.update(appointmentRef, {
                status: 'payment_failed',
                payment: {
                    ...appointmentData.payment,
                    status: 'failed',
                    failedAt: firestore_1.FieldValue.serverTimestamp()
                },
                failedAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
            // Release the slot back to free
            if (appointmentData?.slotId) {
                const slotRef = db.collection('availability').doc(appointmentData.slotId);
                transaction.update(slotRef, {
                    status: 'free',
                    heldBy: firestore_1.FieldValue.delete(),
                    heldAt: firestore_1.FieldValue.delete(),
                    bookedBy: firestore_1.FieldValue.delete(),
                    bookedAt: firestore_1.FieldValue.delete(),
                    updatedAt: firestore_1.FieldValue.serverTimestamp()
                });
            }
        });
        // Log admin action
        await logAdminAction(adminId, 'admin_fail_payment', appointmentId);
        // Log successful failure
        console.log(`Admin payment failure successful: ${appointmentId} by admin ${adminId}`);
        return {
            success: true,
            message: 'Payment marked as failed successfully',
            appointmentId
        };
    }
    catch (error) {
        console.error('Error failing payment:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to mark payment as failed. Please try again.');
    }
});
