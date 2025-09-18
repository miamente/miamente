import { apiClient } from "./api";

export interface AdminMetrics {
  total_users: number;
  new_users_7_days: number;
  new_users_30_days: number;
  verified_professionals: number;
  total_professionals: number;
  confirmed_appointments_today: number;
  total_appointments_today: number;
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
    const data = (response as { data: AdminMetrics }).data;
    return {
      total_users: data.total_users,
      new_users_7_days: data.new_users_7_days,
      new_users_30_days: data.new_users_30_days,
      verified_professionals: data.verified_professionals,
      total_professionals: data.total_professionals,
      confirmed_appointments_today: data.confirmed_appointments_today,
      total_appointments_today: data.total_appointments_today,
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
    return (response as { data: EventLogEntry[] }).data;
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
    const data = (response as { data: ProfessionalSummary[] }).data;
    return data.map((pro: ProfessionalSummary) => ({
      id: pro.id,
      fullName: pro.fullName,
      email: pro.email,
      specialty: pro.specialty,
      isVerified: pro.isVerified,
      createdAt: pro.createdAt,
      appointmentCount: pro.appointmentCount,
      averageRating: pro.averageRating,
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
    return (response as { data: AppointmentSummary[] }).data;
  } catch (error) {
    console.error("Error fetching appointments summary:", error);
    throw new Error("Failed to fetch appointments summary");
  }
}
