import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Badge } from "../badge";

describe("Badge", () => {
  it("should render with default props", () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText("Default Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
    expect(badge).toHaveClass("border-transparent", "bg-primary", "text-primary-foreground");
  });

  it("should render with default variant", () => {
    render(<Badge variant="default">Default Variant</Badge>);

    const badge = screen.getByText("Default Variant");
    expect(badge).toHaveClass("border-transparent", "bg-primary", "text-primary-foreground");
    expect(badge).toHaveClass("hover:bg-primary/80");
  });

  it("should render with secondary variant", () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText("Secondary Badge");
    expect(badge).toHaveClass("border-transparent", "bg-secondary", "text-secondary-foreground");
    expect(badge).toHaveClass("hover:bg-secondary/80");
  });

  it("should render with destructive variant", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);

    const badge = screen.getByText("Destructive Badge");
    expect(badge).toHaveClass(
      "border-transparent",
      "bg-destructive",
      "text-destructive-foreground",
    );
    expect(badge).toHaveClass("hover:bg-destructive/80");
  });

  it("should render with outline variant", () => {
    render(<Badge variant="outline">Outline Badge</Badge>);

    const badge = screen.getByText("Outline Badge");
    expect(badge).toHaveClass("text-foreground");
    expect(badge).not.toHaveClass("border-transparent");
  });

  it("should accept custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);

    const badge = screen.getByText("Custom Badge");
    expect(badge).toHaveClass("custom-class");
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
  });

  it("should pass through all props", () => {
    render(
      <Badge data-testid="test-badge" title="Test title" id="badge-id">
        Props Badge
      </Badge>,
    );

    const badge = screen.getByTestId("test-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("title", "Test title");
    expect(badge).toHaveAttribute("id", "badge-id");
    expect(badge).toHaveTextContent("Props Badge");
  });

  it("should render with focus styles", () => {
    render(<Badge>Focus Badge</Badge>);

    const badge = screen.getByText("Focus Badge");
    expect(badge).toHaveClass(
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-ring",
      "focus:ring-offset-2",
    );
  });

  it("should have correct base styles", () => {
    render(<Badge>Base Styles Badge</Badge>);

    const badge = screen.getByText("Base Styles Badge");
    expect(badge).toHaveClass(
      "inline-flex",
      "items-center",
      "rounded-full",
      "border",
      "px-2.5",
      "py-0.5",
      "text-xs",
      "font-semibold",
      "transition-colors",
    );
  });

  it("should handle empty content", () => {
    const { container } = render(<Badge />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("");
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
  });

  it("should handle complex content", () => {
    render(
      <Badge>
        <span data-testid="icon">🔔</span>
        <span>Notification</span>
      </Badge>,
    );

    const badge = screen.getByText("Notification");
    const icon = screen.getByTestId("icon");

    expect(badge).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent("🔔");
  });

  it("should merge classes correctly", () => {
    render(<Badge className="bg-red-500 text-white">Merged Classes</Badge>);

    const badge = screen.getByText("Merged Classes");
    expect(badge).toHaveClass("text-white", "bg-red-500");
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
  });
});
