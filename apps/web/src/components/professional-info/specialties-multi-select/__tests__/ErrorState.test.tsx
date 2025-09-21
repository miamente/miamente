import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorState } from "../ErrorState";

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-circle" className={className} />
  ),
}));

describe("ErrorState", () => {
  it("should render with provided label and error", () => {
    render(<ErrorState label="Test Label" error="Test error message" />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Error: Test error message")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<ErrorState label="Especialidades" error="Failed to load" />);

    const container = screen.getByRole("alert");
    expect(container).toHaveAttribute("aria-live", "assertive");
  });

  it("should display alert icon", () => {
    render(<ErrorState label="Test" error="Error message" />);

    const icon = screen.getByTestId("alert-circle");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-4", "w-4", "text-red-500");
  });

  it("should have proper structure", () => {
    const { container } = render(<ErrorState label="Test" error="Error" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("space-y-2");
    expect(wrapper).toHaveAttribute("role", "alert");
  });

  it("should style error message correctly", () => {
    render(<ErrorState label="Test" error="Error message" />);

    const errorMessage = screen.getByText("Error: Error message");
    expect(errorMessage).toHaveClass("text-sm", "text-red-500");
  });

  it("should handle long error messages", () => {
    const longError = "This is a very long error message that should be displayed correctly";
    render(<ErrorState label="Test" error={longError} />);

    expect(screen.getByText(`Error: ${longError}`)).toBeInTheDocument();
  });

  it("should handle empty error message", () => {
    render(<ErrorState label="Test" error="" />);

    expect(screen.getByText("Error:")).toBeInTheDocument();
  });

  it("should display label with icon in flex layout", () => {
    render(<ErrorState label="Test Label" error="Error" />);

    const label = screen.getByText("Test Label").closest("label");
    expect(label).toHaveClass("flex", "items-center", "gap-2");
  });
});
