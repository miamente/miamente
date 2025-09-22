import React from "react";
import { render, screen } from "@testing-library/react";
import { ModalitiesEditor } from "../professional-info/ModalitiesExpansion";
import { describe, it, expect, vi } from "vitest";

// Mock React Hook Form
const mockUseFormContext = vi.fn();
const mockUseFieldArray = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => mockUseFormContext(),
  useFieldArray: () => mockUseFieldArray(),
}));

describe("ModalitiesEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseFormContext.mockReturnValue({
      control: {},
      watch: vi.fn(),
      setValue: vi.fn(),
    });

    mockUseFieldArray.mockReturnValue({
      fields: [],
      append: vi.fn(),
      remove: vi.fn(),
    });
  });

  it("should render with default props", () => {
    render(<ModalitiesEditor />);

    expect(screen.getByText("Modalidades de Intervención")).toBeInTheDocument();
  });

  it("should render with existing modalities", () => {
    const mockFields = [
      {
        id: "field1",
        modalityId: "individual",
        modalityName: "Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Terapia individual",
        isDefault: true,
      },
    ];

    mockUseFieldArray.mockReturnValue({
      fields: mockFields,
      append: vi.fn(),
      remove: vi.fn(),
    });

    render(<ModalitiesEditor />);

    expect(screen.getByText("Modalidades de Intervención")).toBeInTheDocument();
  });

  it("should handle disabled state", () => {
    render(<ModalitiesEditor disabled={true} />);

    expect(screen.getByText("Modalidades de Intervención")).toBeInTheDocument();
  });
});
