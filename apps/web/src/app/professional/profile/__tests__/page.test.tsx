import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProfessionalProfilePage from "../page";

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>
      {children}
    </h2>
  ),
}));

// Mock the ProfessionalInfoForm component
vi.mock("@/components/professional-info/ProfessionalInfoForm", () => ({
  ProfessionalInfoForm: ({
    professionalId,
    onSave,
  }: {
    professionalId: string;
    onSave: (data: Record<string, unknown>) => void;
  }) => (
    <div data-testid="professional-info-form">
      <div data-testid="professional-id">{professionalId}</div>
      <button data-testid="save-button" onClick={() => onSave({ test: "data" })}>
        Save
      </button>
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  UserCheck: () => <div data-testid="user-check-icon">UserCheck</div>,
}));

describe("ProfessionalProfilePage", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should render the page title and description", () => {
    render(<ProfessionalProfilePage />);

    expect(screen.getByText("Perfil Profesional")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Actualiza tu información profesional, especialidades, enfoques terapéuticos y modalidades de intervención.",
      ),
    ).toBeInTheDocument();
  });

  it("should render the professional info form", () => {
    render(<ProfessionalProfilePage />);

    expect(screen.getByTestId("professional-info-form")).toBeInTheDocument();
    expect(screen.getByTestId("professional-id")).toHaveTextContent("test-professional-id");
  });

  it("should render the user check icon", () => {
    render(<ProfessionalProfilePage />);

    expect(screen.getByTestId("user-check-icon")).toBeInTheDocument();
  });

  it("should render the card structure correctly", () => {
    render(<ProfessionalProfilePage />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toBeInTheDocument();
  });

  it("should handle save callback when form is submitted", () => {
    const consoleSpy = vi.spyOn(console, "log");
    render(<ProfessionalProfilePage />);

    const saveButton = screen.getByTestId("save-button");
    fireEvent.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith("Datos guardados:", { test: "data" });
  });

  it("should have proper container structure", () => {
    render(<ProfessionalProfilePage />);

    const container = screen.getByText("Perfil Profesional").closest(".container");
    expect(container).toHaveClass("mx-auto", "py-8");
  });

  it("should render the professional ID in the form", () => {
    render(<ProfessionalProfilePage />);

    const professionalIdElement = screen.getByTestId("professional-id");
    expect(professionalIdElement).toHaveTextContent("test-professional-id");
  });

  it("should have the correct card title structure", () => {
    render(<ProfessionalProfilePage />);

    const cardTitle = screen.getByTestId("card-title");
    expect(cardTitle).toHaveClass("flex", "items-center", "gap-2", "text-2xl");
  });
});
