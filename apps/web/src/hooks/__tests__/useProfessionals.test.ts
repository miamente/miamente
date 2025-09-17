import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  useProfessionals,
  useProfessional,
  useProfessionalAvailability,
} from "../useProfessionals";
import { apiClient } from "@/lib/api";
import { SlotStatus } from "@/lib/types";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionals: vi.fn(),
    getProfessional: vi.fn(),
    getProfessionalAvailability: vi.fn(),
    createAvailability: vi.fn(),
  },
}));

describe("useProfessionals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useProfessionals());

    expect(result.current.professionals).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchProfessionals).toBe("function");
  });

  it("should fetch professionals successfully", async () => {
    const mockProfessionals = [
      {
        id: "prof-1",
        email: "prof1@example.com",
        full_name: "Dr. Smith",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        license_number: "LIC123",
        years_experience: 5,
        rate_cents: 50000,
        currency: "COP",
        bio: "Experienced therapist",
        academic_experience: [],
        work_experience: [],
        certifications: [],
        languages: [],
        therapy_approaches_ids: [],
        specialty_ids: [],
        modalities: [],
        timezone: "America/Bogota",
      },
      {
        id: "prof-2",
        email: "prof2@example.com",
        full_name: "Dr. Johnson",
        is_verified: true,
        is_active: true,
        phone: "+1234567891",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        license_number: "LIC456",
        years_experience: 10,
        rate_cents: 75000,
        currency: "COP",
        bio: "Senior therapist",
        academic_experience: [],
        work_experience: [],
        certifications: [],
        languages: [],
        therapy_approaches_ids: [],
        specialty_ids: [],
        modalities: [],
        timezone: "America/Bogota",
      },
    ];

    const mockResponse = {
      data: mockProfessionals,
      total: 2,
      page: 1,
      per_page: 10,
      total_pages: 1,
    };

    vi.mocked(apiClient.getProfessionals).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useProfessionals());

    await act(async () => {
      await result.current.fetchProfessionals();
    });

    expect(result.current.professionals).toEqual(mockProfessionals);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(apiClient.getProfessionals).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch professionals error", async () => {
    vi.mocked(apiClient.getProfessionals).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useProfessionals());

    await act(async () => {
      await result.current.fetchProfessionals();
    });

    expect(result.current.professionals).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("API Error");
  });
});

describe("useProfessional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null professional", () => {
    const { result } = renderHook(() => useProfessional("prof-1"));

    expect(result.current.professional).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchProfessional).toBe("function");
  });

  it("should fetch single professional successfully", async () => {
    const mockProfessional = {
      id: "prof-1",
      email: "prof1@example.com",
      full_name: "Dr. Smith",
      is_verified: true,
      is_active: true,
      phone: "+1234567890",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      license_number: "LIC123",
      years_experience: 5,
      rate_cents: 50000,
      currency: "COP",
      bio: "Experienced therapist",
      academic_experience: [],
      work_experience: [],
      certifications: [],
      languages: [],
      therapy_approaches_ids: [],
      specialty_ids: [],
      modalities: [],
      timezone: "America/Bogota",
    };

    vi.mocked(apiClient.getProfessional).mockResolvedValue(mockProfessional);

    const { result } = renderHook(() => useProfessional("prof-1"));

    await act(async () => {
      await result.current.fetchProfessional();
    });

    expect(result.current.professional).toEqual(mockProfessional);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(apiClient.getProfessional).toHaveBeenCalledWith("prof-1");
  });

  it("should handle fetch single professional error", async () => {
    vi.mocked(apiClient.getProfessional).mockRejectedValue(new Error("Professional not found"));

    const { result } = renderHook(() => useProfessional("prof-1"));

    await act(async () => {
      await result.current.fetchProfessional();
    });

    expect(result.current.professional).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Professional not found");
  });

  it("should not fetch when professionalId is empty", async () => {
    const { result } = renderHook(() => useProfessional(""));

    await act(async () => {
      await result.current.fetchProfessional();
    });

    expect(apiClient.getProfessional).not.toHaveBeenCalled();
    expect(result.current.professional).toBe(null);
  });
});

describe("useProfessionalAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useProfessionalAvailability("prof-1"));

    expect(result.current.availability).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchAvailability).toBe("function");
    expect(typeof result.current.createAvailability).toBe("function");
  });

  it("should fetch availability successfully", async () => {
    const mockAvailability = [
      {
        id: "avail-1",
        professional_id: "prof-1",
        date: "2023-12-01",
        time: "09:00",
        duration: 480,
        timezone: "America/Bogota",
        status: SlotStatus.FREE,
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
      {
        id: "avail-2",
        professional_id: "prof-1",
        date: "2023-12-02",
        time: "09:00",
        duration: 480,
        timezone: "America/Bogota",
        status: SlotStatus.FREE,
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2023-11-01T00:00:00Z",
      },
    ];

    vi.mocked(apiClient.getProfessionalAvailability).mockResolvedValue(mockAvailability);

    const { result } = renderHook(() => useProfessionalAvailability("prof-1"));

    await act(async () => {
      await result.current.fetchAvailability();
    });

    expect(result.current.availability).toEqual(mockAvailability);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(apiClient.getProfessionalAvailability).toHaveBeenCalledWith("prof-1");
  });

  it("should handle fetch availability error", async () => {
    vi.mocked(apiClient.getProfessionalAvailability).mockRejectedValue(
      new Error("Availability not found"),
    );

    const { result } = renderHook(() => useProfessionalAvailability("prof-1"));

    await act(async () => {
      await result.current.fetchAvailability();
    });

    expect(result.current.availability).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Availability not found");
  });

  it("should not fetch when professionalId is empty", async () => {
    const { result } = renderHook(() => useProfessionalAvailability(""));

    await act(async () => {
      await result.current.fetchAvailability();
    });

    expect(apiClient.getProfessionalAvailability).not.toHaveBeenCalled();
    expect(result.current.availability).toEqual([]);
  });

  it("should create availability successfully", async () => {
    const newAvailabilityData = {
      professional_id: "prof-1",
      date: "2023-12-03",
      time: "09:00",
      duration: 480,
      timezone: "America/Bogota",
      status: SlotStatus.FREE,
    };

    const createdAvailability = {
      id: "avail-new",
      ...newAvailabilityData,
      created_at: "2023-11-01T00:00:00Z",
      updated_at: "2023-11-01T00:00:00Z",
    };

    vi.mocked(apiClient.createAvailability).mockResolvedValue(createdAvailability);

    const { result } = renderHook(() => useProfessionalAvailability("prof-1"));

    await act(async () => {
      const response = await result.current.createAvailability(newAvailabilityData);
      expect(response).toEqual(createdAvailability);
    });

    expect(apiClient.createAvailability).toHaveBeenCalledWith("prof-1", newAvailabilityData);
    expect(result.current.availability).toContain(createdAvailability);
  });

  it("should handle create availability error", async () => {
    const newAvailabilityData = {
      professional_id: "prof-1",
      date: "2023-12-03",
      time: "09:00",
      duration: 480,
      timezone: "America/Bogota",
      status: SlotStatus.FREE,
    };

    vi.mocked(apiClient.createAvailability).mockRejectedValue(new Error("Creation failed"));

    const { result } = renderHook(() => useProfessionalAvailability("prof-1"));

    await act(async () => {
      await expect(result.current.createAvailability(newAvailabilityData)).rejects.toThrow(
        "Creation failed",
      );
    });

    expect(result.current.error).toBe("Creation failed");
  });
});
