import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("should render with default props", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("bg-muted", "animate-pulse", "rounded-md");
  });

  it("should accept custom className", () => {
    const { container } = render(<Skeleton className="custom-class h-4 w-32" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("custom-class", "h-4", "w-32");
    expect(skeleton).toHaveClass("bg-muted", "animate-pulse", "rounded-md");
  });

  it("should pass through all props", () => {
    render(
      <Skeleton
        data-testid="test-skeleton"
        title="Test skeleton"
        id="skeleton-id"
        style={{ height: "20px", width: "100px" }}
      />,
    );

    const skeleton = screen.getByTestId("test-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("title", "Test skeleton");
    expect(skeleton).toHaveAttribute("id", "skeleton-id");
    expect(skeleton).toHaveStyle({ height: "20px", width: "100px" });
  });

  it("should have correct base styles", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("bg-muted", "animate-pulse", "rounded-md");
  });

  it("should merge classes correctly with cn utility", () => {
    const { container } = render(<Skeleton className="h-8 w-16 bg-red-500" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-8", "w-16", "bg-red-500");
    expect(skeleton).toHaveClass("animate-pulse", "rounded-md");
    // bg-muted is overridden by bg-red-500, which is expected
  });

  it("should handle aria attributes", () => {
    const { container } = render(<Skeleton aria-label="Loading content" aria-hidden="false" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute("aria-label", "Loading content");
    expect(skeleton).toHaveAttribute("aria-hidden", "false");
  });

  it("should handle data attributes", () => {
    const { container } = render(<Skeleton data-loading="true" data-type="text" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute("data-loading", "true");
    expect(skeleton).toHaveAttribute("data-type", "text");
  });

  it("should handle multiple className overrides", () => {
    const { container } = render(<Skeleton className="h-12 w-24 rounded-lg bg-blue-500" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-12", "w-24", "bg-blue-500", "rounded-lg");
    expect(skeleton).toHaveClass("animate-pulse");
    // bg-muted and rounded-md are overridden by bg-blue-500 and rounded-lg, which is expected
  });

  it("should be accessible with proper ARIA attributes", () => {
    render(<Skeleton aria-label="Loading skeleton" role="presentation" />);

    const skeleton = screen.getByLabelText("Loading skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("role", "presentation");
  });

  it("should handle empty className", () => {
    const { container } = render(<Skeleton className="" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("bg-muted", "animate-pulse", "rounded-md");
  });

  it("should handle undefined className", () => {
    const { container } = render(<Skeleton className={undefined} />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("bg-muted", "animate-pulse", "rounded-md");
  });
});
