import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("should render with default props", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("bg-muted");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("should accept custom className", () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("custom-class");
    expect(skeleton).toHaveClass("bg-muted"); // Should also have default classes
  });

  it("should pass through additional props", () => {
    render(<Skeleton data-testid="skeleton-test" aria-label="Loading content" />);

    const skeleton = screen.getByTestId("skeleton-test");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-label", "Loading content");
  });

  it("should handle children", () => {
    render(
      <Skeleton data-testid="skeleton">
        <div>Loading content</div>
      </Skeleton>
    );

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveTextContent("Loading content");
  });

  it("should merge classes correctly", () => {
    render(<Skeleton className="w-4 h-4" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("bg-muted");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
    expect(skeleton).toHaveClass("w-4");
    expect(skeleton).toHaveClass("h-4");
  });

  it("should handle empty className", () => {
    render(<Skeleton className="" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("bg-muted");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("should handle undefined className", () => {
    render(<Skeleton className={undefined} data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("bg-muted");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });
});