export type AppointmentStatus = "pending_payment" | "paid" | "confirmed" | "completed" | "cancelled";
export interface Appointment {
    userId: string;
    proId: string;
    slotId: string;
    start: Date;
    end: Date;
    status: AppointmentStatus;
    paid: boolean;
    jitsiUrl?: string;
    sent24h?: boolean;
    sent1h?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface BookAppointmentRequest {
    proId: string;
    slotId: string;
}
export interface BookAppointmentResponse {
    success: boolean;
    appointmentId?: string;
    error?: string;
}
export interface SendEmailRequest {
    to: string;
    subject: string;
    html: string;
}
export interface SendEmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map