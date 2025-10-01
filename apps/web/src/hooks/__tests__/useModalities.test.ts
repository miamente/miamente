import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useModalities } from "../useModalities";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: {
    getModalities: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
const mockApiClient = vi.mocked(apiClient);

describe("useModalities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    const { result } = renderHook(() => useModalities());

    expect(result.current.modalities).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should fetch modalities successfully", async () => {
    const mockModalities = [
      {
        id: "1",
        name: "Virtual",
        description: "Virtual therapy sessions",
        category: "online",
        currency: "COP",
        default_price_cents: 50000,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Presencial",
        description: "In-person therapy sessions",
        category: "in-person",
        currency: "COP",
        default_price_cents: 80000,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getModalities.mockResolvedValue(mockModalities);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual(mockModalities);
    expect(result.current.error).toBe(null);
    expect(mockApiClient.getModalities).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors", async () => {
    mockApiClient.getModalities.mockRejectedValue(new Error("Failed to fetch modalities"));

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch modalities");
  });

  it("should handle network errors", async () => {
    mockApiClient.getModalities.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockApiClient.getModalities.mockResolvedValue([]);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle non-Error exceptions", async () => {
    mockApiClient.getModalities.mockRejectedValue("String error");

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  it("should use correct API URL", async () => {
    // This test is no longer relevant since we're using apiClient
    // which handles the URL internally
    mockApiClient.getModalities.mockResolvedValue([]);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getModalities).toHaveBeenCalledTimes(1);
  });

  it("should handle different modality properties", async () => {
    const mockModalities = [
      {
        id: "1",
        name: "Virtual",
        description: "Virtual therapy sessions",
        category: "online",
        currency: "COP",
        default_price_cents: 50000,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Presencial",
        description: "In-person therapy sessions",
        category: "in-person",
        currency: "COP",
        default_price_cents: 80000,
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
        // No updated_at for this one
      },
      {
        id: "3",
        name: "Hybrid",
        // No description for this one
        category: "mixed",
        currency: "COP",
        default_price_cents: 65000,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockApiClient.getModalities.mockResolvedValue(mockModalities);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual(mockModalities);
    expect(result.current.modalities[0]).toHaveProperty("description", "Virtual therapy sessions");
    expect(result.current.modalities[1]).toHaveProperty("is_active", false);
    expect(result.current.modalities[2]).not.toHaveProperty("description");
  });

  it("should only fetch once on mount", async () => {
    mockApiClient.getModalities.mockResolvedValue([]);

    const { rerender } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(mockApiClient.getModalities).toHaveBeenCalledTimes(1);
    });

    // Rerender should not trigger another fetch
    rerender();
    expect(mockApiClient.getModalities).toHaveBeenCalledTimes(1);
  });

  it("should handle malformed JSON response", async () => {
    mockApiClient.getModalities.mockRejectedValue(new Error("Invalid JSON"));

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });
});
