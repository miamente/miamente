import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../select-simple";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SelectSimple Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Select", () => {
    it("should render with default props", () => {
      render(
        <Select>
          <span>Select an option</span>
        </Select>,
      );

      const select = screen.getByRole("button");
      expect(select).toBeInTheDocument();
      expect(select).toHaveClass("h-10", "w-full", "rounded-md", "border");
      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Select className="custom-class">
          <span>Custom Select</span>
        </Select>,
      );

      const select = screen.getByRole("button");
      expect(select).toHaveClass("custom-class");
    });

    it("should handle click events", () => {
      const handleClick = vi.fn();
      render(
        <Select onClick={handleClick}>
          <span>Click me</span>
        </Select>,
      );

      const select = screen.getByRole("button");
      fireEvent.click(select);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle onValueChange", () => {
      const handleValueChange = vi.fn();
      render(
        <Select value="test" onValueChange={handleValueChange}>
          <span>Test Select</span>
        </Select>,
      );

      const select = screen.getByRole("button");
      expect(select).toBeInTheDocument();
      // Note: onValueChange would typically be triggered by internal logic
    });

    it("should be disabled when disabled prop is true", () => {
      render(
        <Select disabled>
          <span>Disabled Select</span>
        </Select>,
      );

      const select = screen.getByRole("button");
      expect(select).toBeDisabled();
      expect(select).toHaveClass("disabled:opacity-50");
    });

    it("should render with ChevronDownIcon", () => {
      render(
        <Select>
          <span>Select with icon</span>
        </Select>,
      );

      const select = screen.getByRole("button");
      const icon = select.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4", "opacity-50");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Select ref={ref}>
          <span>Ref test</span>
        </Select>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("SelectTrigger", () => {
    it("should render with default props", () => {
      render(
        <SelectTrigger>
          <span>Trigger</span>
        </SelectTrigger>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass("h-10", "w-full", "rounded-md", "border");
    });

    it("should render with custom className", () => {
      render(
        <SelectTrigger className="trigger-class">
          <span>Custom Trigger</span>
        </SelectTrigger>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveClass("trigger-class");
    });

    it("should be disabled when disabled prop is true", () => {
      render(
        <SelectTrigger disabled>
          <span>Disabled Trigger</span>
        </SelectTrigger>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toBeDisabled();
    });

    it("should render with ChevronDownIcon", () => {
      render(
        <SelectTrigger>
          <span>Trigger with icon</span>
        </SelectTrigger>,
      );

      const trigger = screen.getByRole("button");
      const icon = trigger.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <SelectTrigger ref={ref}>
          <span>Ref test</span>
        </SelectTrigger>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("SelectValue", () => {
    it("should render with placeholder when no children", () => {
      render(<SelectValue placeholder="Select an option" />);

      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("should render children when provided", () => {
      render(<SelectValue placeholder="Select an option">Selected Value</SelectValue>);

      expect(screen.getByText("Selected Value")).toBeInTheDocument();
      expect(screen.queryByText("Select an option")).not.toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <SelectValue className="value-class" placeholder="Test">
          Test Value
        </SelectValue>,
      );

      const value = screen.getByText("Test Value");
      expect(value).toHaveClass("value-class", "block", "truncate");
    });

    it("should handle empty placeholder", () => {
      render(<SelectValue placeholder="" />);

      // When placeholder is empty, the span element should be present but empty
      const spans = screen.getAllByRole("generic");
      const valueSpan = spans.find((span) => span.className === "block truncate");
      expect(valueSpan).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(
        <SelectValue ref={ref} placeholder="Test">
          Test Value
        </SelectValue>,
      );

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe("SelectContent", () => {
    it("should render with default props", () => {
      render(
        <SelectContent>
          <div>Content item</div>
        </SelectContent>,
      );

      const content = screen.getByText("Content item").parentElement;
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("z-50", "min-w-[8rem]", "rounded-md", "border", "p-1");
    });

    it("should render with custom className", () => {
      render(
        <SelectContent className="content-class">
          <div>Custom content</div>
        </SelectContent>,
      );

      const content = screen.getByText("Custom content").parentElement;
      expect(content).toHaveClass("content-class");
    });

    it("should render multiple children", () => {
      render(
        <SelectContent>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </SelectContent>,
      );

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SelectContent ref={ref}>
          <div>Ref test</div>
        </SelectContent>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("SelectItem", () => {
    it("should render with value prop", () => {
      render(<SelectItem value="option1">Option 1</SelectItem>);

      const item = screen.getByText("Option 1").closest("div");
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute("data-value", "option1");
    });

    it("should render with custom className", () => {
      render(
        <SelectItem value="option1" className="item-class">
          Custom Item
        </SelectItem>,
      );

      const item = screen.getByText("Custom Item").closest("div");
      expect(item).toHaveClass("item-class", "cursor-default", "rounded-sm");
    });

    it("should handle click events", () => {
      const handleClick = vi.fn();
      render(
        <SelectItem value="option1" onClick={handleClick}>
          Clickable Item
        </SelectItem>,
      );

      const item = screen.getByText("Clickable Item").closest("div");
      fireEvent.click(item!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when data-disabled is true", () => {
      render(
        <SelectItem value="option1" data-disabled>
          Disabled Item
        </SelectItem>,
      );

      const item = screen.getByText("Disabled Item").closest("div");
      expect(item).toHaveClass("data-[disabled]:pointer-events-none", "data-[disabled]:opacity-50");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SelectItem ref={ref} value="option1">
          Ref test
        </SelectItem>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should handle different value types", () => {
      const values = ["string", "123", "option-with-dash", "option_with_underscore"];

      values.forEach((value) => {
        const { unmount } = render(<SelectItem value={value}>Item {value}</SelectItem>);

        const item = screen.getByText(`Item ${value}`).closest("div");
        expect(item).toHaveAttribute("data-value", value);
        unmount();
      });
    });
  });

  describe("Component Integration", () => {
    it("should render complete select structure", () => {
      render(
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
          </Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </div>,
      );

      expect(screen.getByText("Choose an option")).toBeInTheDocument();
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("should handle nested components correctly", () => {
      render(
        <Select>
          <SelectValue placeholder="Select...">
            <span>Custom Value</span>
          </SelectValue>
        </Select>,
      );

      expect(screen.getByText("Custom Value")).toBeInTheDocument();
      expect(screen.queryByText("Select...")).not.toBeInTheDocument();
    });

    it("should maintain proper styling hierarchy", () => {
      render(
        <Select className="select-class">
          <SelectValue className="value-class" placeholder="Test">
            Test Value
          </SelectValue>
        </Select>,
      );

      const select = screen.getByRole("button");
      expect(select).toHaveClass("select-class");

      const value = screen.getByText("Test Value");
      expect(value).toHaveClass("value-class");
    });
  });
});
