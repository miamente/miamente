import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SelectedSpecialtiesList } from "../SelectedSpecialtiesList";
import { Specialty } from "@/lib/types";

// Mock SpecialtyBadge component
vi.mock("../SpecialtyBadge", () => ({
  SpecialtyBadge: ({
    specialty,
    onRemove,
    disabled,
  }: {
    specialty: Specialty;
    onRemove: (id: string) => void;
    disabled: boolean;
  }) => (
    <div data-testid={`specialty-badge-${specialty.id}`}>
      <span>{specialty.name}</span>
      {!disabled && <button onClick={() => onRemove(specialty.id)}>Remove {specialty.name}</button>}
    </div>
  ),
}));

describe("SelectedSpecialtiesList", () => {
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
      description: "Terapia sistémica familiar",
      created_at: "2024-01-01T00:00:00Z",
    },
  ];

  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when no specialties are selected", () => {
    const { container } = render(
      <SelectedSpecialtiesList selectedSpecialties={[]} onRemove={mockOnRemove} disabled={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render selected specialties count", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    expect(screen.getByText("Especialidades seleccionadas (3)")).toBeInTheDocument();
  });

  it("should render all selected specialties", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    expect(screen.getByTestId("specialty-badge-spec1")).toBeInTheDocument();
    expect(screen.getByTestId("specialty-badge-spec2")).toBeInTheDocument();
    expect(screen.getByTestId("specialty-badge-spec3")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Especialidades seleccionadas");
  });

  it("should pass onRemove callback to badges", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={[mockSpecialties[0]]}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith("spec1");
  });

  it("should pass disabled prop to badges", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={[mockSpecialties[0]]}
        onRemove={mockOnRemove}
        disabled={true}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    // Find the outer container by looking for the element with space-y-2 class
    const container = screen
      .getByText("Especialidades seleccionadas (3)")
      .closest("div")?.parentElement;
    expect(container).toHaveClass("space-y-2");

    const countLabel = screen.getByText("Especialidades seleccionadas (3)");
    expect(countLabel).toHaveClass("text-sm", "font-medium", "text-gray-700");

    const list = screen.getByRole("list");
    expect(list).toHaveClass("flex", "flex-wrap", "gap-2");
  });

  it("should update count when specialties change", () => {
    const { rerender } = render(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties.slice(0, 1)}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    expect(screen.getByText("Especialidades seleccionadas (1)")).toBeInTheDocument();

    rerender(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties.slice(0, 2)}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    expect(screen.getByText("Especialidades seleccionadas (2)")).toBeInTheDocument();
  });

  it("should render single specialty correctly", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={[mockSpecialties[0]]}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    expect(screen.getByText("Especialidades seleccionadas (1)")).toBeInTheDocument();
    expect(screen.getByTestId("specialty-badge-spec1")).toBeInTheDocument();
  });

  it("should handle empty array gracefully", () => {
    const { container } = render(
      <SelectedSpecialtiesList selectedSpecialties={[]} onRemove={mockOnRemove} disabled={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should maintain key prop for each specialty badge", () => {
    render(
      <SelectedSpecialtiesList
        selectedSpecialties={mockSpecialties}
        onRemove={mockOnRemove}
        disabled={false}
      />,
    );

    // Each badge should have a unique test id based on specialty id
    mockSpecialties.forEach((specialty) => {
      expect(screen.getByTestId(`specialty-badge-${specialty.id}`)).toBeInTheDocument();
    });
  });
});
