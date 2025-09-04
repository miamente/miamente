import { collection, addDoc } from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";

export type AnalyticsEvent =
  | "signup"
  | "profile_complete"
  | "slot_created"
  | "appointment_confirmed"
  | "payment_attempt"
  | "payment_success"
  | "payment_failed"
  | "cta_click";

export interface EventLogEntry {
  userId: string;
  action: AnalyticsEvent;
  entityId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Log an analytics event to Firestore
 */
export async function logEvent(
  userId: string,
  action: AnalyticsEvent,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const firestore = getFirebaseFirestore();

  try {
    const eventData: Omit<EventLogEntry, "timestamp"> = {
      userId,
      action,
      entityId,
      metadata,
    };

    await addDoc(collection(firestore, "event_log"), {
      ...eventData,
      timestamp: new Date(),
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
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "signup",
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging signup event:", error);
    return { success: false, error: "Failed to log signup event" };
  }
}

/**
 * Log profile completion event
 */
export async function logProfileCompleteEvent(userId: string, metadata?: Record<string, unknown>) {
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "profile_complete",
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging profile complete event:", error);
    return { success: false, error: "Failed to log profile complete event" };
  }
}

/**
 * Log slot creation event
 */
export async function logSlotCreatedEvent(
  userId: string,
  slotId: string,
  metadata?: Record<string, unknown>,
) {
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "slot_created",
      entityId: slotId,
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging slot created event:", error);
    return { success: false, error: "Failed to log slot created event" };
  }
}

/**
 * Log appointment confirmation event
 */
export async function logAppointmentConfirmedEvent(
  userId: string,
  appointmentId: string,
  metadata?: Record<string, unknown>,
) {
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "appointment_confirmed",
      entityId: appointmentId,
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging appointment confirmed event:", error);
    return { success: false, error: "Failed to log appointment confirmed event" };
  }
}

/**
 * Log payment attempt event
 */
export async function logPaymentAttemptEvent(
  userId: string,
  appointmentId: string,
  metadata?: Record<string, unknown>,
) {
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "payment_attempt",
      entityId: appointmentId,
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging payment attempt event:", error);
    return { success: false, error: "Failed to log payment attempt event" };
  }
}

/**
 * Log payment success event
 */
export async function logPaymentSuccessEvent(
  userId: string,
  appointmentId: string,
  metadata?: Record<string, unknown>,
) {
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "payment_success",
      entityId: appointmentId,
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging payment success event:", error);
    return { success: false, error: "Failed to log payment success event" };
  }
}

/**
 * Log payment failure event
 */
export async function logPaymentFailedEvent(
  userId: string,
  appointmentId: string,
  metadata?: Record<string, unknown>,
) {
  const firestore = getFirebaseFirestore();

  try {
    await addDoc(collection(firestore, "event_log"), {
      userId,
      action: "payment_failed",
      entityId: appointmentId,
      timestamp: new Date(),
      metadata,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging payment failed event:", error);
    return { success: false, error: "Failed to log payment failed event" };
  }
}
