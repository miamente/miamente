import "./firebase-admin";
interface AdminConfirmPaymentRequest {
    appointmentId: string;
}
interface AdminFailPaymentRequest {
    appointmentId: string;
}
interface AdminPaymentResponse {
    success: boolean;
    message: string;
    appointmentId: string;
    jitsiUrl?: string;
}
/**
 * Admin Confirm Payment Function
 *
 * Allows admin users to confirm payments for appointments.
 * Changes appointment status to confirmed, marks as paid, updates slot to booked,
 * generates Jitsi URL, and sends confirmation email.
 */
export declare const adminConfirmPayment: import("firebase-functions/v2/https").CallableFunction<AdminConfirmPaymentRequest, Promise<AdminPaymentResponse>, unknown>;
/**
 * Admin Fail Payment Function
 *
 * Allows admin users to mark payments as failed.
 * Changes appointment status to payment_failed and releases the slot.
 */
export declare const adminFailPayment: import("firebase-functions/v2/https").CallableFunction<AdminFailPaymentRequest, Promise<AdminPaymentResponse>, unknown>;
export {};
//# sourceMappingURL=admin-payments.d.ts.map