import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getEventLogEntries,
  getAppointmentChartData,
  getEventStats,
  getEventsByUser,
  getConversionFunnelData,
  type EventLogData,
  type AppointmentChartData,
  type EventStats,
} from "../analytics-admin";

// Mock the apiClient
vi.mock("../api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from "../api";
const mockApiClient = vi.mocked(apiClient);

describe("Analytics Admin Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEventLogEntries", () => {
    it("should fetch event log entries with default parameters", async () => {
      const mockData: EventLogData[] = [
        {
          id: "1",
          user_id: "user1",
          action: "login",
          timestamp: "2023-01-01T00:00:00Z",
          metadata: { source: "web" },
        },
        {
          id: "2",
          user_id: "user2",
          action: "signup",
          timestamp: "2023-01-01T01:00:00Z",
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getEventLogEntries();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/analytics/events");
      expect(result).toEqual(mockData);
    });

    it("should fetch event log entries with custom parameters", async () => {
      const mockData: EventLogData[] = [
        {
          id: "1",
          user_id: "user1",
          action: "login",
          timestamp: "2023-01-01T00:00:00Z",
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getEventLogEntries(50, 10, "login");

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/analytics/events");
      expect(result).toEqual(mockData);
    });

    it("should handle API errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.get.mockRejectedValue(new Error("API Error"));

      await expect(getEventLogEntries()).rejects.toThrow("Failed to fetch event log entries");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching event log entries:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getAppointmentChartData", () => {
    it("should fetch appointment chart data successfully", async () => {
      const mockData: AppointmentChartData[] = [
        {
          date: "2023-01-01",
          confirmed: 10,
          total: 15,
        },
        {
          date: "2023-01-02",
          confirmed: 8,
          total: 12,
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getAppointmentChartData();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/analytics/appointments/chart");
      expect(result).toEqual(mockData);
    });

    it("should handle API errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.get.mockRejectedValue(new Error("Network error"));

      await expect(getAppointmentChartData()).rejects.toThrow(
        "Failed to fetch appointment chart data",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching appointment chart data:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getEventStats", () => {
    it("should fetch event stats successfully", async () => {
      const mockData: EventStats = {
        total_events: 150,
        events_by_type: {
          login: 50,
          signup: 30,
          appointment: 70,
        },
        events_by_day: {
          "2023-01-01": 25,
          "2023-01-02": 30,
        },
        unique_users: 45,
      };

      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getEventStats();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/analytics/stats");
      expect(result).toEqual(mockData);
    });

    it("should handle API errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.get.mockRejectedValue(new Error("Server error"));

      await expect(getEventStats()).rejects.toThrow("Failed to fetch event stats");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching event stats:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("getEventsByUser", () => {
    it("should fetch events by user successfully", async () => {
      const userId = "user123";
      const mockData: EventLogData[] = [
        {
          id: "1",
          user_id: userId,
          action: "login",
          timestamp: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          user_id: userId,
          action: "appointment",
          entity_id: "apt123",
          timestamp: "2023-01-01T01:00:00Z",
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getEventsByUser(userId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/admin/analytics/users/${userId}/events`);
      expect(result).toEqual(mockData);
    });

    it("should handle API errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.get.mockRejectedValue(new Error("User not found"));

      await expect(getEventsByUser("invalid-user")).rejects.toThrow(
        "Failed to fetch events by user",
      );
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching events by user:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("getConversionFunnelData", () => {
    it("should fetch conversion funnel data successfully", async () => {
      const mockResponse = {
        data: {
          signups: 100,
          profile_completions: 80,
          slot_creations: 60,
          appointment_confirmations: 45,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getConversionFunnelData();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/analytics/funnel");
      expect(result).toEqual({
        signups: 100,
        profileCompletions: 80,
        slotCreations: 60,
        appointmentConfirmations: 45,
      });
    });

    it("should handle API errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.get.mockRejectedValue(new Error("Analytics service unavailable"));

      await expect(getConversionFunnelData()).rejects.toThrow(
        "Failed to fetch conversion funnel data",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching conversion funnel data:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle empty response", async () => {
      const mockResponse = {
        data: {
          signups: 0,
          profile_completions: 0,
          slot_creations: 0,
          appointment_confirmations: 0,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getConversionFunnelData();

      expect(result).toEqual({
        signups: 0,
        profileCompletions: 0,
        slotCreations: 0,
        appointmentConfirmations: 0,
      });
    });
  });
});
