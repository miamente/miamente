import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfessionalCardSkeleton } from "../professional-card-skeleton";

describe("ProfessionalCardSkeleton", () => {
  it("should render skeleton elements", () => {
    render(<ProfessionalCardSkeleton />);

    // Check for skeleton elements by their classes
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render a card structure", () => {
    render(<ProfessionalCardSkeleton />);

    // Check for card structure using data-testid
    const card = screen.getByTestId("professional-card-skeleton");
    expect(card).toHaveClass("flex", "flex-col");
  });

  it("should have proper skeleton classes", () => {
    render(<ProfessionalCardSkeleton />);

    // Find all skeleton elements by their classes
    const skeletons = screen.getAllByRole("generic");
    const skeletonElements = skeletons.filter((el) => el.className.includes("animate-pulse"));

    expect(skeletonElements.length).toBeGreaterThan(0);

    // Check that skeleton elements have the animate-pulse class
    skeletonElements.forEach((skeleton) => {
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  it("should have proper background colors", () => {
    render(<ProfessionalCardSkeleton />);

    const skeletons = screen.getAllByRole("generic");
    const skeletonElements = skeletons.filter((el) => el.className.includes("animate-pulse"));

    // Check that all skeleton elements have the bg-muted class
    skeletonElements.forEach((skeleton) => {
      expect(skeleton).toHaveClass("bg-muted");
    });
  });

  it("should have proper rounded corners", () => {
    render(<ProfessionalCardSkeleton />);

    const skeletons = screen.getAllByRole("generic");
    const roundedSkeletons = skeletons.filter((el) => el.className.includes("rounded-md"));

    expect(roundedSkeletons.length).toBeGreaterThan(0);
  });

  it("should have proper heights", () => {
    render(<ProfessionalCardSkeleton />);

    const skeletons = screen.getAllByRole("generic");
    const skeletonElements = skeletons.filter((el) => el.className.includes("animate-pulse"));

    // Check for specific height classes
    const heightClasses = ["h-6", "h-4", "h-40", "h-9"];
    const hasHeightClasses = skeletonElements.some((skeleton) =>
      heightClasses.some((heightClass) => skeleton.className.includes(heightClass)),
    );

    expect(hasHeightClasses).toBe(true);
  });

  it("should have proper widths", () => {
    render(<ProfessionalCardSkeleton />);

    const skeletons = screen.getAllByRole("generic");
    const skeletonElements = skeletons.filter((el) => el.className.includes("animate-pulse"));

    // Check for specific width classes
    const widthClasses = ["w-3/4", "w-1/2", "w-1/3", "w-full", "w-4/5", "w-3/5"];
    const hasWidthClasses = skeletonElements.some((skeleton) =>
      widthClasses.some((widthClass) => skeleton.className.includes(widthClass)),
    );

    expect(hasWidthClasses).toBe(true);
  });

  it("should have proper spacing", () => {
    render(<ProfessionalCardSkeleton />);

    const skeletons = screen.getAllByRole("generic");
    const spaceElements = skeletons.filter((el) => el.className.includes("space-y-2"));

    expect(spaceElements.length).toBeGreaterThan(0);
  });

  it("should render header and content sections", () => {
    render(<ProfessionalCardSkeleton />);

    // Check for card header and content structure
    const cardElements = screen.getAllByRole("generic");
    const hasHeader = cardElements.some(
      (el) => el.className.includes("card-header") || el.className.includes("px-6"),
    );
    const hasContent = cardElements.some(
      (el) => el.className.includes("card-content") || el.className.includes("flex-1"),
    );

    expect(hasHeader).toBe(true);
    expect(hasContent).toBe(true);
  });
});
