import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useTherapyApproachNames } from "../useTherapyApproachNames";
import { apiClient } from "@/lib/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("useTherapyApproachNames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state when approachIds provided", async () => {
    // Mock API to return empty array to avoid undefined error
    vi.mocked(apiClient.get).mockResolvedValue([]);

    const { result } = renderHook(() => useTherapyApproachNames(["approach-1"]));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.getNames).toBe("function");

    // Wait for the async effect to complete
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 1000 },
    );
  });

  it("should not be loading when approachIds is empty", () => {
    const { result } = renderHook(() => useTherapyApproachNames([]));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.getNames([])).toEqual([]);
  });

  it("should fetch therapy approaches and create names map", async () => {
    const mockApproaches = [
      { id: "approach-1", name: "Cognitivo-Conductual" },
      { id: "approach-2", name: "Humanista" },
      { id: "approach-3", name: "Psicoanalítica" },
    ];

    vi.mocked(apiClient.get).mockResolvedValue(mockApproaches);

    const { result } = renderHook(() => useTherapyApproachNames(["approach-1", "approach-2"]));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 1000 },
    );

    expect(result.current.error).toBe(null);
    expect(result.current.getNames(["approach-1", "approach-2"])).toEqual([
      "Cognitivo-Conductual",
      "Humanista",
    ]);
    expect(result.current.getNames(["approach-3"])).toEqual(["Psicoanalítica"]);
  });

  it("should handle API errors", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useTherapyApproachNames(["approach-1"]));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 1000 },
    );

    expect(result.current.error).toBe("API Error");
    expect(result.current.getNames(["approach-1"])).toEqual(["approach-1"]); // Fallback to ID
  });

  it("should return IDs as fallback when approach not found", async () => {
    const mockApproaches = [{ id: "approach-1", name: "Cognitivo-Conductual" }];

    vi.mocked(apiClient.get).mockResolvedValue(mockApproaches);

    const { result } = renderHook(() =>
      useTherapyApproachNames(["approach-1", "unknown-approach"]),
    );

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 1000 },
    );

    expect(result.current.getNames(["approach-1", "unknown-approach"])).toEqual([
      "Cognitivo-Conductual",
      "unknown-approach",
    ]);
  });

  it("should handle empty approaches array", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);

    const { result } = renderHook(() => useTherapyApproachNames(["approach-1"]));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 1000 },
    );

    expect(result.current.error).toBe(null);
    expect(result.current.getNames(["approach-1"])).toEqual(["approach-1"]);
  });
});
