import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProfessionalSpecialties } from "../useProfessionalSpecialties";

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe("useProfessionalSpecialties", () => {
  const mockSpecialties = [
    {
      id: "ps-1",
      professionalId: "prof-123",
      specialtyId: "spec-1",
      specialty: {
        id: "spec-1",
        name: "Anxiety",
        description: "Treatment for anxiety disorders",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    },
    {
      id: "ps-2",
      professionalId: "prof-123",
      specialtyId: "spec-2",
      specialty: {
        id: "spec-2",
        name: "Depression",
        description: "Treatment for depression",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state when professionalId is provided", () => {
    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    expect(result.current.specialties).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should not load when professionalId is not provided", () => {
    const { result } = renderHook(() => useProfessionalSpecialties());

    expect(result.current.specialties).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should fetch specialties successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSpecialties),
    } as Response);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual(mockSpecialties);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-specialties/professional/prof-123`,
    );
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch professional specialties");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle non-Error exceptions", async () => {
    mockFetch.mockRejectedValue("String error");

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  describe("updateSpecialties", () => {
    it("should update specialties successfully", async () => {
      const updatedSpecialties = [
        {
          id: "ps-1",
          professionalId: "prof-123",
          specialtyId: "spec-1",
          specialty: {
            id: "spec-1",
            name: "Anxiety",
            description: "Treatment for anxiety disorders",
            is_active: true,
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        },
      ];

      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpecialties),
      } as Response);

      // Mock update fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedSpecialties),
      } as Response);

      const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSpecialties(["spec-1"]);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-specialties/professional/prof-123/specialties`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["spec-1"]),
        },
      );

      expect(result.current.specialties).toEqual(updatedSpecialties);
    });

    it("should not update when professionalId is not provided", async () => {
      const { result } = renderHook(() => useProfessionalSpecialties());

      await act(async () => {
        await result.current.updateSpecialties(["spec-1"]);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle update errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

      await act(async () => {
        await result.current.updateSpecialties(["spec-1"]);
      });

      expect(result.current.error).toBe("Failed to update professional specialties");
    });
  });

  it("should refetch when professionalId changes", async () => {
    const { result, rerender } = renderHook(
      ({ professionalId }) => useProfessionalSpecialties(professionalId),
      { initialProps: { professionalId: "prof-123" } },
    );

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSpecialties),
    } as Response);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change professionalId
    rerender({ professionalId: "prof-456" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-specialties/professional/prof-456`,
    );
  });

  it("should handle empty response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle malformed JSON response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as Response);

    const { result } = renderHook(() => useProfessionalSpecialties("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });
});
