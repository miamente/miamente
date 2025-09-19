import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProfessionalTherapeuticApproaches } from "../useProfessionalTherapeuticApproaches";

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe("useProfessionalTherapeuticApproaches", () => {
  const mockApproaches = [
    {
      id: "pta-1",
      professionalId: "prof-123",
      approachId: "approach-1",
      approach: {
        id: "approach-1",
        name: "Cognitive Behavioral Therapy",
        description:
          "A type of psychotherapy that helps patients understand the thoughts and feelings that influence behaviors",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    },
    {
      id: "pta-2",
      professionalId: "prof-123",
      approachId: "approach-2",
      approach: {
        id: "approach-2",
        name: "Psychodynamic Therapy",
        description: "A form of depth psychology that focuses on unconscious processes",
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
    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    expect(result.current.approaches).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should not load when professionalId is not provided", () => {
    const { result } = renderHook(() => useProfessionalTherapeuticApproaches());

    expect(result.current.approaches).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should fetch approaches successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApproaches),
    } as Response);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-therapeutic-approaches/professional/prof-123`,
    );
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch professional therapeutic approaches");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle non-Error exceptions", async () => {
    mockFetch.mockRejectedValue("String error");

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  describe("updateApproaches", () => {
    it("should update approaches successfully", async () => {
      const updatedApproaches = [
        {
          id: "pta-1",
          professionalId: "prof-123",
          approachId: "approach-1",
          approach: {
            id: "approach-1",
            name: "Cognitive Behavioral Therapy",
            description:
              "A type of psychotherapy that helps patients understand the thoughts and feelings that influence behaviors",
            is_active: true,
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        },
      ];

      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApproaches),
      } as Response);

      // Mock update fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedApproaches),
      } as Response);

      const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateApproaches(["approach-1"]);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-therapeutic-approaches/professional/prof-123/approaches`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["approach-1"]),
        },
      );

      expect(result.current.approaches).toEqual(updatedApproaches);
    });

    it("should not update when professionalId is not provided", async () => {
      const { result } = renderHook(() => useProfessionalTherapeuticApproaches());

      await act(async () => {
        await result.current.updateApproaches(["approach-1"]);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle update errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

      await act(async () => {
        await result.current.updateApproaches(["approach-1"]);
      });

      expect(result.current.error).toBe("Failed to update professional therapeutic approaches");
    });
  });

  it("should refetch when professionalId changes", async () => {
    const { result, rerender } = renderHook(
      ({ professionalId }) => useProfessionalTherapeuticApproaches(professionalId),
      { initialProps: { professionalId: "prof-123" } },
    );

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApproaches),
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
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-therapeutic-approaches/professional/prof-456`,
    );
  });

  it("should handle empty response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle malformed JSON response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as Response);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("should handle different approach properties", async () => {
    const approachesWithVariedProperties = [
      {
        id: "pta-1",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-1",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "pta-2",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-2",
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(approachesWithVariedProperties),
    } as Response);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(approachesWithVariedProperties);
    expect(result.current.approaches[0]).toHaveProperty("therapeutic_approach_id", "approach-1");
    expect(result.current.approaches[1]).toHaveProperty("therapeutic_approach_id", "approach-2");
  });
});
