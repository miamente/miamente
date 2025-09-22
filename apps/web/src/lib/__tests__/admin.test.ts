import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdminMetrics,
  getEventLogEntries,
  getProfessionalsSummary,
  updateProfessionalVerification,
  getAppointmentsSummary,
  type AdminMetrics,
  type EventLogEntry,
  type ProfessionalSummary,
  type AppointmentSummary,
} from "../admin";

// Mock the apiClient
vi.mock("../api", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from "../api";
const mockApiClient = vi.mocked(apiClient);

describe("Admin Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Mock console.error
  });

  describe("getAdminMetrics", () => {
    it("should fetch admin metrics successfully", async () => {
      const mockMetrics: AdminMetrics = {
        total_users: 100,
        new_users_7_days: 10,
        new_users_30_days: 40,
        verified_professionals: 50,
        total_professionals: 60,
        confirmed_appointments_today: 5,
        total_appointments_today: 8,
      };

      mockApiClient.get.mockResolvedValue({ data: mockMetrics });

      const result = await getAdminMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/metrics");
      expect(result).toEqual(mockMetrics);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getAdminMetrics()).rejects.toThrow("Failed to fetch admin metrics");
      expect(console.error).toHaveBeenCalledWith("Error fetching admin metrics:", error);
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getAdminMetrics()).rejects.toThrow("Failed to fetch admin metrics");
      expect(console.error).toHaveBeenCalledWith("Error fetching admin metrics:", error);
    });
  });

  describe("getEventLogEntries", () => {
    it("should fetch event log entries successfully", async () => {
      const mockEntries: EventLogEntry[] = [
        {
          id: "1",
          event_type: "user_login",
          data: { user_id: "123" },
          timestamp: "2023-01-01T00:00:00Z",
          user_id: "123",
        },
        {
          id: "2",
          event_type: "appointment_created",
          data: { appointment_id: "456" },
          timestamp: "2023-01-01T01:00:00Z",
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockEntries });

      const result = await getEventLogEntries();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/event-log", {});
      expect(result).toEqual(mockEntries);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getEventLogEntries()).rejects.toThrow("Failed to fetch event log entries");
      expect(console.error).toHaveBeenCalledWith("Error fetching event log entries:", error);
    });

    it("should handle empty response", async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await getEventLogEntries();

      expect(result).toEqual([]);
    });
  });

  describe("getProfessionalsSummary", () => {
    it("should fetch professionals summary successfully", async () => {
      const mockProfessionals: ProfessionalSummary[] = [
        {
          id: "1",
          fullName: "Dr. Juan Pérez",
          email: "juan@example.com",
          specialty: "Psicología",
          isVerified: true,
          createdAt: "2023-01-01T00:00:00Z",
          appointmentCount: 50,
          averageRating: 4.5,
        },
        {
          id: "2",
          fullName: "Dr. María García",
          email: "maria@example.com",
          specialty: "Psiquiatría",
          isVerified: false,
          createdAt: "2023-01-02T00:00:00Z",
          appointmentCount: 30,
          averageRating: 4.2,
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockProfessionals });

      const result = await getProfessionalsSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/professionals");
      expect(result).toEqual(mockProfessionals);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getProfessionalsSummary()).rejects.toThrow(
        "Failed to fetch professionals summary",
      );
      expect(console.error).toHaveBeenCalledWith("Error fetching professionals summary:", error);
    });

    it("should handle empty response", async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await getProfessionalsSummary();

      expect(result).toEqual([]);
    });
  });

  describe("updateProfessionalVerification", () => {
    it("should update professional verification successfully", async () => {
      mockApiClient.patch.mockResolvedValue({ data: { success: true } });

      const result = await updateProfessionalVerification("user123", true);

      expect(mockApiClient.patch).toHaveBeenCalledWith("/admin/professionals/user123/verify", {
        is_verified: true,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.patch.mockRejectedValue(error);

      const result = await updateProfessionalVerification("user123", false);

      expect(result).toEqual({
        success: false,
        error: "Failed to update verification status",
      });
      expect(console.error).toHaveBeenCalledWith(
        "Error updating professional verification:",
        error,
      );
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockApiClient.patch.mockRejectedValue(error);

      const result = await updateProfessionalVerification("user123", true);

      expect(result).toEqual({
        success: false,
        error: "Failed to update verification status",
      });
      expect(console.error).toHaveBeenCalledWith(
        "Error updating professional verification:",
        error,
      );
    });
  });

  describe("getAppointmentsSummary", () => {
    it("should fetch appointments summary successfully", async () => {
      const mockAppointments: AppointmentSummary[] = [
        {
          id: "1",
          user_id: "user123",
          professional_id: "prof456",
          start: "2023-01-01T10:00:00Z",
          end: "2023-01-01T11:00:00Z",
          status: "confirmed",
          paid: true,
          user_full_name: "Juan Pérez",
          professional_full_name: "Dr. María García",
          professional_specialty: "Psicología",
        },
        {
          id: "2",
          user_id: "user789",
          professional_id: "prof101",
          start: "2023-01-01T14:00:00Z",
          end: "2023-01-01T15:00:00Z",
          status: "pending",
          paid: false,
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockAppointments });

      const result = await getAppointmentsSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/appointments", {});
      expect(result).toEqual(mockAppointments);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getAppointmentsSummary()).rejects.toThrow(
        "Failed to fetch appointments summary",
      );
      expect(console.error).toHaveBeenCalledWith("Error fetching appointments summary:", error);
    });

    it("should handle empty response", async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await getAppointmentsSummary();

      expect(result).toEqual([]);
    });
  });
});
