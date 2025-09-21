import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Label } from "../label";

describe("Label", () => {
  it("should render with default props", () => {
    render(<Label>Test Label</Label>);

    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
    expect(label).toHaveClass("leading-none");
    expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
    expect(label).toHaveClass("peer-disabled:opacity-70");
  });

  it("should accept custom className", () => {
    render(<Label className="custom-class">Test Label</Label>);

    const label = screen.getByText("Test Label");
    expect(label).toHaveClass("custom-class");
    expect(label).toHaveClass("text-sm"); // Should also have default classes
  });

  it("should pass through all props", () => {
    render(
      <Label htmlFor="test-input" data-testid="test-label">
        Test Label
      </Label>,
    );

    const label = screen.getByTestId("test-label");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("should forward ref correctly", () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Test Label</Label>);

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current?.textContent).toBe("Test Label");
  });

  it("should handle empty children", () => {
    render(<Label />);

    const label = document.querySelector("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-sm");
  });

  it("should merge classes correctly with cn utility", () => {
    render(<Label className="text-lg">Test Label</Label>);

    const label = screen.getByText("Test Label");
    // text-lg should override text-sm due to cn utility
    expect(label).toHaveClass("text-lg");
    expect(label).toHaveClass("font-medium");
  });
});
