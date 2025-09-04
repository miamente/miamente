export type AppointmentStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  userId: string;
  proId: string;
  slotId: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  paid: boolean;
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
