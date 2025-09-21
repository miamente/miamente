import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Select, SelectOption } from "../select";

const mockOptions: SelectOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("Select", () => {
  it("should render with default props", () => {
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(selectTrigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(screen.getByText("Seleccionar...")).toBeInTheDocument();
  });

  it("should render with custom placeholder", () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);

    expect(screen.getByText("Choose an option")).toBeInTheDocument();
  });

  it("should display selected option", () => {
    render(<Select options={mockOptions} value="option2" />);

    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.queryByText("Seleccionar...")).not.toBeInTheDocument();
  });

  it("should open dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should close dropdown when option is selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const option2 = screen.getByText("Option 2");
    await user.click(option2);

    expect(onValueChange).toHaveBeenCalledWith("option2");
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("should handle disabled state", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} disabled />);

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveAttribute("tabindex", "-1");
    expect(selectTrigger).toHaveClass("cursor-not-allowed", "opacity-50");

    await user.click(selectTrigger);
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should accept custom className", () => {
    render(<Select options={mockOptions} className="custom-class" />);

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveClass("custom-class");
  });

  it("should handle aria attributes", () => {
    render(
      <Select
        options={mockOptions}
        aria-label="Custom select"
        aria-describedby="select-description"
      />,
    );

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveAttribute("aria-label", "Custom select");
    expect(selectTrigger).toHaveAttribute("aria-describedby", "select-description");
  });

  it("should handle keyboard navigation - Enter key", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should handle keyboard navigation - Space key", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard(" ");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should handle keyboard navigation - Escape key", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should handle keyboard navigation - ArrowDown", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} value="option1" onValueChange={onValueChange} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    expect(onValueChange).toHaveBeenCalledWith("option2");
  });

  it("should handle keyboard navigation - ArrowUp", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} value="option3" onValueChange={onValueChange} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowUp}");

    expect(onValueChange).toHaveBeenCalledWith("option2");
  });

  it("should open dropdown with ArrowDown when closed", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should open dropdown with ArrowUp when closed", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{ArrowUp}");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should not navigate beyond first option with ArrowUp", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} value="option1" onValueChange={onValueChange} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowUp}");

    expect(onValueChange).toHaveBeenCalledWith("option1");
  });

  it("should not navigate beyond last option with ArrowDown", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} value="option3" onValueChange={onValueChange} />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    expect(onValueChange).toHaveBeenCalledWith("option3");
  });

  it("should not handle keyboard events when disabled", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} disabled />);

    const selectTrigger = screen.getByRole("combobox");
    selectTrigger.focus();
    await user.keyboard("{Enter}");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should handle click outside to close dropdown", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Select options={mockOptions} />
        <button>Outside button</button>
      </div>,
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");

    // Wait a bit for the click outside handler to be set up
    await new Promise((resolve) => setTimeout(resolve, 150));

    const outsideButton = screen.getByText("Outside button");
    await user.click(outsideButton);

    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
  });

  it("should update selected option when value prop changes", () => {
    const { rerender } = render(<Select options={mockOptions} value="option1" />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();

    rerender(<Select options={mockOptions} value="option2" />);

    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
  });

  it("should handle empty options array", () => {
    render(<Select options={[]} />);

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
    expect(screen.getByText("Seleccionar...")).toBeInTheDocument();
  });

  it("should handle option with same value as placeholder", () => {
    const optionsWithPlaceholderValue = [
      { value: "Seleccionar...", label: "Seleccionar..." },
      { value: "option1", label: "Option 1" },
    ];

    render(<Select options={optionsWithPlaceholderValue} />);

    expect(screen.getByText("Seleccionar...")).toBeInTheDocument();
  });

  it("should have correct accessibility attributes", () => {
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(selectTrigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(selectTrigger).toHaveAttribute("aria-controls", "select-listbox");
  });

  it("should mark selected option as aria-selected", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} value="option2" />);

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const options = screen.getAllByText("Option 2");
    const optionElement = options.find((el) => el.closest('[role="option"]'));
    expect(optionElement?.closest('[role="option"]')).toHaveAttribute("aria-selected", "true");
  });

  it("should handle touch events on mobile", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const option1 = screen.getByText("Option 1");
    const optionElement = option1.closest('[role="option"]') as HTMLElement;

    // Simulate touch end event
    fireEvent.touchEnd(optionElement);

    expect(onValueChange).toHaveBeenCalledWith("option1");
  });

  it("should have correct display name", () => {
    expect(Select.displayName).toBe("Select");
  });

  it("should handle ref forwarding", () => {
    const ref = vi.fn();
    render(<Select options={mockOptions} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("should apply focus styles when focused", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    expect(selectTrigger).toHaveClass("ring-ring/50", "border-ring", "ring-[3px]");
  });

  it("should show chevron icon with correct rotation", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const chevron = document.querySelector(".lucide-chevron-down");
    expect(chevron).toBeInTheDocument();

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    expect(chevron).toHaveClass("rotate-180");
  });
});
