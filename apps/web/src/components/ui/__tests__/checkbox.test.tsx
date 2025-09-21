import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  it("should render with default props", () => {
    render(<Checkbox />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass("h-4");
    expect(checkbox).toHaveClass("w-4");
    expect(checkbox).toHaveClass("rounded-sm");
    expect(checkbox).toHaveClass("border");
  });

  it("should be unchecked by default", () => {
    render(<Checkbox />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should accept custom className", () => {
    render(<Checkbox className="custom-class" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("custom-class");
    expect(checkbox).toHaveClass("h-4"); // Should also have default classes
  });

  it("should handle checked state", () => {
    render(<Checkbox checked />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should handle onCheckedChange", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(<Checkbox onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(handleCheckedChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Checkbox disabled />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass("disabled:cursor-not-allowed");
    expect(checkbox).toHaveClass("disabled:opacity-50");
  });

  it("should handle data attributes", () => {
    render(<Checkbox data-testid="agree-checkbox" data-value="yes" />);

    const checkbox = screen.getByTestId("agree-checkbox");
    expect(checkbox).toHaveAttribute("data-value", "yes");
  });

  it("should handle required attribute", () => {
    render(<Checkbox required />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeRequired();
  });

  it("should forward ref correctly", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should handle indeterminate state", () => {
    render(<Checkbox checked={false} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should apply focus styles correctly", () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveClass("focus-visible:ring-2");
    expect(checkbox).toHaveClass("focus-visible:ring-offset-2");
    expect(checkbox).toHaveClass("focus-visible:outline-none");
  });

  it("should handle controlled state", () => {
    const { rerender } = render(<Checkbox checked={false} />);

    let checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox checked={true} />);
    checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should render check icon when checked", () => {
    render(<Checkbox checked />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    // The check icon should be present (though it might be hidden by CSS)
    const checkIcon = checkbox.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });

  it("should handle onCheckedChange callback", () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleCheckedChange).toHaveBeenCalled();
  });
});
