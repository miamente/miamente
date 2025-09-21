import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("should render with default props", () => {
    render(<Textarea />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass("min-h-[80px]");
    expect(textarea).toHaveClass("w-full");
    expect(textarea).toHaveClass("rounded-md");
    expect(textarea).toHaveClass("border");
    expect(textarea).toHaveClass("px-3");
    expect(textarea).toHaveClass("py-2");
    expect(textarea).toHaveClass("text-sm");
  });

  it("should accept custom className", () => {
    render(<Textarea className="custom-class" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("custom-class");
    expect(textarea).toHaveClass("min-h-[80px]"); // Should also have default classes
  });

  it("should handle value and onChange", () => {
    const handleChange = vi.fn();
    render(<Textarea value="test value" onChange={handleChange} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("test value");

    fireEvent.change(textarea, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("should handle placeholder", () => {
    render(<Textarea placeholder="Enter your message..." />);

    const textarea = screen.getByPlaceholderText("Enter your message...");
    expect(textarea).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Textarea disabled />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass("disabled:cursor-not-allowed");
    expect(textarea).toHaveClass("disabled:opacity-50");
  });

  it("should handle name and id attributes", () => {
    render(<Textarea name="message" id="message-input" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("name", "message");
    expect(textarea).toHaveAttribute("id", "message-input");
  });

  it("should handle rows and cols attributes", () => {
    render(<Textarea rows={5} cols={40} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("cols", "40");
  });

  it("should handle required attribute", () => {
    render(<Textarea required />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeRequired();
  });

  it("should handle maxLength attribute", () => {
    render(<Textarea maxLength={100} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("maxLength", "100");
  });

  it("should handle readOnly attribute", () => {
    render(<Textarea readOnly value="readonly text" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("readOnly");
    expect(textarea).toHaveValue("readonly text");
  });

  it("should forward ref correctly", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should apply focus styles correctly", () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("focus-visible:ring-2");
    expect(textarea).toHaveClass("focus-visible:ring-offset-2");
    expect(textarea).toHaveClass("focus-visible:outline-none");
  });

  it("should handle defaultValue", () => {
    render(<Textarea defaultValue="default text" />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("default text");
  });
});
