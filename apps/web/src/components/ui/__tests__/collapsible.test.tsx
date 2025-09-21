import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../collapsible";

describe("Collapsible", () => {
  it("should render Collapsible component", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByText("Toggle");
    const content = document.querySelector('[data-slot="collapsible-content"]');

    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "collapsible-trigger");
    expect(content).toHaveAttribute("data-slot", "collapsible-content");
  });

  it("should handle open state", () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const content = screen.getByText("Content");
    expect(content).toBeInTheDocument();
  });

  it("should handle closed state", () => {
    render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const content = document.querySelector('[data-slot="collapsible-content"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-state", "closed");
  });

  it("should handle onOpenChange callback", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <Collapsible onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByText("Toggle");
    await user.click(trigger);

    expect(handleOpenChange).toHaveBeenCalled();
  });

  it("should handle disabled state", () => {
    render(
      <Collapsible disabled>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByText("Toggle");
    expect(trigger).toBeDisabled();
  });

  it("should pass through props to root component", () => {
    render(
      <Collapsible data-testid="collapsible" className="custom-class">
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const collapsible = screen.getByTestId("collapsible");
    expect(collapsible).toBeInTheDocument();
    expect(collapsible).toHaveClass("custom-class");
    expect(collapsible).toHaveAttribute("data-slot", "collapsible");
  });

  it("should render multiple CollapsibleContent elements", () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>First Content</CollapsibleContent>
        <CollapsibleContent>Second Content</CollapsibleContent>
      </Collapsible>,
    );

    expect(screen.getByText("First Content")).toBeInTheDocument();
    expect(screen.getByText("Second Content")).toBeInTheDocument();
  });

  it("should handle trigger with custom props", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger data-testid="custom-trigger" className="trigger-class">
          Custom Toggle
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByTestId("custom-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("trigger-class");
    expect(trigger).toHaveTextContent("Custom Toggle");
  });

  it("should handle content with custom props", () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="custom-content" className="content-class">
          Custom Content
        </CollapsibleContent>
      </Collapsible>,
    );

    const content = screen.getByTestId("custom-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("content-class");
    expect(content).toHaveTextContent("Custom Content");
  });
});
