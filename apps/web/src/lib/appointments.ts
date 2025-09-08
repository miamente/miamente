import { apiClient } from "./api";

export interface Appointment {
  id: string;
  user_id: string;
  professional_id: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  professional_id: string;
  start: string;
  end: string;
  notes?: string;
}

export async function createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  try {
    const response = await apiClient.post("/appointments", data);
    return (response as any).data;
  } catch (error) {
    console.error("Create appointment error:", error);
    throw error;
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const response = await apiClient.get("/appointments");
    return (response as any).data;
  } catch (error) {
    console.error("Get appointments error:", error);
    throw error;
  }
}

export async function getAppointment(id: string): Promise<Appointment> {
  try {
    const response = await apiClient.get(`/appointments/${id}`);
    return (response as any).data;
  } catch (error) {
    console.error("Get appointment error:", error);
    throw error;
  }
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>,
): Promise<Appointment> {
  try {
    const response = await apiClient.patch(`/appointments/${id}`, data);
    return (response as any).data;
  } catch (error) {
    console.error("Update appointment error:", error);
    throw error;
  }
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  try {
    const response = await apiClient.patch(`/appointments/${id}`, { status: "cancelled" });
    return (response as any).data;
  } catch (error) {
    console.error("Cancel appointment error:", error);
    throw error;
  }
}

// Legacy function for compatibility
export async function bookAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  return createAppointment(data);
}
