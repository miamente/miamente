import React from "react";
import { render, screen } from "@testing-library/react";
import { LanguagesMultiSelect } from "../professional-info/LanguagesMultiSelect";
import { TooltipProvider } from "@/components/ui/tooltip";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

describe("LanguagesMultiSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(
      <TestWrapper>
        <LanguagesMultiSelect />
      </TestWrapper>,
    );

    expect(screen.getByText("Idiomas")).toBeInTheDocument();
  });

  it("should render with empty value array", () => {
    render(
      <TestWrapper>
        <LanguagesMultiSelect value={[]} />
      </TestWrapper>,
    );

    expect(screen.getByText("Idiomas")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(
      <TestWrapper>
        <LanguagesMultiSelect disabled={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Idiomas")).toBeInTheDocument();
  });

  it("should render with onChange callback", () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <LanguagesMultiSelect onChange={mockOnChange} />
      </TestWrapper>,
    );

    expect(screen.getByText("Idiomas")).toBeInTheDocument();
  });

  it("should render with initial languages", () => {
    render(
      <TestWrapper>
        <LanguagesMultiSelect value={["Español", "Inglés"]} />
      </TestWrapper>,
    );

    expect(screen.getByText("Idiomas")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.getByText("Inglés")).toBeInTheDocument();
  });
});
