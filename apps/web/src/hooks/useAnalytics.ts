import { useCallback } from "react";

import { useAuth } from "./useAuth";

import {
  logEvent,
  logSignupEvent,
  logProfileCompleteEvent,
  logSlotCreatedEvent,
  logAppointmentConfirmedEvent,
  logPaymentAttemptEvent,
  logPaymentSuccessEvent,
  logPaymentFailedEvent,
  type AnalyticsEvent,
} from "@/lib/analytics";

export function useAnalytics() {
  const { user } = useAuth();

  const trackEvent = useCallback(
    async (action: AnalyticsEvent, entityId?: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track event: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logEvent(user.uid, action, entityId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking event:", error);
        return { success: false, error: "Failed to track event" };
      }
    },
    [user],
  );

  const trackSignup = useCallback(
    async (metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track signup: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logSignupEvent(user.uid, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking signup:", error);
        return { success: false, error: "Failed to track signup" };
      }
    },
    [user],
  );

  const trackProfileComplete = useCallback(
    async (metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track profile complete: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logProfileCompleteEvent(user.uid, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking profile complete:", error);
        return { success: false, error: "Failed to track profile complete" };
      }
    },
    [user],
  );

  const trackSlotCreated = useCallback(
    async (slotId: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track slot created: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logSlotCreatedEvent(user.uid, slotId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking slot created:", error);
        return { success: false, error: "Failed to track slot created" };
      }
    },
    [user],
  );

  const trackAppointmentConfirmed = useCallback(
    async (appointmentId: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track appointment confirmed: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logAppointmentConfirmedEvent(user.uid, appointmentId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking appointment confirmed:", error);
        return { success: false, error: "Failed to track appointment confirmed" };
      }
    },
    [user],
  );

  const trackPaymentAttempt = useCallback(
    async (appointmentId: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track payment attempt: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logPaymentAttemptEvent(user.uid, appointmentId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking payment attempt:", error);
        return { success: false, error: "Failed to track payment attempt" };
      }
    },
    [user],
  );

  const trackPaymentSuccess = useCallback(
    async (appointmentId: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track payment success: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logPaymentSuccessEvent(user.uid, appointmentId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking payment success:", error);
        return { success: false, error: "Failed to track payment success" };
      }
    },
    [user],
  );

  const trackPaymentFailed = useCallback(
    async (appointmentId: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track payment failed: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await logPaymentFailedEvent(user.uid, appointmentId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking payment failed:", error);
        return { success: false, error: "Failed to track payment failed" };
      }
    },
    [user],
  );

  return {
    trackEvent,
    trackSignup,
    trackProfileComplete,
    trackSlotCreated,
    trackAppointmentConfirmed,
    trackPaymentAttempt,
    trackPaymentSuccess,
    trackPaymentFailed,
  };
}
