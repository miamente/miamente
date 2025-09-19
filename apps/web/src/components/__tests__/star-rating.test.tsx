import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { StarRating } from "../star-rating";

describe("StarRating", () => {
  const defaultProps = {
    rating: 3,
    maxRating: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<StarRating {...defaultProps} />);

    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
    expect(stars[0]).toHaveAttribute("aria-label", "1 estrella");
    expect(stars[4]).toHaveAttribute("aria-label", "5 estrellas");
  });

  it("should render correct number of stars based on maxRating", () => {
    render(<StarRating rating={2} maxRating={3} />);

    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(3);
  });

  it("should display filled stars for rating", () => {
    render(<StarRating rating={3} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // First 3 stars should be filled (★)
    expect(stars[0]).toHaveTextContent("★");
    expect(stars[1]).toHaveTextContent("★");
    expect(stars[2]).toHaveTextContent("★");
    // Last 2 stars should be empty (★ but with different styling)
    expect(stars[3]).toHaveTextContent("★");
    expect(stars[4]).toHaveTextContent("★");
  });

  it("should display half-filled star for decimal rating", () => {
    render(<StarRating rating={3.5} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // First 3 stars should be filled
    expect(stars[0]).toHaveTextContent("★");
    expect(stars[1]).toHaveTextContent("★");
    expect(stars[2]).toHaveTextContent("★");
    // 4th star should be half-filled (☆)
    expect(stars[3]).toHaveTextContent("☆");
    // 5th star should be empty
    expect(stars[4]).toHaveTextContent("★");
  });

  it("should apply correct size classes", () => {
    const { rerender } = render(<StarRating {...defaultProps} size="sm" />);
    expect(screen.getAllByRole("button")[0]).toHaveClass("text-lg");

    rerender(<StarRating {...defaultProps} size="md" />);
    expect(screen.getAllByRole("button")[0]).toHaveClass("text-2xl");

    rerender(<StarRating {...defaultProps} size="lg" />);
    expect(screen.getAllByRole("button")[0]).toHaveClass("text-3xl");
  });

  it("should be interactive when interactive prop is true", () => {
    const onRatingChange = vi.fn();
    render(<StarRating {...defaultProps} interactive={true} onRatingChange={onRatingChange} />);

    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveClass("cursor-pointer");
    expect(stars[0]).not.toBeDisabled();

    fireEvent.click(stars[0]);
    expect(onRatingChange).toHaveBeenCalledWith(1);
  });

  it("should not be interactive when interactive prop is false", () => {
    const onRatingChange = vi.fn();
    render(<StarRating {...defaultProps} interactive={false} onRatingChange={onRatingChange} />);

    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveClass("cursor-default");
    expect(stars[0]).toBeDisabled();

    fireEvent.click(stars[0]);
    expect(onRatingChange).not.toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    const onRatingChange = vi.fn();
    render(
      <StarRating
        {...defaultProps}
        interactive={true}
        disabled={true}
        onRatingChange={onRatingChange}
      />,
    );

    const stars = screen.getAllByRole("button");
    expect(stars[0]).toBeDisabled();

    fireEvent.click(stars[0]);
    expect(onRatingChange).not.toHaveBeenCalled();
  });

  it("should call onRatingChange with correct rating when star is clicked", () => {
    const onRatingChange = vi.fn();
    render(<StarRating {...defaultProps} interactive={true} onRatingChange={onRatingChange} />);

    const stars = screen.getAllByRole("button");

    fireEvent.click(stars[2]); // Click 3rd star
    expect(onRatingChange).toHaveBeenCalledWith(3);

    fireEvent.click(stars[4]); // Click 5th star
    expect(onRatingChange).toHaveBeenCalledWith(5);
  });

  it("should handle zero rating", () => {
    render(<StarRating rating={0} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // All stars should be empty (★ but with different styling)
    stars.forEach((star) => {
      expect(star).toHaveTextContent("★");
    });
  });

  it("should handle rating equal to maxRating", () => {
    render(<StarRating rating={5} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // All stars should be filled
    stars.forEach((star) => {
      expect(star).toHaveTextContent("★");
    });
  });

  it("should handle rating greater than maxRating", () => {
    render(<StarRating rating={7} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // All stars should be filled when rating exceeds max
    stars.forEach((star) => {
      expect(star).toHaveTextContent("★");
    });
  });

  it("should handle negative rating", () => {
    render(<StarRating rating={-1} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // All stars should be empty for negative rating (★ but with different styling)
    stars.forEach((star) => {
      expect(star).toHaveTextContent("★");
    });
  });

  it("should apply correct color classes for filled and empty stars", () => {
    render(<StarRating rating={2} maxRating={5} />);

    const stars = screen.getAllByRole("button");

    // Filled stars should have yellow color
    expect(stars[0]).toHaveClass("text-yellow-400");
    expect(stars[1]).toHaveClass("text-yellow-400");

    // Empty stars should have neutral color
    expect(stars[2]).toHaveClass("text-neutral-300", "dark:text-neutral-600");
    expect(stars[3]).toHaveClass("text-neutral-300", "dark:text-neutral-600");
    expect(stars[4]).toHaveClass("text-neutral-300", "dark:text-neutral-600");
  });

  it("should handle hover effects when interactive", () => {
    render(<StarRating {...defaultProps} interactive={true} />);

    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveClass("transition-transform", "hover:scale-110");
  });

  it("should not have hover effects when not interactive", () => {
    render(<StarRating {...defaultProps} interactive={false} />);

    const stars = screen.getAllByRole("button");
    expect(stars[0]).not.toHaveClass("hover:scale-110");
  });
});
