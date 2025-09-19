import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSpecialties } from "../useSpecialties";

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe("useSpecialties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useSpecialties());

    expect(result.current.specialties).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should fetch specialties successfully", async () => {
    const mockSpecialties = [
      {
        id: "1",
        name: "Anxiety",
        description: "Treatment for anxiety disorders",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Depression",
        description: "Treatment for depression",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSpecialties),
    } as Response);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual(mockSpecialties);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/specialties`,
    );
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch specialties");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle non-Error exceptions", async () => {
    mockFetch.mockRejectedValue("String error");

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
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
    const { useSpecialties } = await import("../useSpecialties");
    renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/api/v1/specialties");
    });

    // Restore original env
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it("should handle different specialty properties", async () => {
    const mockSpecialties = [
      {
        id: "1",
        name: "Anxiety",
        description: "Treatment for anxiety disorders",
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Depression",
        description: "Treatment for depression",
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
        // No updated_at for this one
      },
      {
        id: "3",
        name: "PTSD",
        // No description for this one
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSpecialties),
    } as Response);

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { rerender } = renderHook(() => useSpecialties());

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

    const { result } = renderHook(() => useSpecialties());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.specialties).toEqual([]);
    expect(result.current.error).toBe("Invalid JSON");
  });
});
