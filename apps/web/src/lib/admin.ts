import { apiClient } from "./api";

export interface AdminMetrics {
  totalUsers: number;
  newUsers7Days: number;
  newUsers30Days: number;
  verifiedProfessionals: number;
  totalProfessionals: number;
  confirmedAppointmentsToday: number;
  totalAppointmentsToday: number;
  paymentConversionRate: number;
}

export interface EventLogEntry {
  id: string;
  event_type: string;
  data: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
}

export interface ProfessionalSummary {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  isVerified: boolean;
  createdAt: string;
  appointmentCount: number;
  averageRating: number;
}

export interface AppointmentSummary {
  id: string;
  user_id: string;
  professional_id: string;
  start: string;
  end: string;
  status: string;
  paid: boolean;
  user_full_name?: string;
  professional_full_name?: string;
  professional_specialty?: string;
}

/**
 * Get admin dashboard metrics
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const response = await apiClient.get("/admin/metrics");
    const data = (response as any).data;
    return {
      totalUsers: data.total_users,
      newUsers7Days: data.new_users_7_days,
      newUsers30Days: data.new_users_30_days,
      verifiedProfessionals: data.verified_professionals,
      totalProfessionals: data.total_professionals,
      confirmedAppointmentsToday: data.confirmed_appointments_today,
      totalAppointmentsToday: data.total_appointments_today,
      paymentConversionRate: data.payment_conversion_rate,
    };
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    throw new Error("Failed to fetch admin metrics");
  }
}

/**
 * Get event log entries with pagination
 */
export async function getEventLogEntries(): Promise<EventLogEntry[]> {
// limitCount: number = 50,
// offset: number = 0,
  try {
    const response = await apiClient.get("/admin/event-log", {
      // params: { limit: limitCount, offset }, // TODO: Fix API client params
    });
    return (response as any).data;
  } catch (error) {
    console.error("Error fetching event log entries:", error);
    throw new Error("Failed to fetch event log entries");
  }
}

/**
 * Get professionals summary for admin management
 */
export async function getProfessionalsSummary(): Promise<ProfessionalSummary[]> {
  try {
    const response = await apiClient.get("/admin/professionals");
    const data = (response as any).data;
    return data.map((pro: Record<string, unknown>) => ({
      id: pro.id,
      fullName: pro.full_name,
      email: pro.email,
      specialty: pro.specialty,
      isVerified: pro.is_verified,
      createdAt: pro.created_at,
      appointmentCount: pro.appointment_count,
      averageRating: pro.average_rating,
    }));
  } catch (error) {
    console.error("Error fetching professionals summary:", error);
    throw new Error("Failed to fetch professionals summary");
  }
}

/**
 * Update professional verification status
 */
export async function updateProfessionalVerification(
  userId: string,
  isVerified: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/admin/professionals/${userId}/verify`, {
      is_verified: isVerified,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating professional verification:", error);
    return {
      success: false,
      error: "Failed to update verification status",
    };
  }
}

/**
 * Get appointments summary for admin management
 */
export async function getAppointmentsSummary(): Promise<AppointmentSummary[]> {
// limitCount: number = 50,
// offset: number = 0,
  try {
    const response = await apiClient.get("/admin/appointments", {
      // params: { limit: limitCount, offset }, // TODO: Fix API client params
    });
    return (response as any).data;
  } catch (error) {
    console.error("Error fetching appointments summary:", error);
    throw new Error("Failed to fetch appointments summary");
  }
}
