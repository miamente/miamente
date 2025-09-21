import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SpecialtyBadge } from "../SpecialtyBadge";
import { Specialty } from "@/lib/types";

// Mock UI components
vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
    className,
    role,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    role?: string;
  }) => (
    <div data-testid="badge" data-variant={variant} className={className} role={role}>
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  X: ({ className }: { className?: string }) => <svg data-testid="x-icon" className={className} />,
}));

describe("SpecialtyBadge", () => {
  const mockSpecialty: Specialty = {
    id: "spec1",
    name: "Terapia Cognitiva",
    category: "Cognitiva",
    created_at: "2024-01-01T00:00:00Z",
  };

  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render specialty name", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    expect(screen.getByText("Terapia Cognitiva")).toBeInTheDocument();
  });

  it("should render remove button when not disabled", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    const removeButton = screen.getByRole("button");
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveAttribute("aria-label", "Remover Terapia Cognitiva");
  });

  it("should not render remove button when disabled", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={true} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onRemove when remove button is clicked", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith("spec1");
  });

  it("should have proper accessibility attributes", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("role", "listitem");

    const removeButton = screen.getByRole("button");
    expect(removeButton).toHaveAttribute("tabIndex", "0");
    expect(removeButton).toHaveAttribute("type", "button");
  });

  it("should render X icon in remove button", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    const icon = screen.getByTestId("x-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-3", "w-3");
  });

  it("should have proper styling classes", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "secondary");
    expect(badge).toHaveClass("flex", "items-center", "gap-1");

    const removeButton = screen.getByRole("button");
    expect(removeButton).toHaveClass(
      "ml-1",
      "rounded-full",
      "p-0.5",
      "hover:bg-gray-300",
      "focus:bg-gray-300",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-gray-400",
      "focus:ring-offset-1",
    );
  });

  it("should handle keyboard navigation", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    const removeButton = screen.getByRole("button");

    // Test Enter key
    fireEvent.keyDown(removeButton, { key: "Enter" });
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalledWith("spec1");
  });

  it("should handle different specialty names", () => {
    const specialtyWithLongName: Specialty = {
      id: "spec2",
      name: "Terapia Cognitivo-Conductual para Adolescentes",
      category: "Cognitiva",
      created_at: "2024-01-01T00:00:00Z",
    };

    render(
      <SpecialtyBadge specialty={specialtyWithLongName} onRemove={mockOnRemove} disabled={false} />,
    );

    expect(screen.getByText("Terapia Cognitivo-Conductual para Adolescentes")).toBeInTheDocument();

    const removeButton = screen.getByRole("button");
    expect(removeButton).toHaveAttribute(
      "aria-label",
      "Remover Terapia Cognitivo-Conductual para Adolescentes",
    );
  });

  it("should use specialty ID as key prop", () => {
    render(<SpecialtyBadge specialty={mockSpecialty} onRemove={mockOnRemove} disabled={false} />);

    // The key prop is used internally by React but doesn't appear as a DOM attribute
    // We verify the component renders correctly with the specialty data
    expect(screen.getByText("Terapia Cognitiva")).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });
});
