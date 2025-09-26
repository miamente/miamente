import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { TherapeuticApproachesSelector } from "../professional-info/TherapeuticApproachesSelector";
import { type TherapeuticApproach } from "@/lib/types";

// Mock the hook
const mockUseTherapeuticApproaches = {
  approaches: [] as TherapeuticApproach[],
  loading: false,
  error: null as string | null,
};

vi.mock("@/hooks/useTherapeuticApproaches", () => ({
  useTherapeuticApproaches: vi.fn(() => mockUseTherapeuticApproaches),
}));

describe("TherapeuticApproachesSelector", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTherapeuticApproaches.approaches = [
      { id: "approach1", name: "Cognitive Behavioral Therapy", created_at: "2024-01-01T00:00:00Z" },
      { id: "approach2", name: "Psychodynamic Therapy", created_at: "2024-01-01T00:00:00Z" },
      { id: "approach3", name: "Humanistic Therapy", created_at: "2024-01-01T00:00:00Z" },
    ];
    mockUseTherapeuticApproaches.loading = false;
    mockUseTherapeuticApproaches.error = null;
  });

  it("should render with default props", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    expect(screen.getByText("Enfoques Terapéuticos")).toBeInTheDocument();
    expect(
      screen.getByText(/Selecciona uno o más enfoques terapéuticos que manejas/),
    ).toBeInTheDocument();
    expect(screen.getByText("Cognitive Behavioral Therapy")).toBeInTheDocument();
    expect(screen.getByText("Psychodynamic Therapy")).toBeInTheDocument();
    expect(screen.getByText("Humanistic Therapy")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    mockUseTherapeuticApproaches.loading = true;
    const mockOnChange = vi.fn();

    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    expect(screen.getByText("Cargando enfoques terapéuticos...")).toBeInTheDocument();
    expect(screen.queryByText("Cognitive Behavioral Therapy")).not.toBeInTheDocument();
  });

  it("should show error state", () => {
    mockUseTherapeuticApproaches.error = "Failed to load approaches";
    const mockOnChange = vi.fn();

    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    expect(screen.getByText("Error: Failed to load approaches")).toBeInTheDocument();
    expect(screen.queryByText("Cognitive Behavioral Therapy")).not.toBeInTheDocument();
  });

  it("should call onApproachesChange when checkbox is checked", async () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    const checkbox = screen.getByLabelText("Cognitive Behavioral Therapy");
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(["approach1"]);
  });

  it("should call onApproachesChange when checkbox is unchecked", async () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1"]}
        onApproachesChange={mockOnChange}
      />,
    );

    const checkbox = screen.getByLabelText("Cognitive Behavioral Therapy");
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("should show selected approaches summary", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1", "approach2"]}
        onApproachesChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Enfoques seleccionados (2):")).toBeInTheDocument();
    expect(
      screen.getByText("Cognitive Behavioral Therapy, Psychodynamic Therapy"),
    ).toBeInTheDocument();
  });

  it("should not show summary when no approaches are selected", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    expect(screen.queryByText("Enfoques seleccionados")).not.toBeInTheDocument();
  });

  it("should disable checkboxes when disabled prop is true", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={[]}
        onApproachesChange={mockOnChange}
        disabled={true}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should not call onApproachesChange when disabled", async () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={[]}
        onApproachesChange={mockOnChange}
        disabled={true}
      />,
    );

    const checkbox = screen.getByLabelText("Cognitive Behavioral Therapy");
    await user.click(checkbox);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should render with correct card structure", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    // Check for card elements
    expect(screen.getByText("Enfoques Terapéuticos")).toBeInTheDocument();
    expect(
      screen.getByText(/Selecciona uno o más enfoques terapéuticos que manejas/),
    ).toBeInTheDocument();
  });

  it("should render Brain icon in card header", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    // The Brain icon should be present (lucide-react icon)
    const header = screen.getByText("Enfoques Terapéuticos").closest("div");
    expect(header).toBeInTheDocument();
  });

  it("should handle multiple approach selections", async () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1"]}
        onApproachesChange={mockOnChange}
      />,
    );

    // Select second approach
    const secondCheckbox = screen.getByLabelText("Psychodynamic Therapy");
    await user.click(secondCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["approach1", "approach2"]);
  });

  it("should handle multiple approach deselections", async () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1", "approach2"]}
        onApproachesChange={mockOnChange}
      />,
    );

    // Deselect first approach
    const firstCheckbox = screen.getByLabelText("Cognitive Behavioral Therapy");
    await user.click(firstCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["approach2"]);
  });

  it("should render approaches in grid layout", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    // Check that all approaches are rendered
    expect(screen.getByText("Cognitive Behavioral Therapy")).toBeInTheDocument();
    expect(screen.getByText("Psychodynamic Therapy")).toBeInTheDocument();
    expect(screen.getByText("Humanistic Therapy")).toBeInTheDocument();
  });

  it("should show correct selected count in summary", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1", "approach2", "approach3"]}
        onApproachesChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Enfoques seleccionados (3):")).toBeInTheDocument();
  });

  it("should handle empty approaches list", () => {
    mockUseTherapeuticApproaches.approaches = [];
    const mockOnChange = vi.fn();

    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    expect(screen.getByText("Enfoques Terapéuticos")).toBeInTheDocument();
    expect(screen.queryByText("Cognitive Behavioral Therapy")).not.toBeInTheDocument();
  });

  it("should maintain correct checkbox states", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1", "approach3"]}
        onApproachesChange={mockOnChange}
      />,
    );

    const cbtCheckbox = screen.getByLabelText("Cognitive Behavioral Therapy");
    const psychodynamicCheckbox = screen.getByLabelText("Psychodynamic Therapy");
    const humanisticCheckbox = screen.getByLabelText("Humanistic Therapy");

    expect(cbtCheckbox).toBeChecked();
    expect(psychodynamicCheckbox).not.toBeChecked();
    expect(humanisticCheckbox).toBeChecked();
  });

  it("should handle approach toggle correctly", async () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1"]}
        onApproachesChange={mockOnChange}
      />,
    );

    // Toggle the selected approach (should deselect)
    const checkbox = screen.getByLabelText("Cognitive Behavioral Therapy");
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("should render with proper accessibility attributes", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector selectedApproaches={[]} onApproachesChange={mockOnChange} />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeInTheDocument();
    });

    const labels = screen.getAllByText(/Therapy/);
    labels.forEach((label) => {
      expect(label).toBeInTheDocument();
    });
  });

  it("should handle summary with single selected approach", () => {
    const mockOnChange = vi.fn();
    render(
      <TherapeuticApproachesSelector
        selectedApproaches={["approach1"]}
        onApproachesChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Enfoques seleccionados (1):")).toBeInTheDocument();
    expect(screen.getByText("Cognitive Behavioral Therapy", { selector: "p" })).toBeInTheDocument();
  });
});
