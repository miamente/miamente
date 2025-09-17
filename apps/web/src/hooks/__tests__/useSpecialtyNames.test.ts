import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useSpecialtyNames } from "../useSpecialtyNames";
import { apiClient } from "@/lib/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getSpecialtiesNew: vi.fn(),
  },
}));

describe("useSpecialtyNames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    // Mock API to return empty array to avoid undefined error
    vi.mocked(apiClient.getSpecialtiesNew).mockResolvedValue([]);

    const { result } = renderHook(() => useSpecialtyNames());

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

  it("should fetch specialties and create names map", async () => {
    const mockSpecialties = [
      {
        id: "spec-1",
        name: "Psicología Clínica",
        description: "Especialidad en psicología clínica",
        default_price_cents: 50000,
        currency: "COP",
        category: "mental_health",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "spec-2",
        name: "Psiquiatría",
        description: "Especialidad en psiquiatría",
        default_price_cents: 60000,
        currency: "COP",
        category: "mental_health",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "spec-3",
        name: "Terapia Individual",
        description: "Terapia individual",
        default_price_cents: 40000,
        currency: "COP",
        category: "therapy",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    vi.mocked(apiClient.getSpecialtiesNew).mockResolvedValue(mockSpecialties);

    const { result } = renderHook(() => useSpecialtyNames());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.error).toBe(null);
    expect(result.current.getNames(["spec-1", "spec-2"])).toEqual([
      "Psicología Clínica",
      "Psiquiatría",
    ]);
    expect(result.current.getNames(["spec-3"])).toEqual(["Terapia Individual"]);
  });

  it("should handle API errors", async () => {
    vi.mocked(apiClient.getSpecialtiesNew).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useSpecialtyNames());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.error).toBe("API Error");
    expect(result.current.getNames(["spec-1"])).toEqual(["spec-1"]); // Fallback to ID
  });

  it("should return IDs as fallback when specialty not found", async () => {
    const mockSpecialties = [
      {
        id: "spec-1",
        name: "Psicología Clínica",
        description: "Especialidad en psicología clínica",
        default_price_cents: 50000,
        currency: "COP",
        category: "mental_health",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    vi.mocked(apiClient.getSpecialtiesNew).mockResolvedValue(mockSpecialties);

    const { result } = renderHook(() => useSpecialtyNames());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.getNames(["spec-1", "unknown-spec"])).toEqual([
      "Psicología Clínica",
      "unknown-spec",
    ]);
  });

  it("should handle empty specialties array", async () => {
    vi.mocked(apiClient.getSpecialtiesNew).mockResolvedValue([]);

    const { result } = renderHook(() => useSpecialtyNames());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.error).toBe(null);
    expect(result.current.getNames(["spec-1"])).toEqual(["spec-1"]);
  });
});
