import { useCallback } from "react";

import { useAuth, getUserUid } from "./useAuth";

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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logEvent(userUid, action, entityId, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logSignupEvent(userUid, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logProfileCompleteEvent(userUid, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logSlotCreatedEvent(userUid, slotId, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logAppointmentConfirmedEvent(userUid, appointmentId, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logPaymentAttemptEvent(userUid, appointmentId, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logPaymentSuccessEvent(userUid, appointmentId, metadata);
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
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logPaymentFailedEvent(userUid, appointmentId, metadata);
        return result;
      } catch (error) {
        console.error("Error tracking payment failed:", error);
        return { success: false, error: "Failed to track payment failed" };
      }
    },
    [user],
  );

  const trackCTAClick = useCallback(
    async (ctaType: string, metadata?: Record<string, unknown>) => {
      if (!user) {
        console.warn("Cannot track CTA click: user not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      try {
        const userUid = getUserUid(user);
        if (!userUid) return { success: false, error: "User not authenticated" };
        const result = await logEvent(userUid, "cta_click", undefined, { ctaType, ...metadata });
        return result;
      } catch (error) {
        console.error("Error tracking CTA click:", error);
        return { success: false, error: "Failed to track CTA click" };
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
    trackCTAClick,
  };
}
