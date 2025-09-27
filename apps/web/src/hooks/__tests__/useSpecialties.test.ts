import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSpecialties } from "../useSpecialties";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: {
    getSpecialties: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
const mockApiClient = vi.mocked(apiClient);

describe("useSpecialties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    const { result } = renderHook(() => useSpecialties());

    expect(result.current.specialties).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should fetch specialties successfully", async () => {
    const mockSpecialties = [
      {
        id: "1",
        name: "Anxiety",
        description: "Treatment for anxiety disorders",
        category: "Mental Health",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Depression",
        description: "Treatment for depression",
        category: "Mental Health",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getSpecialties.mockResolvedValue(mockSpecialties);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual(mockSpecialties);
    expect(result.current.error).toBe(null);
    expect(mockApiClient.getSpecialties).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors", async () => {
    mockApiClient.getSpecialties.mockRejectedValue(new Error("Failed to fetch specialties"));

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch specialties");
  });

  it("should handle network errors", async () => {
    mockApiClient.getSpecialties.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockApiClient.getSpecialties.mockResolvedValue([]);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle non-Error exceptions", async () => {
    mockApiClient.getSpecialties.mockRejectedValue("String error");

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  it("should use correct API URL", async () => {
    // This test is no longer relevant since we're using apiClient
    // which handles the URL internally
    mockApiClient.getSpecialties.mockResolvedValue([]);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getSpecialties).toHaveBeenCalledTimes(1);
  });

  it("should handle different specialty properties", async () => {
    const mockSpecialties = [
      {
        id: "1",
        name: "Anxiety",
        description: "Treatment for anxiety disorders",
        category: "Mental Health",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Depression",
        description: "Treatment for depression",
        category: "Mental Health",
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
        // No updated_at for this one
      },
      {
        id: "3",
        name: "PTSD",
        // No description for this one
        category: "Mental Health",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getSpecialties.mockResolvedValue(mockSpecialties);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual(mockSpecialties);
    expect(result.current.specialties[0]).toHaveProperty(
      "description",
      "Treatment for anxiety disorders",
    );
    expect(result.current.specialties[1]).toHaveProperty("is_active", false);
    expect(result.current.specialties[2]).not.toHaveProperty("description");
  });

  it("should only fetch once on mount", async () => {
    mockApiClient.getSpecialties.mockResolvedValue([]);

    const { rerender } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(mockApiClient.getSpecialties).toHaveBeenCalledTimes(1);
    });

    // Rerender should not trigger another fetch
    rerender();
    expect(mockApiClient.getSpecialties).toHaveBeenCalledTimes(1);
  });

  it("should handle malformed JSON response", async () => {
    mockApiClient.getSpecialties.mockRejectedValue(new Error("Invalid JSON"));

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });
});
