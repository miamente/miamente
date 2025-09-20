import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useModalities } from "../useModalities";

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

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
        description: "Online therapy sessions",
        category: "therapy",
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
        category: "therapy",
        currency: "COP",
        default_price_cents: 80000,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockModalities),
    } as Response);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual(mockModalities);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/modalities`,
    );
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch modalities: 500 Internal Server Error");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle empty response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should handle malformed response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve("invalid json"),
    } as Response);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The hook should still set the data even if it's not an array
    expect(result.current.modalities).toEqual("invalid json");
    expect(result.current.error).toBe(null);
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
    const { useModalities } = await import("../useModalities");
    renderHook(() => useModalities());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/api/v1/modalities");
    });

    // Restore original env
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it("should handle different modality properties", async () => {
    const mockModalities = [
      {
        id: "1",
        name: "Virtual",
        description: "Online therapy sessions",
        category: "therapy",
        currency: "USD",
        default_price_cents: 10000,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Presencial",
        description: "In-person therapy sessions",
        category: "therapy",
        currency: "EUR",
        default_price_cents: 15000,
        is_active: false,
        created_at: "2023-01-01T00:00:00Z",
        // No updated_at for this one
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockModalities),
    } as Response);

    const { result } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual(mockModalities);
    expect(result.current.modalities[0]).toHaveProperty("currency", "USD");
    expect(result.current.modalities[1]).toHaveProperty("is_active", false);
    expect(result.current.modalities[1]).not.toHaveProperty("updated_at");
  });

  it("should only fetch once on mount", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { rerender } = renderHook(() => useModalities());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Rerender should not trigger another fetch
    rerender();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
