import { apiClient } from "./api";

export interface EventLogData {
  id: string;
  user_id: string;
  action: string;
  entity_id?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AppointmentChartData {
  date: string;
  confirmed: number;
  total: number;
}

export interface EventStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_day: Record<string, number>;
  unique_users: number;
}

/**
 * Get event log entries with pagination and filtering
 */
export async function getEventLogEntries(
  limitCount: number = 100,
  offset: number = 0,
  actionFilter?: string,
): Promise<EventLogData[]> {
  try {
    const params: Record<string, unknown> = { limit: limitCount, offset };
    if (actionFilter) {
      params.action = actionFilter;
    }

    const response = await apiClient.get("/admin/analytics/events"); // TODO: Fix params
    return (response as any).data;
  } catch (error) {
    console.error("Error fetching event log entries:", error);
    throw new Error("Failed to fetch event log entries");
  }
}

/**
 * Get appointment confirmation data for the last 30 days
 */
export async function getAppointmentChartData(): Promise<AppointmentChartData[]> {
  try {
    const response = await apiClient.get("/admin/analytics/appointments/chart");
    return (response as any).data;
  } catch (error) {
    console.error("Error fetching appointment chart data:", error);
    throw new Error("Failed to fetch appointment chart data");
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(): Promise<EventStats> {
  try {
    const response = await apiClient.get("/admin/analytics/stats");
    return (response as any).data;
  } catch (error) {
    console.error("Error fetching event stats:", error);
    throw new Error("Failed to fetch event stats");
  }
}

/**
 * Get events by user
 */
export async function getEventsByUser(userId: string): Promise<EventLogData[]> {
  try {
    const response = await apiClient.get(`/admin/analytics/users/${userId}/events`);
    return (response as any).data;
  } catch (error) {
    console.error("Error fetching events by user:", error);
    throw new Error("Failed to fetch events by user");
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnelData(): Promise<{
  signups: number;
  profileCompletions: number;
  slotCreations: number;
  appointmentConfirmations: number;
  paymentAttempts: number;
  paymentSuccesses: number;
}> {
  try {
    const response = await apiClient.get("/admin/analytics/funnel");
    const data = (response as any).data;
    return {
      signups: data.signups,
      profileCompletions: data.profile_completions,
      slotCreations: data.slot_creations,
      appointmentConfirmations: data.appointment_confirmations,
      paymentAttempts: data.payment_attempts,
      paymentSuccesses: data.payment_successes,
    };
  } catch (error) {
    console.error("Error fetching conversion funnel data:", error);
    throw new Error("Failed to fetch conversion funnel data");
  }
}
