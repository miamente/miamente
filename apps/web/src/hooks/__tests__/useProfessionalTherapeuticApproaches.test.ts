import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProfessionalTherapeuticApproaches } from "../useProfessionalTherapeuticApproaches";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionalTherapeuticApproaches: vi.fn(),
    updateProfessionalTherapeuticApproaches: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
const mockApiClient = vi.mocked(apiClient);

describe("useProfessionalTherapeuticApproaches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state when professionalId is provided", async () => {
    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    expect(result.current.approaches).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should not load when professionalId is not provided", async () => {
    const { result } = renderHook(() => useProfessionalTherapeuticApproaches());

    expect(result.current.approaches).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Should not call the API
    expect(mockApiClient.getProfessionalTherapeuticApproaches).not.toHaveBeenCalled();
  });

  it("should fetch approaches successfully", async () => {
    const mockApproaches = [
      {
        id: "1",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-1",
        name: "Cognitive Behavioral Therapy",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-2",
        name: "Dialectical Behavior Therapy",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getProfessionalTherapeuticApproaches.mockResolvedValue(mockApproaches);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(result.current.error).toBe(null);
    expect(mockApiClient.getProfessionalTherapeuticApproaches).toHaveBeenCalledWith("prof-123");
  });

  it("should handle API errors", async () => {
    mockApiClient.getProfessionalTherapeuticApproaches.mockRejectedValue(
      new Error("Failed to fetch professional therapeutic approaches"),
    );

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch professional therapeutic approaches");
  });

  it("should handle network errors", async () => {
    mockApiClient.getProfessionalTherapeuticApproaches.mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle non-Error exceptions", async () => {
    mockApiClient.getProfessionalTherapeuticApproaches.mockRejectedValue("String error");

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  it("should update approaches successfully", async () => {
    const mockApproaches = [
      {
        id: "1",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-1",
        name: "Cognitive Behavioral Therapy",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getProfessionalTherapeuticApproaches.mockResolvedValue([]);
    mockApiClient.updateProfessionalTherapeuticApproaches.mockResolvedValue(mockApproaches);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateApproaches(["approach-1"]);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(mockApiClient.updateProfessionalTherapeuticApproaches).toHaveBeenCalledWith("prof-123", [
      "approach-1",
    ]);
  });

  it("should not update when professionalId is not provided", async () => {
    const { result } = renderHook(() => useProfessionalTherapeuticApproaches());

    await act(async () => {
      await result.current.updateApproaches(["approach-1"]);
    });

    expect(mockApiClient.updateProfessionalTherapeuticApproaches).not.toHaveBeenCalled();
  });

  it("should handle update errors", async () => {
    mockApiClient.getProfessionalTherapeuticApproaches.mockResolvedValue([]);
    mockApiClient.updateProfessionalTherapeuticApproaches.mockRejectedValue(
      new Error("Failed to update professional therapeutic approaches"),
    );

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateApproaches(["approach-1"]);
    });

    expect(result.current.error).toBe("Failed to update professional therapeutic approaches");
  });

  it("should refetch when professionalId changes", async () => {
    const { result, rerender } = renderHook(
      ({ professionalId }) => useProfessionalTherapeuticApproaches(professionalId),
      { initialProps: { professionalId: "prof-123" } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getProfessionalTherapeuticApproaches).toHaveBeenCalledWith("prof-123");

    // Change professionalId
    rerender({ professionalId: "prof-456" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getProfessionalTherapeuticApproaches).toHaveBeenCalledWith("prof-456");
    expect(mockApiClient.getProfessionalTherapeuticApproaches).toHaveBeenCalledTimes(2);
  });

  it("should handle empty response", async () => {
    mockApiClient.getProfessionalTherapeuticApproaches.mockResolvedValue([]);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle malformed JSON response", async () => {
    mockApiClient.getProfessionalTherapeuticApproaches.mockRejectedValue(new Error("Invalid JSON"));

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("should handle different approach properties", async () => {
    const mockApproaches = [
      {
        id: "1",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-1",
        name: "CBT",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        professional_id: "prof-123",
        therapeutic_approach_id: "approach-2",
        name: "DBT",
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getProfessionalTherapeuticApproaches.mockResolvedValue(mockApproaches);

    const { result } = renderHook(() => useProfessionalTherapeuticApproaches("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(result.current.approaches[0]).toHaveProperty("name", "CBT");
    expect(result.current.approaches[1]).toHaveProperty("is_active", false);
  });
});
