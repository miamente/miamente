import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../api", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  bookAppointment,
  type CreateAppointmentRequest,
  type Appointment,
} from "../appointments";
import { apiClient } from "../api";

describe("appointments", () => {
  const mockAppointment: Appointment = {
    id: "appointment-1",
    user_id: "user-1",
    professional_id: "pro-1",
    start: "2024-01-15T10:00:00Z",
    end: "2024-01-15T11:00:00Z",
    status: "confirmed",
    notes: "Test appointment",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockCreateRequest: CreateAppointmentRequest = {
    professional_id: "pro-1",
    start: "2024-01-15T10:00:00Z",
    end: "2024-01-15T11:00:00Z",
    notes: "Test appointment",
  };

  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createAppointment", () => {
    it("should create an appointment successfully", async () => {
      mockApiClient.post.mockResolvedValue({ data: mockAppointment });

      const result = await createAppointment(mockCreateRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith("/appointments", mockCreateRequest);
      expect(result).toEqual(mockAppointment);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.post.mockRejectedValue(error);

      await expect(createAppointment(mockCreateRequest)).rejects.toThrow("API Error");
      expect(console.error).toHaveBeenCalledWith("Create appointment error:", error);
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockApiClient.post.mockRejectedValue(error);

      await expect(createAppointment(mockCreateRequest)).rejects.toThrow("Network error");
      expect(console.error).toHaveBeenCalledWith("Create appointment error:", error);
    });
  });

  describe("getAppointments", () => {
    it("should get all appointments successfully", async () => {
      const mockAppointments = [mockAppointment];
      mockApiClient.get.mockResolvedValue({ data: mockAppointments });

      const result = await getAppointments();

      expect(mockApiClient.get).toHaveBeenCalledWith("/appointments");
      expect(result).toEqual(mockAppointments);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getAppointments()).rejects.toThrow("API Error");
      expect(console.error).toHaveBeenCalledWith("Get appointments error:", error);
    });

    it("should handle empty response", async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await getAppointments();

      expect(result).toEqual([]);
    });
  });

  describe("getAppointment", () => {
    it("should get a specific appointment successfully", async () => {
      mockApiClient.get.mockResolvedValue({ data: mockAppointment });

      const result = await getAppointment("appointment-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/appointments/appointment-1");
      expect(result).toEqual(mockAppointment);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getAppointment("appointment-1")).rejects.toThrow("API Error");
      expect(console.error).toHaveBeenCalledWith("Get appointment error:", error);
    });

    it("should handle appointment not found", async () => {
      const error = new Error("Appointment not found");
      mockApiClient.get.mockRejectedValue(error);

      await expect(getAppointment("non-existent")).rejects.toThrow("Appointment not found");
      expect(console.error).toHaveBeenCalledWith("Get appointment error:", error);
    });
  });

  describe("updateAppointment", () => {
    it("should update an appointment successfully", async () => {
      const updateData = { notes: "Updated notes" };
      const updatedAppointment = { ...mockAppointment, notes: "Updated notes" };
      mockApiClient.patch.mockResolvedValue({ data: updatedAppointment });

      const result = await updateAppointment("appointment-1", updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith("/appointments/appointment-1", updateData);
      expect(result).toEqual(updatedAppointment);
    });

    it("should handle API errors", async () => {
      const updateData = { notes: "Updated notes" };
      const error = new Error("API Error");
      mockApiClient.patch.mockRejectedValue(error);

      await expect(updateAppointment("appointment-1", updateData)).rejects.toThrow("API Error");
      expect(console.error).toHaveBeenCalledWith("Update appointment error:", error);
    });

    it("should handle partial updates", async () => {
      const updateData = { status: "completed" as const };
      const updatedAppointment = { ...mockAppointment, status: "completed" as const };
      mockApiClient.patch.mockResolvedValue({ data: updatedAppointment });

      const result = await updateAppointment("appointment-1", updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith("/appointments/appointment-1", updateData);
      expect(result).toEqual(updatedAppointment);
    });
  });

  describe("cancelAppointment", () => {
    it("should cancel an appointment successfully", async () => {
      const cancelledAppointment = { ...mockAppointment, status: "cancelled" as const };
      mockApiClient.patch.mockResolvedValue({ data: cancelledAppointment });

      const result = await cancelAppointment("appointment-1");

      expect(mockApiClient.patch).toHaveBeenCalledWith("/appointments/appointment-1", {
        status: "cancelled",
      });
      expect(result).toEqual(cancelledAppointment);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.patch.mockRejectedValue(error);

      await expect(cancelAppointment("appointment-1")).rejects.toThrow("API Error");
      expect(console.error).toHaveBeenCalledWith("Cancel appointment error:", error);
    });

    it("should handle already cancelled appointment", async () => {
      const error = new Error("Appointment already cancelled");
      mockApiClient.patch.mockRejectedValue(error);

      await expect(cancelAppointment("appointment-1")).rejects.toThrow(
        "Appointment already cancelled",
      );
      expect(console.error).toHaveBeenCalledWith("Cancel appointment error:", error);
    });
  });

  describe("bookAppointment (legacy)", () => {
    it("should call createAppointment for compatibility", async () => {
      mockApiClient.post.mockResolvedValue({ data: mockAppointment });

      const result = await bookAppointment(mockCreateRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith("/appointments", mockCreateRequest);
      expect(result).toEqual(mockAppointment);
    });

    it("should handle errors the same way as createAppointment", async () => {
      const error = new Error("API Error");
      mockApiClient.post.mockRejectedValue(error);

      await expect(bookAppointment(mockCreateRequest)).rejects.toThrow("API Error");
      expect(console.error).toHaveBeenCalledWith("Create appointment error:", error);
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
        mockApiClient.post.mockRejectedValue(error);
        await expect(createAppointment(mockCreateRequest)).rejects.toBe(error);
      }
    });

    it("should log errors to console", async () => {
      const error = new Error("Test error");
      mockApiClient.post.mockRejectedValue(error);

      try {
        await createAppointment(mockCreateRequest);
      } catch {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith("Create appointment error:", error);
    });
  });
});
