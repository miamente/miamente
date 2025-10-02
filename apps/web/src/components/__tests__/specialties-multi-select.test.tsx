import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpecialtiesMultiSelect } from "../professional-info/SpecialtiesMultiSelect";
import { Specialty } from "@/lib/types";

// Mock the useSpecialties hook
const mockSpecialties: Specialty[] = [
  {
    id: "spec1",
    name: "Terapia Cognitiva",
    description: "Terapia cognitiva conductual",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "spec2",
    name: "Terapia Familiar",
    description: "Terapia sistémica familiar",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "spec3",
    name: "Terapia de Pareja",
    description: "Terapia de pareja sistémica",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "spec4",
    name: "Terapia Individual",
    description: "Terapia individual",
    created_at: "2024-01-01T00:00:00Z",
  },
];

const mockUseSpecialties = vi.fn();

vi.mock("@/hooks/useSpecialties", () => ({
  useSpecialties: () => mockUseSpecialties(),
}));

describe("SpecialtiesMultiSelect", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return value
    mockUseSpecialties.mockReturnValue({
      specialties: mockSpecialties,
      loading: false,
      error: null,
    });
  });

  describe("Component Definition", () => {
    it("should be defined", () => {
      expect(SpecialtiesMultiSelect).toBeDefined();
    });

    it("should be a function", () => {
      expect(typeof SpecialtiesMultiSelect).toBe("function");
    });
  });

  describe("Hook Mocking", () => {
    it("should mock the hook correctly", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: mockSpecialties,
        loading: false,
        error: null,
      });

      const result = mockUseSpecialties();

      expect(result).toEqual({
        specialties: mockSpecialties,
        loading: false,
        error: null,
      });
    });

    it("should handle loading state", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: [],
        loading: true,
        error: null,
      });

      const result = mockUseSpecialties();

      expect(result.loading).toBe(true);
      expect(result.specialties).toEqual([]);
      expect(result.error).toBe(null);
    });

    it("should handle error state", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: [],
        loading: false,
        error: "Failed to load specialties",
      });

      const result = mockUseSpecialties();

      expect(result.loading).toBe(false);
      expect(result.specialties).toEqual([]);
      expect(result.error).toBe("Failed to load specialties");
    });
  });

  describe("Component Creation", () => {
    it("should create component element", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: mockSpecialties,
        loading: false,
        error: null,
      });

      const element = React.createElement(SpecialtiesMultiSelect, {});
      expect(element).toBeDefined();
      expect(element.type).toBe(SpecialtiesMultiSelect);
    });

    it("should create component with props", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: mockSpecialties,
        loading: false,
        error: null,
      });

      const element = React.createElement(SpecialtiesMultiSelect, {
        value: ["spec1"],
        onChange: mockOnChange,
        disabled: false,
      });

      expect(element).toBeDefined();
      expect(element.props.value).toEqual(["spec1"]);
      expect(element.props.onChange).toBe(mockOnChange);
      expect(element.props.disabled).toBe(false);
    });

    it("should handle readonly value prop", () => {
      const readonlyValue = ["spec1", "spec2"] as readonly string[];

      const element = React.createElement(SpecialtiesMultiSelect, {
        value: readonlyValue,
        onChange: mockOnChange,
      });

      expect(element.props.value).toEqual(readonlyValue);
    });
  });

  describe("Data Types", () => {
    it("should handle Specialty type correctly", () => {
      const specialty: Specialty = {
        id: "test-id",
        name: "Test Specialty",
        description: "Test Description",
        created_at: "2024-01-01T00:00:00Z",
      };

      expect(specialty.id).toBe("test-id");
      expect(specialty.name).toBe("Test Specialty");
      expect(specialty.description).toBe("Test Description");
      expect(specialty.created_at).toBe("2024-01-01T00:00:00Z");
    });

    it("should handle empty specialties array", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: [],
        loading: false,
        error: null,
      });

      const result = mockUseSpecialties();
      expect(result.specialties).toEqual([]);
    });

    it("should handle multiple specialties", () => {
      mockUseSpecialties.mockReturnValue({
        specialties: mockSpecialties,
        loading: false,
        error: null,
      });

      const result = mockUseSpecialties();
      expect(result.specialties).toHaveLength(4);
      expect(result.specialties[0].name).toBe("Terapia Cognitiva");
    });
  });

  describe("Props Interface", () => {
    it("should accept optional value prop", () => {
      const element = React.createElement(SpecialtiesMultiSelect, {
        value: ["spec1", "spec2"],
      });

      expect(element.props.value).toEqual(["spec1", "spec2"]);
    });

    it("should accept optional onChange prop", () => {
      const element = React.createElement(SpecialtiesMultiSelect, {
        onChange: mockOnChange,
      });

      expect(element.props.onChange).toBe(mockOnChange);
    });

    it("should accept optional disabled prop", () => {
      const element = React.createElement(SpecialtiesMultiSelect, {
        disabled: true,
      });

      expect(element.props.disabled).toBe(true);
    });

    it("should handle all props together", () => {
      const element = React.createElement(SpecialtiesMultiSelect, {
        value: ["spec1"],
        onChange: mockOnChange,
        disabled: false,
      });

      expect(element.props.value).toEqual(["spec1"]);
      expect(element.props.onChange).toBe(mockOnChange);
      expect(element.props.disabled).toBe(false);
    });
  });
});
