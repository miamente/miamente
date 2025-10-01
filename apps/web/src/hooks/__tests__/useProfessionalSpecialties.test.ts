import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProfessionalSpecialties } from "../useProfessionalSpecialties";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionalSpecialties: vi.fn(),
    updateProfessionalSpecialties: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
const mockApiClient = vi.mocked(apiClient);

describe("useProfessionalSpecialties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state when professionalId is provided", async () => {
    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    expect(result.current.specialties).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should not load when professionalId is not provided", async () => {
    const { result } = renderHook(() => useProfessionalSpecialties());

    expect(result.current.specialties).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Should not call the API
    expect(mockApiClient.getProfessionalSpecialties).not.toHaveBeenCalled();
  });

  it("should fetch specialties successfully", async () => {
    const mockSpecialties = [
      {
        id: "1",
        professional_id: "prof-123",
        specialty_id: "spec-1",
        name: "Anxiety Treatment",
        price_cents: 50000,
        currency: "COP",
        is_default: true,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        professional_id: "prof-123",
        specialty_id: "spec-2",
        name: "Depression Treatment",
        price_cents: 60000,
        currency: "COP",
        is_default: false,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getProfessionalSpecialties.mockResolvedValue(mockSpecialties);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual(mockSpecialties);
    expect(result.current.error).toBe(null);
    expect(mockApiClient.getProfessionalSpecialties).toHaveBeenCalledWith("prof-123");
  });

  it("should handle API errors", async () => {
    mockApiClient.getProfessionalSpecialties.mockRejectedValue(
      new Error("Failed to fetch professional specialties"),
    );

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch professional specialties");
  });

  it("should handle network errors", async () => {
    mockApiClient.getProfessionalSpecialties.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockApiClient.getProfessionalSpecialties.mockResolvedValue([]);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle non-Error exceptions", async () => {
    mockApiClient.getProfessionalSpecialties.mockRejectedValue("String error");

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  it("should update specialties successfully", async () => {
    const mockSpecialties = [
      {
        id: "1",
        professional_id: "prof-123",
        specialty_id: "spec-1",
        name: "Anxiety Treatment",
        price_cents: 50000,
        currency: "COP",
        is_default: true,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getProfessionalSpecialties.mockResolvedValue([]);
    mockApiClient.updateProfessionalSpecialties.mockResolvedValue(mockSpecialties);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSpecialties(["spec-1"]);
    });

    expect(result.current.specialties).toEqual(mockSpecialties);
    expect(mockApiClient.updateProfessionalSpecialties).toHaveBeenCalledWith("prof-123", [
      "spec-1",
    ]);
  });

  it("should not update when professionalId is not provided", async () => {
    const { result } = renderHook(() => useProfessionalSpecialties());

    await act(async () => {
      await result.current.updateSpecialties(["spec-1"]);
    });

    expect(mockApiClient.updateProfessionalSpecialties).not.toHaveBeenCalled();
  });

  it("should handle update errors", async () => {
    mockApiClient.getProfessionalSpecialties.mockResolvedValue([]);
    mockApiClient.updateProfessionalSpecialties.mockRejectedValue(
      new Error("Failed to update professional specialties"),
    );

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSpecialties(["spec-1"]);
    });

    expect(result.current.error).toBe("Failed to update professional specialties");
  });

  it("should refetch when professionalId changes", async () => {
    const { result, rerender } = renderHook(
      ({ professionalId }) => useProfessionalSpecialties(professionalId),
      { initialProps: { professionalId: "prof-123" } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getProfessionalSpecialties).toHaveBeenCalledWith("prof-123");

    // Change professionalId
    rerender({ professionalId: "prof-456" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getProfessionalSpecialties).toHaveBeenCalledWith("prof-456");
    expect(mockApiClient.getProfessionalSpecialties).toHaveBeenCalledTimes(2);
  });
});
