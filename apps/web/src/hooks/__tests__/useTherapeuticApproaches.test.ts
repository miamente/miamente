import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useTherapeuticApproaches } from "../useTherapeuticApproaches";

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe("useTherapeuticApproaches", () => {
  const mockApproaches = [
    {
      id: "approach-1",
      name: "Cognitive Behavioral Therapy",
      description:
        "A type of psychotherapy that helps patients understand the thoughts and feelings that influence behaviors",
      is_active: true,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "approach-2",
      name: "Psychodynamic Therapy",
      description:
        "A form of depth psychology that focuses on unconscious processes as they are manifested in the present",
      is_active: true,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "approach-3",
      name: "Humanistic Therapy",
      description: "A psychological perspective that emphasizes the study of the whole person",
      is_active: false,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useTherapeuticApproaches());

    expect(result.current.approaches).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should fetch therapeutic approaches successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApproaches),
    } as Response);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(mockApproaches);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/therapeutic-approaches`,
    );
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch therapeutic approaches");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle non-Error exceptions", async () => {
    mockFetch.mockRejectedValue("String error");

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("An error occurred");
  });

  it("should use correct API URL", async () => {
    // Mock the environment variable before importing the hook
    const originalEnv = process.env.NEXT_PUBLIC_API_URL;

    // Clear the module cache to ensure the new env var is used
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    // Import the hook after setting the env var
    const { useTherapeuticApproaches } = await import("../useTherapeuticApproaches");
    renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/therapeutic-approaches",
      );
    });

    // Restore original env
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it("should handle different therapeutic approach properties", async () => {
    const approachesWithVariedProperties = [
      {
        id: "approach-1",
        name: "CBT",
        description: "Cognitive Behavioral Therapy",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "approach-2",
        name: "Psychodynamic",
        // No description
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
        // No updated_at
      },
      {
        id: "approach-3",
        name: "Humanistic",
        description: "Humanistic approach to therapy",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(approachesWithVariedProperties),
    } as Response);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(approachesWithVariedProperties);
    expect(result.current.approaches[0]).toHaveProperty(
      "description",
      "Cognitive Behavioral Therapy",
    );
    expect(result.current.approaches[1]).toHaveProperty("is_active", false);
    expect(result.current.approaches[1]).not.toHaveProperty("updated_at");
  });

  it("should only fetch once on mount", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { rerender } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Rerender should not trigger another fetch
    rerender();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle malformed JSON response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as Response);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("should handle partial response data", async () => {
    const partialData = [
      {
        id: "approach-1",
        name: "CBT",
        // Missing other required fields
      },
      {
        id: "approach-2",
        name: "Psychodynamic",
        description: "A therapy approach",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(partialData),
    } as Response);

    const { result } = renderHook(() => useTherapeuticApproaches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.approaches).toEqual(partialData);
    expect(result.current.error).toBe(null);
  });
});
