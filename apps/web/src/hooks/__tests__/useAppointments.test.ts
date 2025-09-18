import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAppointments, useAppointment } from "../useAppointments";
import { apiClient } from "@/lib/api";
import { AppointmentStatus } from "@/lib/types";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getUserAppointments: vi.fn(),
    bookAppointmentDirect: vi.fn(),
    cancelAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    getAppointment: vi.fn(),
  },
}));

describe("useAppointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useAppointments());

    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchAppointments).toBe("function");
    expect(typeof result.current.bookAppointment).toBe("function");
    expect(typeof result.current.cancelAppointment).toBe("function");
    expect(typeof result.current.updateAppointment).toBe("function");
  });

  it("should fetch appointments successfully", async () => {
    const mockAppointments = [
      {
        id: "apt-1",
        user_id: "user-1",
        professional_id: "prof-1",
        status: AppointmentStatus.CONFIRMED,
        paid: false,
        start_time: "2023-12-01T10:00:00Z",
        end_time: "2023-12-01T11:00:00Z",
        duration: 60,
        timezone: "America/Bogota",
        payment_amount_cents: 80000,
        payment_currency: "COP",
        payment_provider: "stripe",
        payment_status: "pending",
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
      {
        id: "apt-2",
        user_id: "user-1",
        professional_id: "prof-2",
        status: AppointmentStatus.COMPLETED,
        paid: true,
        start_time: "2023-12-02T14:00:00Z",
        end_time: "2023-12-02T15:00:00Z",
        duration: 60,
        timezone: "America/Bogota",
        payment_amount_cents: 100000,
        payment_currency: "COP",
        payment_provider: "stripe",
        payment_status: "succeeded",
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
    ];

    vi.mocked(apiClient.getUserAppointments).mockResolvedValue(mockAppointments);

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await result.current.fetchAppointments();
    });

    expect(result.current.appointments).toEqual(mockAppointments);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(apiClient.getUserAppointments).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch appointments error", async () => {
    vi.mocked(apiClient.getUserAppointments).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await result.current.fetchAppointments();
    });

    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("API Error");
  });

  it("should book appointment successfully", async () => {
    const mockBookingResponse = {
      appointment_id: "apt-new",
      jitsi_url: "https://meet.jit.si/room123",
      message: "Appointment booked successfully",
    };

    const mockAppointments = [
      {
        id: "apt-new",
        user_id: "user-1",
        professional_id: "prof-1",
        status: AppointmentStatus.CONFIRMED,
        paid: false,
        start_time: "2023-12-01T10:00:00Z",
        end_time: "2023-12-01T11:00:00Z",
        duration: 60,
        timezone: "America/Bogota",
        payment_amount_cents: 80000,
        payment_currency: "COP",
        payment_provider: "stripe",
        payment_status: "pending",
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
    ];

    vi.mocked(apiClient.bookAppointmentDirect).mockResolvedValue(mockBookingResponse);
    vi.mocked(apiClient.getUserAppointments).mockResolvedValue(mockAppointments);

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      const response = await result.current.bookAppointment(
        "prof-1",
        "2023-12-01T10:00:00Z",
        "2023-12-01T11:00:00Z",
      );
      expect(response).toEqual(mockBookingResponse);
    });

    expect(apiClient.bookAppointmentDirect).toHaveBeenCalledWith(
      "prof-1",
      "2023-12-01T10:00:00Z",
      "2023-12-01T11:00:00Z",
    );
    expect(apiClient.getUserAppointments).toHaveBeenCalledTimes(1);
    expect(result.current.appointments).toEqual(mockAppointments);
  });

  it("should handle book appointment error", async () => {
    vi.mocked(apiClient.bookAppointmentDirect).mockRejectedValue(new Error("Booking failed"));

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await expect(
        result.current.bookAppointment("prof-1", "2023-12-01T10:00:00Z", "2023-12-01T11:00:00Z"),
      ).rejects.toThrow("Booking failed");
    });

    expect(result.current.error).toBe("Booking failed");
  });

  it("should cancel appointment successfully", async () => {
    const mockAppointments = [
      {
        id: "apt-1",
        user_id: "user-1",
        professional_id: "prof-1",
        status: AppointmentStatus.CANCELLED,
        paid: false,
        start_time: "2023-12-01T10:00:00Z",
        end_time: "2023-12-01T11:00:00Z",
        duration: 60,
        timezone: "America/Bogota",
        payment_amount_cents: 80000,
        payment_currency: "COP",
        payment_provider: "stripe",
        payment_status: "cancelled",
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
    ];

    vi.mocked(apiClient.cancelAppointment).mockResolvedValue(mockAppointments[0]);
    vi.mocked(apiClient.getUserAppointments).mockResolvedValue(mockAppointments);

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await result.current.cancelAppointment("apt-1");
    });

    expect(apiClient.cancelAppointment).toHaveBeenCalledWith("apt-1");
    expect(apiClient.getUserAppointments).toHaveBeenCalledTimes(1);
    expect(result.current.appointments).toEqual(mockAppointments);
  });

  it("should handle cancel appointment error", async () => {
    vi.mocked(apiClient.cancelAppointment).mockRejectedValue(new Error("Cancellation failed"));

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await expect(result.current.cancelAppointment("apt-1")).rejects.toThrow(
        "Cancellation failed",
      );
    });

    expect(result.current.error).toBe("Cancellation failed");
  });

  it("should update appointment successfully", async () => {
    const initialAppointments = [
      {
        id: "apt-1",
        user_id: "user-1",
        professional_id: "prof-1",
        status: AppointmentStatus.CONFIRMED,
        paid: false,
        start_time: "2023-12-01T10:00:00Z",
        end_time: "2023-12-01T11:00:00Z",
        duration: 60,
        timezone: "America/Bogota",
        payment_amount_cents: 80000,
        payment_currency: "COP",
        payment_provider: "stripe",
        payment_status: "pending",
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
    ];

    const updatedAppointment = {
      ...initialAppointments[0],
      status: AppointmentStatus.COMPLETED,
      session_notes: "Great session!",
    };

    vi.mocked(apiClient.updateAppointment).mockResolvedValue(updatedAppointment);

    const { result } = renderHook(() => useAppointments());

    // First, set the initial appointments by calling fetchAppointments
    vi.mocked(apiClient.getUserAppointments).mockResolvedValue(initialAppointments);

    await act(async () => {
      await result.current.fetchAppointments();
    });

    // Now update the appointment
    await act(async () => {
      const response = await result.current.updateAppointment("apt-1", {
        status: AppointmentStatus.COMPLETED,
        session_notes: "Great session!",
      });
      expect(response).toEqual(updatedAppointment);
    });

    expect(apiClient.updateAppointment).toHaveBeenCalledWith("apt-1", {
      status: AppointmentStatus.COMPLETED,
      session_notes: "Great session!",
    });
    expect(result.current.appointments[0]).toEqual(updatedAppointment);
  });

  it("should handle update appointment error", async () => {
    vi.mocked(apiClient.updateAppointment).mockRejectedValue(new Error("Update failed"));

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await expect(
        result.current.updateAppointment("apt-1", { status: AppointmentStatus.COMPLETED }),
      ).rejects.toThrow("Update failed");
    });

    expect(result.current.error).toBe("Update failed");
  });
});

describe("useAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null appointment", () => {
    const { result } = renderHook(() => useAppointment("apt-1"));

    expect(result.current.appointment).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchAppointment).toBe("function");
  });

  it("should fetch single appointment successfully", async () => {
    const mockAppointment = {
      id: "apt-1",
      user_id: "user-1",
      professional_id: "prof-1",
      status: AppointmentStatus.CONFIRMED,
      paid: false,
      start_time: "2023-12-01T10:00:00Z",
      end_time: "2023-12-01T11:00:00Z",
      duration: 60,
      timezone: "America/Bogota",
      payment_amount_cents: 80000,
      payment_currency: "COP",
      payment_provider: "stripe",
      payment_status: "pending",
      created_at: "2023-11-01T00:00:00Z",
      updated_at: "2023-11-01T00:00:00Z",
    };

    vi.mocked(apiClient.getAppointment).mockResolvedValue(mockAppointment);

    const { result } = renderHook(() => useAppointment("apt-1"));

    await act(async () => {
      await result.current.fetchAppointment();
    });

    expect(result.current.appointment).toEqual(mockAppointment);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(apiClient.getAppointment).toHaveBeenCalledWith("apt-1");
  });

  it("should handle fetch single appointment error", async () => {
    vi.mocked(apiClient.getAppointment).mockRejectedValue(new Error("Appointment not found"));

    const { result } = renderHook(() => useAppointment("apt-1"));

    await act(async () => {
      await result.current.fetchAppointment();
    });

    expect(result.current.appointment).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Appointment not found");
  });

  it("should not fetch when appointmentId is empty", async () => {
    const { result } = renderHook(() => useAppointment(""));

    await act(async () => {
      await result.current.fetchAppointment();
    });

    expect(apiClient.getAppointment).not.toHaveBeenCalled();
    expect(result.current.appointment).toBe(null);
  });
});
