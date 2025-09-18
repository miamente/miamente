import { useCallback } from "react";

import { useAuth, getUserUid } from "./useAuth";

import {
  logEvent,
  logSignupEvent,
  logProfileCompleteEvent,
  logSlotCreatedEvent,
  logAppointmentConfirmedEvent,
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
    trackCTAClick,
  };
}
