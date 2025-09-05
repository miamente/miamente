import "./firebase-admin";
interface MockApprovePaymentRequest {
    appointmentId: string;
}
interface MockApprovePaymentResponse {
    success: boolean;
    message: string;
    appointmentId: string;
    jitsiUrl?: string;
}
/**
 * Mock Payment Approval Function
 *
 * This function simulates payment approval for development and testing.
 * It should only be available in development/staging environments.
 *
 * In production, this would be replaced by actual payment gateway webhooks.
 */
export declare const mockApprovePayment: import("firebase-functions/v2/https").CallableFunction<MockApprovePaymentRequest, Promise<MockApprovePaymentResponse>, unknown>;
export {};
//# sourceMappingURL=mock-payment.d.ts.map