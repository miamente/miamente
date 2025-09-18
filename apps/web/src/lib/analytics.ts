import { apiClient } from "./api";

export type AnalyticsEvent =
  | "signup"
  | "profile_complete"
  | "slot_created"
  | "appointment_confirmed"
  | "cta_click";

export interface EventLogEntry {
  user_id: string;
  action: AnalyticsEvent;
  entity_id?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an analytics event to the backend
 */
export async function logEvent(
  userId: string,
  action: AnalyticsEvent,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post("/analytics/events", {
      user_id: userId,
      action,
      entity_id: entityId,
      metadata,
    });

    return { success: true };
  } catch (error) {
    console.error("Error logging event:", error);
    return {
      success: false,
      error: "Failed to log event",
    };
  }
}

/**
 * Log signup event
 */
export async function logSignupEvent(userId: string, metadata?: Record<string, unknown>) {
  return logEvent(userId, "signup", undefined, metadata);
}

/**
 * Log profile completion event
 */
export async function logProfileCompleteEvent(userId: string, metadata?: Record<string, unknown>) {
  return logEvent(userId, "profile_complete", undefined, metadata);
}

/**
 * Log slot creation event
 */
export async function logSlotCreatedEvent(
  userId: string,
  slotId: string,
  metadata?: Record<string, unknown>,
) {
  return logEvent(userId, "slot_created", slotId, metadata);
}

/**
 * Log appointment confirmation event
 */
export async function logAppointmentConfirmedEvent(
  userId: string,
  appointmentId: string,
  metadata?: Record<string, unknown>,
) {
  return logEvent(userId, "appointment_confirmed", appointmentId, metadata);
}
