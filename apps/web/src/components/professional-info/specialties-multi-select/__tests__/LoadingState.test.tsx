import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingState } from "../LoadingState";

describe("LoadingState", () => {
  it("should render with provided label", () => {
    render(<LoadingState label="Test Label" />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Cargando especialidades...")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<LoadingState label="Especialidades" />);

    const container = screen.getByRole("status");
    expect(container).toHaveAttribute("aria-live", "polite");
  });

  it("should render with custom label", () => {
    const customLabel = "Custom Specialties Label";
    render(<LoadingState label={customLabel} />);

    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it("should have proper structure", () => {
    const { container } = render(<LoadingState label="Test" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("space-y-2");
    expect(wrapper.tagName).toBe("OUTPUT");
  });

  it("should display loading message in Spanish", () => {
    render(<LoadingState label="Test" />);

    expect(screen.getByText("Cargando especialidades...")).toBeInTheDocument();
  });
});
