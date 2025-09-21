import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSpecialtySelection, useSpecialtyData } from "../hooks";
import { Specialty } from "@/lib/types";

describe("useSpecialtySelection", () => {
  const mockOnChange = vi.fn();
  const value = ["spec1", "spec2"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle adding new specialty", () => {
    const { result } = renderHook(() => useSpecialtySelection(value, mockOnChange));

    act(() => {
      result.current.handleAdd("spec3");
    });

    expect(mockOnChange).toHaveBeenCalledWith(["spec1", "spec2", "spec3"]);
  });

  it("should not add duplicate specialty", () => {
    const { result } = renderHook(() => useSpecialtySelection(value, mockOnChange));

    act(() => {
      result.current.handleAdd("spec1");
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should not add empty specialty", () => {
    const { result } = renderHook(() => useSpecialtySelection(value, mockOnChange));

    act(() => {
      result.current.handleAdd("");
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should handle removing specialty", () => {
    const { result } = renderHook(() => useSpecialtySelection(value, mockOnChange));

    act(() => {
      result.current.handleRemove("spec1");
    });

    expect(mockOnChange).toHaveBeenCalledWith(["spec2"]);
  });

  it("should respect max selections limit", () => {
    const { result } = renderHook(() => useSpecialtySelection(value, mockOnChange, 2));

    act(() => {
      result.current.handleAdd("spec3");
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should allow adding when under max selections", () => {
    const { result } = renderHook(() => useSpecialtySelection(["spec1"], mockOnChange, 2));

    act(() => {
      result.current.handleAdd("spec2");
    });

    expect(mockOnChange).toHaveBeenCalledWith(["spec1", "spec2"]);
  });

  it("should work without onChange callback", () => {
    const { result } = renderHook(() => useSpecialtySelection(value));

    expect(() => {
      act(() => {
        result.current.handleAdd("spec3");
      });
    }).not.toThrow();
  });
});

describe("useSpecialtyData", () => {
  const mockSpecialties: Specialty[] = [
    {
      id: "spec1",
      name: "Terapia Cognitiva",
      category: "Cognitiva",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "spec2",
      name: "Terapia Familiar",
      category: "Sistémica",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "spec3",
      name: "Terapia de Pareja",
      category: "Sistémica",
      created_at: "2024-01-01T00:00:00Z",
    },
  ];

  it("should return selected specialties", () => {
    const { result } = renderHook(() => useSpecialtyData(["spec1", "spec2"], mockSpecialties));

    expect(result.current.selectedSpecialties).toHaveLength(2);
    expect(result.current.selectedSpecialties[0].name).toBe("Terapia Cognitiva");
    expect(result.current.selectedSpecialties[1].name).toBe("Terapia Familiar");
  });

  it("should return available specialties", () => {
    const { result } = renderHook(() => useSpecialtyData(["spec1"], mockSpecialties));

    expect(result.current.availableSpecialties).toHaveLength(2);
    expect(result.current.availableSpecialties[0].id).toBe("spec2");
    expect(result.current.availableSpecialties[1].id).toBe("spec3");
  });

  it("should filter out invalid selected IDs", () => {
    const { result } = renderHook(() =>
      useSpecialtyData(["spec1", "invalid-id", "spec2"], mockSpecialties),
    );

    expect(result.current.selectedSpecialties).toHaveLength(2);
    expect(result.current.selectedSpecialties.map((s) => s.id)).toEqual(["spec1", "spec2"]);
  });

  it("should get specialty name by ID", () => {
    const { result } = renderHook(() => useSpecialtyData([], mockSpecialties));

    expect(result.current.getSpecialtyName("spec1")).toBe("Terapia Cognitiva");
    expect(result.current.getSpecialtyName("invalid-id")).toBe("Especialidad invalid-");
  });

  it("should handle empty specialties array", () => {
    const { result } = renderHook(() => useSpecialtyData(["spec1"], []));

    expect(result.current.selectedSpecialties).toHaveLength(0);
    expect(result.current.availableSpecialties).toHaveLength(0);
  });

  it("should memoize results correctly", () => {
    const { result, rerender } = renderHook(
      ({ selectedIds, specialties }) => useSpecialtyData(selectedIds, specialties),
      {
        initialProps: {
          selectedIds: ["spec1"] as readonly string[],
          specialties: mockSpecialties,
        },
      },
    );

    const firstResult = result.current;

    // Re-render with same props
    rerender({
      selectedIds: ["spec1"] as readonly string[],
      specialties: mockSpecialties,
    });

    // Results should be memoized (same reference)
    expect(result.current.selectedSpecialties).toStrictEqual(firstResult.selectedSpecialties);
    expect(result.current.availableSpecialties).toStrictEqual(firstResult.availableSpecialties);
  });
});
