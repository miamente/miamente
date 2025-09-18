import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useProfessionals, useProfessional } from "../useProfessionals";
import { apiClient } from "@/lib/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionals: vi.fn(),
    getProfessional: vi.fn(),
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
