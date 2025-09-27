import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useTherapeuticApproaches } from "../useTherapeuticApproaches";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: {
    getTherapeuticApproaches: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
const mockApiClient = vi.mocked(apiClient);

describe("useTherapeuticApproaches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    const { result } = renderHook(() => useTherapeuticApproaches());

    expect(result.current.approaches).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should fetch therapeutic approaches successfully", async () => {
    const mockApproaches = [
      {
        id: "1",
        name: "Cognitive Behavioral Therapy",
        description: "CBT approach",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Dialectical Behavior Therapy",
        description: "DBT approach",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getTherapeuticApproaches.mockResolvedValue(mockApproaches);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(result.current.error).toBe(null);
    expect(mockApiClient.getTherapeuticApproaches).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors", async () => {
    mockApiClient.getTherapeuticApproaches.mockRejectedValue(new Error("Failed to fetch therapeutic approaches"));

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch therapeutic approaches");
  });

  it("should handle network errors", async () => {
    mockApiClient.getTherapeuticApproaches.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockApiClient.getTherapeuticApproaches.mockResolvedValue([]);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle non-Error exceptions", async () => {
    mockApiClient.getTherapeuticApproaches.mockRejectedValue("String error");

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  it("should use correct API URL", async () => {
    // This test is no longer relevant since we're using apiClient
    // which handles the URL internally
    mockApiClient.getTherapeuticApproaches.mockResolvedValue([]);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getTherapeuticApproaches).toHaveBeenCalledTimes(1);
  });

  it("should handle different approach properties", async () => {
    const mockApproaches = [
      {
        id: "1",
        name: "CBT",
        description: "Cognitive Behavioral Therapy",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "DBT",
        description: "Dialectical Behavior Therapy",
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
        // No updated_at for this one
      },
      {
        id: "3",
        name: "EMDR",
        // No description for this one
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getTherapeuticApproaches.mockResolvedValue(mockApproaches);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(result.current.approaches[0]).toHaveProperty("description", "Cognitive Behavioral Therapy");
    expect(result.current.approaches[1]).toHaveProperty("is_active", false);
    expect(result.current.approaches[2]).not.toHaveProperty("description");
  });

  it("should only fetch once on mount", async () => {
    mockApiClient.getTherapeuticApproaches.mockResolvedValue([]);

    const { rerender } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(mockApiClient.getTherapeuticApproaches).toHaveBeenCalledTimes(1);
    });

    // Rerender should not trigger another fetch
    rerender();
    expect(mockApiClient.getTherapeuticApproaches).toHaveBeenCalledTimes(1);
  });

  it("should handle malformed JSON response", async () => {
    mockApiClient.getTherapeuticApproaches.mockRejectedValue(new Error("Invalid JSON"));

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });
});