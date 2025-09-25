import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { TherapeuticApproachesMultiSelect } from "../professional-info/TherapeuticApproachesMultiSelect";
import { useTherapeuticApproaches } from "@/hooks/useTherapeuticApproaches";

// Mock the hook
const mockUseTherapeuticApproaches = {
  approaches: [],
  loading: false,
  error: null,
};

vi.mock("@/hooks/useTherapeuticApproaches", () => ({
  useTherapeuticApproaches: vi.fn(() => mockUseTherapeuticApproaches),
}));

describe("TherapeuticApproachesMultiSelect", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTherapeuticApproaches.approaches = [
      { id: "approach1", name: "Cognitive Behavioral Therapy" },
      { id: "approach2", name: "Psychodynamic Therapy" },
      { id: "approach3", name: "Humanistic Therapy" },
    ];
    mockUseTherapeuticApproaches.loading = false;
    mockUseTherapeuticApproaches.error = null;
  });

  it("should render with default props", () => {
    render(<TherapeuticApproachesMultiSelect />);

    expect(screen.getByText("Enfoques Terapéuticos")).toBeInTheDocument();
    expect(screen.getByText("Seleccionar enfoque terapéutico...")).toBeInTheDocument();
  });

  it("should render with initial selected approaches", () => {
    const selectedApproaches = ["approach1", "approach2"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} />);

    expect(screen.getByText("Cognitive Behavioral Therapy")).toBeInTheDocument();
    expect(screen.getByText("Psychodynamic Therapy")).toBeInTheDocument();
    expect(screen.queryByText("Humanistic Therapy")).not.toBeInTheDocument();
  });

  it("should show loading state", () => {
    mockUseTherapeuticApproaches.loading = true;

    render(<TherapeuticApproachesMultiSelect />);

    expect(screen.getByText("Cargando enfoques terapéuticos...")).toBeInTheDocument();
    expect(screen.queryByText("Seleccionar enfoque terapéutico...")).not.toBeInTheDocument();
  });

  it("should show error state", () => {
    mockUseTherapeuticApproaches.error = "Failed to load approaches";

    render(<TherapeuticApproachesMultiSelect />);

    expect(screen.getByText("Error: Failed to load approaches")).toBeInTheDocument();
    expect(screen.queryByText("Seleccionar enfoque terapéutico...")).not.toBeInTheDocument();
  });

  it("should call onChange when approach is selected", async () => {
    const mockOnChange = vi.fn();
    render(<TherapeuticApproachesMultiSelect onChange={mockOnChange} />);

    const select = screen.getByDisplayValue("");
    await user.selectOptions(select, "approach1");

    expect(mockOnChange).toHaveBeenCalledWith(["approach1"]);
  });

  it("should add multiple approaches", async () => {
    const mockOnChange = vi.fn();
    render(<TherapeuticApproachesMultiSelect onChange={mockOnChange} />);

    const select = screen.getByDisplayValue("");
    
    // Select first approach
    await user.selectOptions(select, "approach1");
    expect(mockOnChange).toHaveBeenCalledWith(["approach1"]);

    // Select second approach
    await user.selectOptions(select, "approach2");
    expect(mockOnChange).toHaveBeenCalledWith(["approach1", "approach2"]);
  });

  it("should remove approach when remove button is clicked", async () => {
    const mockOnChange = vi.fn();
    const selectedApproaches = ["approach1", "approach2"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} onChange={mockOnChange} />);

    const removeButton = screen.getAllByRole("button")[0]; // First remove button
    await user.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith(["approach2"]);
  });

  it("should not show remove buttons when disabled", () => {
    const selectedApproaches = ["approach1", "approach2"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} disabled={true} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should not show select dropdown when disabled", () => {
    render(<TherapeuticApproachesMultiSelect disabled={true} />);

    expect(screen.queryByText("Seleccionar enfoque terapéutico...")).not.toBeInTheDocument();
  });

  it("should show tooltip with help text", async () => {
    render(<TherapeuticApproachesMultiSelect />);

    const helpIcon = screen.getByRole("button", { name: /help/i });
    await user.hover(helpIcon);

    await waitFor(() => {
      expect(screen.getByText(/Selecciona uno o más enfoques terapéuticos que manejas/)).toBeInTheDocument();
    });
  });

  it("should show fallback name for unknown approach ID", () => {
    const selectedApproaches = ["unknown-approach"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} />);

    expect(screen.getByText("Enfoque unknown-")).toBeInTheDocument();
  });

  it("should show message when all approaches are selected", () => {
    const selectedApproaches = ["approach1", "approach2", "approach3"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} />);

    expect(screen.getByText("Todos los enfoques terapéuticos disponibles han sido seleccionados.")).toBeInTheDocument();
    expect(screen.queryByText("Seleccionar enfoque terapéutico...")).not.toBeInTheDocument();
  });

  it("should not show select dropdown when all approaches are selected", () => {
    const selectedApproaches = ["approach1", "approach2", "approach3"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} />);

    expect(screen.queryByText("Seleccionar enfoque terapéutico...")).not.toBeInTheDocument();
  });

  it("should handle empty approaches list", () => {
    mockUseTherapeuticApproaches.approaches = [];

    render(<TherapeuticApproachesMultiSelect />);

    expect(screen.getByText("Enfoques Terapéuticos")).toBeInTheDocument();
    expect(screen.queryByText("Seleccionar enfoque terapéutico...")).not.toBeInTheDocument();
  });

  it("should update local state when value prop changes", () => {
    const { rerender } = render(<TherapeuticApproachesMultiSelect value={["approach1"]} />);

    expect(screen.getByText("Cognitive Behavioral Therapy")).toBeInTheDocument();

    rerender(<TherapeuticApproachesMultiSelect value={["approach2"]} />);

    expect(screen.queryByText("Cognitive Behavioral Therapy")).not.toBeInTheDocument();
    expect(screen.getByText("Psychodynamic Therapy")).toBeInTheDocument();
  });

  it("should not add duplicate approaches", async () => {
    const mockOnChange = vi.fn();
    const selectedApproaches = ["approach1"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} onChange={mockOnChange} />);

    const select = screen.getByDisplayValue("");
    
    // Try to select the same approach again
    await user.selectOptions(select, "approach1");

    // Should not call onChange since approach is already selected
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should handle approach selection with empty string", async () => {
    const mockOnChange = vi.fn();
    render(<TherapeuticApproachesMultiSelect onChange={mockOnChange} />);

    const select = screen.getByDisplayValue("");
    
    // Try to select empty value
    await user.selectOptions(select, "");

    // Should not call onChange for empty selection
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should render with correct accessibility attributes", () => {
    render(<TherapeuticApproachesMultiSelect />);

    const label = screen.getByText("Enfoques Terapéuticos");
    expect(label).toBeInTheDocument();

    const helpButton = screen.getByRole("button", { name: /help/i });
    expect(helpButton).toBeInTheDocument();
  });

  it("should handle multiple remove operations", async () => {
    const mockOnChange = vi.fn();
    const selectedApproaches = ["approach1", "approach2", "approach3"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} onChange={mockOnChange} />);

    // Remove first approach
    const firstRemoveButton = screen.getAllByRole("button")[0];
    await user.click(firstRemoveButton);
    expect(mockOnChange).toHaveBeenCalledWith(["approach2", "approach3"]);

    // Remove second approach
    const secondRemoveButton = screen.getAllByRole("button")[0];
    await user.click(secondRemoveButton);
    expect(mockOnChange).toHaveBeenCalledWith(["approach3"]);
  });

  it("should maintain correct order of selected approaches", () => {
    const selectedApproaches = ["approach3", "approach1", "approach2"];
    render(<TherapeuticApproachesMultiSelect value={selectedApproaches} />);

    const badges = screen.getAllByText(/Therapy/);
    expect(badges[0]).toHaveTextContent("Humanistic Therapy");
    expect(badges[1]).toHaveTextContent("Cognitive Behavioral Therapy");
    expect(badges[2]).toHaveTextContent("Psychodynamic Therapy");
  });
});
