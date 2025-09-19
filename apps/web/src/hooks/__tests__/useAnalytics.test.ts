import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAnalytics } from "../useAnalytics";
import { useAuth } from "../useAuth";
import { UserRole } from "@/lib/types";
import * as analytics from "@/lib/analytics";

// Mock the useAuth hook
vi.mock("../useAuth", () => ({
  useAuth: vi.fn(),
  getUserUid: vi.fn((user) => user?.data?.id),
}));
vi.mock("@/lib/analytics");

const mockUseAuth = vi.mocked(useAuth);
const mockAnalytics = vi.mocked(analytics);

describe("useAnalytics", () => {
  const mockUser = {
    type: "user" as UserRole,
    data: {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      is_verified: true,
      is_active: true,
      phone: "+1234567890",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("trackEvent", () => {
    it("should track event successfully when user is authenticated", async () => {
      const mockResult = { success: true, eventId: "event-123" };
      mockAnalytics.logEvent.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackEvent("cta_click", "page-123", { page: "home" });
      });

      expect(mockAnalytics.logEvent).toHaveBeenCalledWith("user-123", "cta_click", "page-123", {
        page: "home",
      });
      expect(trackResult).toEqual(mockResult);
    });

    it("should return error when user is not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        loginUser: vi.fn(),
        loginProfessional: vi.fn(),
        registerUser: vi.fn(),
        registerProfessional: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        getAuthHeaders: vi.fn(),
      });

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackEvent("cta_click");
      });

      expect(mockAnalytics.logEvent).not.toHaveBeenCalled();
      expect(trackResult).toEqual({ success: false, error: "User not authenticated" });
    });

    it("should handle analytics errors gracefully", async () => {
      mockAnalytics.logEvent.mockRejectedValue(new Error("Analytics error"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackEvent("cta_click");
      });

      expect(trackResult).toEqual({ success: false, error: "Failed to track event" });
    });
  });

  describe("trackSignup", () => {
    it("should track signup successfully", async () => {
      const mockResult = { success: true, eventId: "signup-123" };
      mockAnalytics.logSignupEvent.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackSignup({ source: "email" });
      });

      expect(mockAnalytics.logSignupEvent).toHaveBeenCalledWith("user-123", { source: "email" });
      expect(trackResult).toEqual(mockResult);
    });

    it("should return error when user is not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        loginUser: vi.fn(),
        loginProfessional: vi.fn(),
        registerUser: vi.fn(),
        registerProfessional: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        getAuthHeaders: vi.fn(),
      });

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackSignup();
      });

      expect(trackResult).toEqual({ success: false, error: "User not authenticated" });
    });
  });

  describe("trackProfileComplete", () => {
    it("should track profile complete successfully", async () => {
      const mockResult = { success: true, eventId: "profile-123" };
      mockAnalytics.logProfileCompleteEvent.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackProfileComplete({ profileType: "professional" });
      });

      expect(mockAnalytics.logProfileCompleteEvent).toHaveBeenCalledWith("user-123", {
        profileType: "professional",
      });
      expect(trackResult).toEqual(mockResult);
    });
  });

  describe("trackSlotCreated", () => {
    it("should track slot created successfully", async () => {
      const mockResult = { success: true, eventId: "slot-123" };
      mockAnalytics.logSlotCreatedEvent.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackSlotCreated("slot-123", { duration: 60 });
      });

      expect(mockAnalytics.logSlotCreatedEvent).toHaveBeenCalledWith("user-123", "slot-123", {
        duration: 60,
      });
      expect(trackResult).toEqual(mockResult);
    });
  });

  describe("trackAppointmentConfirmed", () => {
    it("should track appointment confirmed successfully", async () => {
      const mockResult = { success: true, eventId: "appointment-123" };
      mockAnalytics.logAppointmentConfirmedEvent.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackAppointmentConfirmed("appointment-123", {
          professionalId: "prof-123",
        });
      });

      expect(mockAnalytics.logAppointmentConfirmedEvent).toHaveBeenCalledWith(
        "user-123",
        "appointment-123",
        { professionalId: "prof-123" },
      );
      expect(trackResult).toEqual(mockResult);
    });
  });

  describe("trackCTAClick", () => {
    it("should track CTA click successfully", async () => {
      const mockResult = { success: true, eventId: "cta-123" };
      mockAnalytics.logEvent.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackCTAClick("book_appointment", {
          location: "header",
        });
      });

      expect(mockAnalytics.logEvent).toHaveBeenCalledWith("user-123", "cta_click", undefined, {
        ctaType: "book_appointment",
        location: "header",
      });
      expect(trackResult).toEqual(mockResult);
    });
  });

  describe("error handling", () => {
    it("should handle errors in trackEvent", async () => {
      mockAnalytics.logEvent.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackEvent("cta_click");
      });

      expect(trackResult).toEqual({ success: false, error: "Failed to track event" });
    });

    it("should handle errors in trackSignup", async () => {
      mockAnalytics.logSignupEvent.mockRejectedValue(new Error("Analytics service down"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackSignup();
      });

      expect(trackResult).toEqual({ success: false, error: "Failed to track signup" });
    });

    it("should handle errors in trackProfileComplete", async () => {
      mockAnalytics.logProfileCompleteEvent.mockRejectedValue(new Error("Profile error"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackProfileComplete();
      });

      expect(trackResult).toEqual({ success: false, error: "Failed to track profile complete" });
    });

    it("should handle errors in trackSlotCreated", async () => {
      mockAnalytics.logSlotCreatedEvent.mockRejectedValue(new Error("Slot error"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackSlotCreated("slot-123");
      });

      expect(trackResult).toEqual({ success: false, error: "Failed to track slot created" });
    });

    it("should handle errors in trackAppointmentConfirmed", async () => {
      mockAnalytics.logAppointmentConfirmedEvent.mockRejectedValue(new Error("Appointment error"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackAppointmentConfirmed("appointment-123");
      });

      expect(trackResult).toEqual({
        success: false,
        error: "Failed to track appointment confirmed",
      });
    });

    it("should handle errors in trackCTAClick", async () => {
      mockAnalytics.logEvent.mockRejectedValue(new Error("CTA error"));

      const { result } = renderHook(() => useAnalytics());

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackCTAClick("book_appointment");
      });

      expect(trackResult).toEqual({ success: false, error: "Failed to track CTA click" });
    });
  });

  describe("callback dependencies", () => {
    it("should recreate callbacks when user changes", () => {
      const { result, rerender } = renderHook(() => useAnalytics());

      const initialTrackEvent = result.current.trackEvent;

      // Change user
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, data: { ...mockUser.data, id: "user-456" } },
        isLoading: false,
        isAuthenticated: true,
        loginUser: vi.fn(),
        loginProfessional: vi.fn(),
        registerUser: vi.fn(),
        registerProfessional: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        getAuthHeaders: vi.fn(),
      });

      rerender();

      expect(result.current.trackEvent).not.toBe(initialTrackEvent);
    });
  });
});
