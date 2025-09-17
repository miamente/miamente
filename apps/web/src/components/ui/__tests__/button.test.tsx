import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Button } from "../button";

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("should render with different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-primary");
  });

  it("should render with different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9");

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-8");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-9");
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
  });

  it("should accept custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should pass through all button props", () => {
    render(
      <Button type="submit" form="test-form" data-testid="test-button" aria-label="Submit form">
        Submit
      </Button>,
    );

    const button = screen.getByTestId("test-button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("form", "test-form");
    expect(button).toHaveAttribute("aria-label", "Submit form");
  });

  it("should render with icon and text", () => {
    render(
      <Button>
        <svg data-testid="icon" />
        Button with icon
      </Button>,
    );

    const button = screen.getByRole("button");
    const icon = screen.getByTestId("icon");

    expect(button).toHaveTextContent("Button with icon");
    expect(icon).toBeInTheDocument();
  });

  it("should apply focus styles correctly", () => {
    render(<Button>Focus me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("focus-visible:border-ring", "focus-visible:ring-ring/50");
  });
});
