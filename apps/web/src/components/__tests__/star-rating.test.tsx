import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "../star-rating";
import { vi, describe, it, expect } from "vitest";

describe("StarRating", () => {
  it("should render with default props", () => {
    render(<StarRating rating={3} />);

    // Should render 5 stars by default
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("should render with custom maxRating", () => {
    render(<StarRating rating={2} maxRating={3} />);

    // Should render 3 stars
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(3);
  });

  it("should render with different sizes", () => {
    const { rerender } = render(<StarRating rating={3} size="sm" />);
    expect(screen.getAllByRole("button")).toHaveLength(5);

    rerender(<StarRating rating={3} size="md" />);
    expect(screen.getAllByRole("button")).toHaveLength(5);

    rerender(<StarRating rating={3} size="lg" />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("should be interactive when interactive prop is true", () => {
    const mockOnRatingChange = vi.fn();
    render(<StarRating rating={0} interactive={true} onRatingChange={mockOnRatingChange} />);

    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // Click third star

    expect(mockOnRatingChange).toHaveBeenCalledWith(3);
  });

  it("should not be interactive when interactive prop is false", () => {
    const mockOnRatingChange = vi.fn();
    render(<StarRating rating={3} interactive={false} onRatingChange={mockOnRatingChange} />);

    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[0]); // Click first star

    expect(mockOnRatingChange).not.toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<StarRating rating={3} disabled={true} />);

    const stars = screen.getAllByRole("button");
    stars.forEach((star) => {
      expect(star).toBeDisabled();
    });
  });

  it("should display correct number of filled stars", () => {
    render(<StarRating rating={3} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    // First 3 stars should be filled, last 2 should be empty
    expect(stars[0]).toHaveClass("text-yellow-400");
    expect(stars[1]).toHaveClass("text-yellow-400");
    expect(stars[2]).toHaveClass("text-yellow-400");
    expect(stars[3]).toHaveClass("text-neutral-300");
    expect(stars[4]).toHaveClass("text-neutral-300");
  });

  it("should handle zero rating", () => {
    render(<StarRating rating={0} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    stars.forEach((star) => {
      expect(star).toHaveClass("text-neutral-300");
    });
  });

  it("should handle maximum rating", () => {
    render(<StarRating rating={5} maxRating={5} />);

    const stars = screen.getAllByRole("button");
    stars.forEach((star) => {
      expect(star).toHaveClass("text-yellow-400");
    });
  });
});
