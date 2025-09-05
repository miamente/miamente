import "./firebase-admin";
interface BookAppointmentRequest {
    proId: string;
    slotId: string;
}
interface BookAppointmentResponse {
    appointmentId: string;
}
/**
 * Book an appointment with transaction handling to prevent double booking
 */
export declare const bookAppointment: import("firebase-functions/v2/https").CallableFunction<BookAppointmentRequest, Promise<BookAppointmentResponse>, unknown>;
/**
 * Get appointment details by ID
 */
export declare const getAppointment: import("firebase-functions/v2/https").CallableFunction<{
    appointmentId: string;
}, Promise<any>, unknown>;
/**
 * Cancel an appointment (only if not paid)
 */
export declare const cancelAppointment: import("firebase-functions/v2/https").CallableFunction<{
    appointmentId: string;
}, Promise<void>, unknown>;
export {};
//# sourceMappingURL=appointments.d.ts.map