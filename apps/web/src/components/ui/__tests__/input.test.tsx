import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Input } from "../input";

describe("Input", () => {
  it("should render with default props", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "input");
    // Input without explicit type behaves as text input (default behavior)
    // When type is undefined, the attribute is not set in HTML
    expect(input).not.toHaveAttribute("type");
  });

  it("should render with different input types", () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

    rerender(<Input type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");

    rerender(<Input type="tel" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "tel");

    rerender(<Input type="url" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "url");
  });

  it("should render date input with special styling", () => {
    render(<Input type="date" />);

    const input = screen.getByDisplayValue("");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveClass("box-border", "block", "w-full", "max-w-full", "min-w-full");
    expect(input).toHaveStyle({
      width: "100%",
      minWidth: "100%",
      maxWidth: "100%",
      display: "block",
      boxSizing: "border-box",
    });
  });

  it("should handle value and onChange", () => {
    const handleChange = vi.fn();
    render(<Input value="test value" onChange={handleChange} />);

    const input = screen.getByDisplayValue("test value");
    expect(input).toHaveValue("test value");

    input.focus();
    (input as HTMLInputElement).setSelectionRange(0, 0);
    (input as HTMLInputElement).setRangeText("new");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(handleChange).toHaveBeenCalled();
  });

  it("should handle placeholder", () => {
    render(<Input placeholder="Enter your name" />);

    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toHaveAttribute("placeholder", "Enter your name");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:pointer-events-none",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );
  });

  it("should accept custom className", () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("should handle required attribute", () => {
    render(<Input required />);

    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
  });

  it("should handle aria-invalid attribute", () => {
    render(<Input aria-invalid="true" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass(
      "aria-invalid:ring-destructive/20",
      "aria-invalid:border-destructive",
    );
  });

  it("should handle name and id attributes", () => {
    render(<Input name="username" id="user-input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "username");
    expect(input).toHaveAttribute("id", "user-input");
  });

  it("should handle min and max attributes for number input", () => {
    render(<Input type="number" min="0" max="100" />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
  });

  it("should handle step attribute for number input", () => {
    render(<Input type="number" step="0.1" />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("step", "0.1");
  });

  it("should handle pattern attribute", () => {
    render(<Input pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("pattern", "[0-9]{3}-[0-9]{3}-[0-9]{4}");
  });

  it("should handle autoComplete attribute", () => {
    render(<Input autoComplete="email" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("should apply focus styles correctly", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("focus-visible:border-ring", "focus-visible:ring-ring/50");
  });

  it("should handle file input type", () => {
    render(<Input type="file" />);

    const input = screen.getByDisplayValue("");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveClass("file:inline-flex", "file:h-7", "file:border-0");
  });

  it("should pass through all input props", () => {
    render(<Input data-testid="test-input" aria-label="Test input" tabIndex={1} />);

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("aria-label", "Test input");
    expect(input).toHaveAttribute("tabindex", "1");
  });
});
