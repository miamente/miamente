import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SpecialtySelector } from "../SpecialtySelector";
import { Specialty } from "@/lib/types";

// Mock UI components
vi.mock("@/components/ui/select", () => ({
  Select: ({
    options,
    value,
    onValueChange,
    placeholder,
    disabled,
    className,
    "aria-label": ariaLabel,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
  }) => (
    <div data-testid="select-component" className={className}>
      <select
        data-testid="select-element"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe("SpecialtySelector", () => {
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

  const mockOnAdd = vi.fn();
  const defaultProps = {
    availableSpecialties: mockSpecialties,
    onAdd: mockOnAdd,
    disabled: false,
    placeholder: "Seleccionar especialidad...",
    currentCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render select component when enabled", () => {
    render(<SpecialtySelector {...defaultProps} />);

    expect(screen.getByTestId("select-component")).toBeInTheDocument();
    expect(screen.getByTestId("select-element")).toBeInTheDocument();
  });

  it("should not render when disabled", () => {
    render(<SpecialtySelector {...defaultProps} disabled={true} />);

    expect(screen.queryByTestId("select-component")).not.toBeInTheDocument();
  });

  it("should show all available specialties message when no options", () => {
    render(<SpecialtySelector {...defaultProps} availableSpecialties={[]} currentCount={2} />);

    expect(
      screen.getByText("Todas las especialidades disponibles han sido seleccionadas."),
    ).toBeInTheDocument();
  });

  it("should not show message when no options and currentCount is 0", () => {
    render(<SpecialtySelector {...defaultProps} availableSpecialties={[]} currentCount={0} />);

    expect(screen.getByTestId("select-component")).toBeInTheDocument();
  });

  it("should call onAdd when specialty is selected", () => {
    render(<SpecialtySelector {...defaultProps} />);

    const select = screen.getByTestId("select-element");
    fireEvent.change(select, { target: { value: "spec1" } });

    expect(mockOnAdd).toHaveBeenCalledWith("spec1");
  });

  it("should show max selections counter when maxSelections is provided", () => {
    render(<SpecialtySelector {...defaultProps} maxSelections={5} currentCount={2} />);

    expect(screen.getByText("2 de 5 especialidades seleccionadas")).toBeInTheDocument();
  });

  it("should not show counter when maxSelections is not provided", () => {
    render(<SpecialtySelector {...defaultProps} currentCount={2} />);

    expect(screen.queryByText(/especialidades seleccionadas/)).not.toBeInTheDocument();
  });

  it("should disable select when max selections reached", () => {
    render(<SpecialtySelector {...defaultProps} maxSelections={2} currentCount={2} />);

    const select = screen.getByTestId("select-element");
    expect(select).toBeDisabled();
  });

  it("should enable select when under max selections", () => {
    render(<SpecialtySelector {...defaultProps} maxSelections={5} currentCount={2} />);

    const select = screen.getByTestId("select-element");
    expect(select).not.toBeDisabled();
  });

  it("should disable select when no available specialties", () => {
    render(<SpecialtySelector {...defaultProps} availableSpecialties={[]} currentCount={0} />);

    const select = screen.getByTestId("select-element");
    expect(select).toBeDisabled();
  });

  it("should render all available specialty options", () => {
    render(<SpecialtySelector {...defaultProps} />);

    const select = screen.getByTestId("select-element");
    const options = select.querySelectorAll("option");

    // Should have placeholder + 3 specialty options
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent("Seleccionar especialidad...");
    expect(options[1]).toHaveTextContent("Terapia Cognitiva");
    expect(options[2]).toHaveTextContent("Terapia Familiar");
    expect(options[3]).toHaveTextContent("Terapia de Pareja");
  });

  it("should use correct placeholder", () => {
    const customPlaceholder = "Choose a specialty...";
    render(<SpecialtySelector {...defaultProps} placeholder={customPlaceholder} />);

    expect(screen.getByText(customPlaceholder)).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<SpecialtySelector {...defaultProps} />);

    const select = screen.getByTestId("select-element");
    expect(select).toHaveAttribute("aria-label", "Seleccionar especialidad");
  });

  it("should have proper styling classes", () => {
    render(<SpecialtySelector {...defaultProps} />);

    const container = screen.getByTestId("select-component");
    expect(container).toHaveClass("w-full");

    // The space-y-1 class is on the parent wrapper div
    const wrapper = container.parentElement;
    expect(wrapper).toHaveClass("space-y-1");
  });

  it("should handle empty available specialties array", () => {
    render(<SpecialtySelector {...defaultProps} availableSpecialties={[]} currentCount={0} />);

    const select = screen.getByTestId("select-element");
    const options = select.querySelectorAll("option");

    // Should only have placeholder option
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Seleccionar especialidad...");
  });

  it("should update counter text correctly", () => {
    const { rerender } = render(
      <SpecialtySelector {...defaultProps} maxSelections={3} currentCount={1} />,
    );

    expect(screen.getByText("1 de 3 especialidades seleccionadas")).toBeInTheDocument();

    rerender(<SpecialtySelector {...defaultProps} maxSelections={3} currentCount={2} />);

    expect(screen.getByText("2 de 3 especialidades seleccionadas")).toBeInTheDocument();
  });

  it("should handle selection at max limit", () => {
    render(<SpecialtySelector {...defaultProps} maxSelections={3} currentCount={3} />);

    const select = screen.getByTestId("select-element");
    expect(select).toBeDisabled();
    expect(screen.getByText("3 de 3 especialidades seleccionadas")).toBeInTheDocument();
  });

  it("should render counter with correct styling", () => {
    render(<SpecialtySelector {...defaultProps} maxSelections={5} currentCount={2} />);

    const counter = screen.getByText("2 de 5 especialidades seleccionadas");
    expect(counter).toHaveClass("text-xs", "text-gray-500");
  });
});
