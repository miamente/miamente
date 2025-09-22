import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../tooltip";

describe("Tooltip", () => {
  it("should render tooltip trigger", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText("Hover me");
    expect(trigger).toBeInTheDocument();
  });

  it("should render TooltipProvider", () => {
    render(
      <TooltipProvider>
        <div>Provider content</div>
      </TooltipProvider>,
    );

    expect(screen.getByText("Provider content")).toBeInTheDocument();
  });

  it("should render TooltipTrigger with custom content", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Custom trigger</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Custom trigger" });
    expect(trigger).toBeInTheDocument();
  });

  it("should render TooltipContent with controlled open state", () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-class">Custom styled tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // Check that the tooltip content exists in the DOM using getAllByText to handle multiple elements
    const contentElements = screen.getAllByText("Custom styled tooltip");
    expect(contentElements.length).toBeGreaterThan(0);
  });

  it("should pass through props to TooltipContent", () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content" title="Tooltip title" side="top">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const content = screen.getByTestId("tooltip-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("title", "Tooltip title");
  });

  it("should have correct display name", () => {
    expect(TooltipContent.displayName).toBe("TooltipContent");
  });

  it("should render all tooltip components", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("should render tooltip with open state", () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // Check that tooltip content exists (using getAllByText for Radix accessibility elements)
    const contentElements = screen.getAllByText("Tooltip content");
    expect(contentElements.length).toBeGreaterThan(0);
  });

  it("should render tooltip with custom sideOffset", () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent sideOffset={10}>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // Check that tooltip content exists
    const contentElements = screen.getAllByText("Tooltip content");
    expect(contentElements.length).toBeGreaterThan(0);
  });
});
