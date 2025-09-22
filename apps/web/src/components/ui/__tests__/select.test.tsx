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

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue("");
    expect(screen.getByText("Seleccionar...")).toBeInTheDocument();
  });

  it("should render with custom placeholder", () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);

    expect(screen.getByText("Choose an option")).toBeInTheDocument();
  });

  it("should display selected option", () => {
    render(<Select options={mockOptions} value="option2" />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveValue("option2");
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("should call onValueChange when option is selected", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);

    const selectElement = screen.getByRole("combobox");
    await user.selectOptions(selectElement, "option2");

    expect(onValueChange).toHaveBeenCalledWith("option2");
  });

  it("should handle disabled state", () => {
    render(<Select options={mockOptions} disabled />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeDisabled();
  });

  it("should accept custom className", () => {
    render(<Select options={mockOptions} className="custom-class" />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveClass("custom-class");
  });

  it("should handle aria attributes", () => {
    render(
      <Select
        options={mockOptions}
        aria-label="Custom label"
        aria-describedby="custom-description"
      />,
    );

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveAttribute("aria-label", "Custom label");
    expect(selectElement).toHaveAttribute("aria-describedby", "custom-description");
  });

  it("should render all options", () => {
    render(<Select options={mockOptions} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should handle empty options array", () => {
    render(<Select options={[]} />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(screen.getByText("Seleccionar...")).toBeInTheDocument();
  });

  it("should update selected option when value prop changes", () => {
    const { rerender } = render(<Select options={mockOptions} value="option1" />);

    let selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveValue("option1");

    rerender(<Select options={mockOptions} value="option2" />);

    selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveValue("option2");
  });

  it("should handle option with same value as placeholder", () => {
    const optionsWithPlaceholderValue: SelectOption[] = [
      { value: "Seleccionar...", label: "Seleccionar..." },
      { value: "option1", label: "Option 1" },
    ];

    render(<Select options={optionsWithPlaceholderValue} placeholder="Seleccionar..." />);

    // Should have both the disabled placeholder option and the regular option
    const placeholderOptions = screen.getAllByText("Seleccionar...");
    expect(placeholderOptions).toHaveLength(2);
  });

  it("should have correct accessibility attributes", () => {
    render(<Select options={mockOptions} />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement.tagName).toBe("SELECT");
  });

  it("should handle ref forwarding", () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<Select options={mockOptions} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("should handle focus styles when focused", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectElement = screen.getByRole("combobox");
    await user.click(selectElement);

    // Native select elements don't have custom focus classes, they use browser defaults
    expect(selectElement).toHaveFocus();
  });

  it("should show chevron icon", () => {
    const { container } = render(<Select options={mockOptions} />);

    // The chevron icon is hidden from screen readers but should be present in DOM
    const chevron = container.querySelector("svg.lucide-chevron-down");
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveClass("lucide-chevron-down");
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    const selectElement = screen.getByRole("combobox");
    await user.tab();
    expect(selectElement).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    // Native select handles keyboard navigation automatically
    expect(selectElement).toHaveFocus();
  });

  it("should handle change event", () => {
    const onValueChange = vi.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "option2" } });

    expect(onValueChange).toHaveBeenCalledWith("option2");
  });

  it("should handle multiple selections when multiple prop is true", () => {
    render(<Select options={mockOptions} multiple />);

    const selectElement = screen.getByRole("listbox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveAttribute("multiple");
  });

  it("should handle size attribute", () => {
    render(<Select options={mockOptions} size={3} />);

    const selectElement = screen.getByRole("listbox");
    expect(selectElement).toHaveAttribute("size", "3");
  });
});
