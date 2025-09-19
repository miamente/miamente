import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  logEvent,
  logSignupEvent,
  logProfileCompleteEvent,
  logSlotCreatedEvent,
  logAppointmentConfirmedEvent,
  type AnalyticsEvent,
} from "../analytics";
import { apiClient } from "../api";

// Mock the API client
vi.mock("../api", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe("analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("logEvent", () => {
    it("should log event successfully", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logEvent("user-123", "signup", "entity-123", { source: "email" });

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "signup",
        entity_id: "entity-123",
        metadata: { source: "email" },
      });
      expect(result).toEqual({ success: true });
    });

    it("should log event without entityId and metadata", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logEvent("user-123", "profile_complete");

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "profile_complete",
        entity_id: undefined,
        metadata: undefined,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle API errors", async () => {
      mockApiClient.post.mockRejectedValue(new Error("API Error"));

      const result = await logEvent("user-123", "signup");

      expect(result).toEqual({
        success: false,
        error: "Failed to log event",
      });
    });

    it("should handle different event types", async () => {
      mockApiClient.post.mockResolvedValue({});

      const eventTypes: AnalyticsEvent[] = [
        "signup",
        "profile_complete",
        "slot_created",
        "appointment_confirmed",
        "cta_click",
      ];

      for (const eventType of eventTypes) {
        await logEvent("user-123", eventType);
        expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
          user_id: "user-123",
          action: eventType,
          entity_id: undefined,
          metadata: undefined,
        });
      }
    });
  });

  describe("logSignupEvent", () => {
    it("should log signup event successfully", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logSignupEvent("user-123", { source: "email" });

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "signup",
        entity_id: undefined,
        metadata: { source: "email" },
      });
      expect(result).toEqual({ success: true });
    });

    it("should log signup event without metadata", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logSignupEvent("user-123");

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "signup",
        entity_id: undefined,
        metadata: undefined,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle errors", async () => {
      mockApiClient.post.mockRejectedValue(new Error("API Error"));

      const result = await logSignupEvent("user-123");

      expect(result).toEqual({
        success: false,
        error: "Failed to log event",
      });
    });
  });

  describe("logProfileCompleteEvent", () => {
    it("should log profile complete event successfully", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logProfileCompleteEvent("user-123", { profileType: "professional" });

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "profile_complete",
        entity_id: undefined,
        metadata: { profileType: "professional" },
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle errors", async () => {
      mockApiClient.post.mockRejectedValue(new Error("API Error"));

      const result = await logProfileCompleteEvent("user-123");

      expect(result).toEqual({
        success: false,
        error: "Failed to log event",
      });
    });
  });

  describe("logSlotCreatedEvent", () => {
    it("should log slot created event successfully", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logSlotCreatedEvent("user-123", "slot-456", { duration: 60 });

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "slot_created",
        entity_id: "slot-456",
        metadata: { duration: 60 },
      });
      expect(result).toEqual({ success: true });
    });

    it("should log slot created event without metadata", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logSlotCreatedEvent("user-123", "slot-456");

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "slot_created",
        entity_id: "slot-456",
        metadata: undefined,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle errors", async () => {
      mockApiClient.post.mockRejectedValue(new Error("API Error"));

      const result = await logSlotCreatedEvent("user-123", "slot-456");

      expect(result).toEqual({
        success: false,
        error: "Failed to log event",
      });
    });
  });

  describe("logAppointmentConfirmedEvent", () => {
    it("should log appointment confirmed event successfully", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logAppointmentConfirmedEvent("user-123", "appointment-789", {
        professionalId: "prof-123",
      });

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "appointment_confirmed",
        entity_id: "appointment-789",
        metadata: { professionalId: "prof-123" },
      });
      expect(result).toEqual({ success: true });
    });

    it("should log appointment confirmed event without metadata", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logAppointmentConfirmedEvent("user-123", "appointment-789");

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "appointment_confirmed",
        entity_id: "appointment-789",
        metadata: undefined,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle errors", async () => {
      mockApiClient.post.mockRejectedValue(new Error("API Error"));

      const result = await logAppointmentConfirmedEvent("user-123", "appointment-789");

      expect(result).toEqual({
        success: false,
        error: "Failed to log event",
      });
    });
  });

  describe("error handling", () => {
    it("should handle different types of errors", async () => {
      const errors = [
        new Error("Network error"),
        new Error("Server error"),
        "String error",
        { message: "Object error" },
        null,
        undefined,
      ];

      for (const error of errors) {
        mockApiClient.post.mockRejectedValueOnce(error);

        const result = await logEvent("user-123", "signup");

        expect(result).toEqual({
          success: false,
          error: "Failed to log event",
        });
      }
    });

    it("should log errors to console", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.post.mockRejectedValue(new Error("Test error"));

      await logEvent("user-123", "signup");

      expect(consoleSpy).toHaveBeenCalledWith("Error logging event:", expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe("metadata handling", () => {
    it("should handle complex metadata objects", async () => {
      mockApiClient.post.mockResolvedValue({});

      const complexMetadata = {
        source: "email",
        campaign: "winter-2024",
        userType: "professional",
        features: ["analytics", "reports"],
        settings: {
          notifications: true,
          theme: "dark",
        },
        timestamp: new Date().toISOString(),
      };

      const result = await logEvent("user-123", "cta_click", "button-123", complexMetadata);

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "cta_click",
        entity_id: "button-123",
        metadata: complexMetadata,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle empty metadata object", async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await logEvent("user-123", "signup", undefined, {});

      expect(mockApiClient.post).toHaveBeenCalledWith("/analytics/events", {
        user_id: "user-123",
        action: "signup",
        entity_id: undefined,
        metadata: {},
      });
      expect(result).toEqual({ success: true });
    });
  });
});
