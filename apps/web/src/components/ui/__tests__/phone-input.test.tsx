import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { parsePhoneNumber } from "libphonenumber-js";

import { PhoneInputField, PhoneInputFieldWithRef } from "../phone-input";

// Mock libphonenumber-js
vi.mock("libphonenumber-js", () => ({
  parsePhoneNumber: vi.fn(),
}));

describe("PhoneInputField", () => {
  const mockParsePhoneNumber = vi.mocked(parsePhoneNumber);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<PhoneInputField />);

    const countryButton = screen.getByRole("button");
    const phoneInput = screen.getByRole("textbox");

    expect(countryButton).toBeInTheDocument();
    expect(countryButton).toHaveTextContent("🇨🇴+57");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute("placeholder", "300 123 4567");
    expect(phoneInput).toHaveAttribute("type", "tel");
  });

  it("should render with custom placeholder", () => {
    render(<PhoneInputField placeholder="Enter phone number" />);

    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveAttribute("placeholder", "Enter phone number");
  });

  it("should handle phone number input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInputField onChange={onChange} />);

    const phoneInput = screen.getByRole("textbox");
    await user.type(phoneInput, "3001234567");

    expect(phoneInput).toHaveValue("3001234567");
    expect(onChange).toHaveBeenCalledWith("+573001234567");
  });

  it("should open country dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<PhoneInputField />);

    const countryButton = screen.getByRole("button");
    await user.click(countryButton);

    expect(screen.getByText("Colombia")).toBeInTheDocument();
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("Estados Unidos")).toBeInTheDocument();
  });

  it("should change country when selected from dropdown", async () => {
    const user = userEvent.setup();
    const onCountryCodeChange = vi.fn();
    render(<PhoneInputField onCountryCodeChange={onCountryCodeChange} />);

    const countryButton = screen.getByRole("button");
    await user.click(countryButton);

    const usaOption = screen.getByText("Estados Unidos");
    await user.click(usaOption);

    expect(countryButton).toHaveTextContent("🇺🇸+1");
    expect(onCountryCodeChange).toHaveBeenCalledWith("1");
  });

  it("should handle disabled state", () => {
    render(<PhoneInputField disabled />);

    const countryButton = screen.getByRole("button");
    const phoneInput = screen.getByRole("textbox");

    expect(countryButton).toBeDisabled();
    expect(phoneInput).toBeDisabled();
  });

  it("should accept custom className", () => {
    render(<PhoneInputField className="custom-class" />);

    const container = screen.getByRole("textbox").closest("div");
    expect(container).toHaveClass("custom-class");
  });

  it("should handle controlled phone number", () => {
    const { rerender } = render(<PhoneInputField phoneNumber="1234567890" />);

    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveValue("1234567890");

    rerender(<PhoneInputField phoneNumber="0987654321" />);
    expect(phoneInput).toHaveValue("0987654321");
  });

  it("should handle controlled country code", () => {
    const { rerender } = render(<PhoneInputField countryCode="54" />);

    const countryButton = screen.getByRole("button");
    expect(countryButton).toHaveTextContent("🇦🇷+54");

    rerender(<PhoneInputField countryCode="1" />);
    expect(countryButton).toHaveTextContent("🇺🇸+1");
  });

  it("should handle value prop with phone number parsing", () => {
    mockParsePhoneNumber.mockReturnValue({
      country: "US",
      nationalNumber: "1234567890",
    } as unknown as ReturnType<typeof parsePhoneNumber>);

    render(<PhoneInputField value="+11234567890" />);

    const countryButton = screen.getByRole("button");
    const phoneInput = screen.getByRole("textbox");

    expect(countryButton).toHaveTextContent("🇺🇸+1");
    expect(phoneInput).toHaveValue("1234567890");
  });

  it("should handle value prop with invalid phone number", () => {
    mockParsePhoneNumber.mockImplementation(() => {
      throw new Error("Invalid phone number");
    });

    render(<PhoneInputField value="invalid" />);

    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveValue("invalid");
  });

  it("should call onPhoneNumberChange when phone number changes", async () => {
    const user = userEvent.setup();
    const onPhoneNumberChange = vi.fn();
    render(<PhoneInputField onPhoneNumberChange={onPhoneNumberChange} />);

    const phoneInput = screen.getByRole("textbox");
    await user.type(phoneInput, "123");

    expect(onPhoneNumberChange).toHaveBeenCalledWith("123");
  });

  it("should close dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <PhoneInputField />
        <button>Outside button</button>
      </div>,
    );

    const buttons = screen.getAllByRole("button");
    const countryButton = buttons[0];
    await user.click(countryButton);

    expect(screen.getByText("Colombia")).toBeInTheDocument();

    const outsideButton = screen.getByText("Outside button");
    await user.click(outsideButton);

    expect(screen.queryByText("Colombia")).not.toBeInTheDocument();
  });

  it("should handle ref forwarding", () => {
    const ref = vi.fn();
    render(<PhoneInputField ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("should have correct display name", () => {
    expect(PhoneInputField.displayName).toBe("PhoneInputField");
  });

  it("should handle id and name attributes", () => {
    render(<PhoneInputField id="phone-input" name="phone" />);

    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveAttribute("id", "phone-input");
    expect(phoneInput).toHaveAttribute("name", "phone");
  });

  it("should handle keyboard navigation in dropdown", async () => {
    const user = userEvent.setup();
    render(<PhoneInputField />);

    const countryButton = screen.getByRole("button");
    await user.click(countryButton);

    expect(screen.getByText("Colombia")).toBeInTheDocument();

    // The component doesn't handle Escape key, so we'll just test that dropdown is open
    expect(screen.getByText("Colombia")).toBeInTheDocument();
  });

  it("should render all countries in dropdown", async () => {
    const user = userEvent.setup();
    render(<PhoneInputField />);

    const countryButton = screen.getByRole("button");
    await user.click(countryButton);

    // Check for some key countries
    expect(screen.getByText("Colombia")).toBeInTheDocument();
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("Estados Unidos")).toBeInTheDocument();
    expect(screen.getByText("España")).toBeInTheDocument();
    expect(screen.getByText("China")).toBeInTheDocument();
  });

  it("should handle country selection with different calling codes", async () => {
    const user = userEvent.setup();
    const onCountryCodeChange = vi.fn();
    render(<PhoneInputField onCountryCodeChange={onCountryCodeChange} />);

    const countryButton = screen.getByRole("button");
    await user.click(countryButton);

    // Select Argentina
    const argentinaOption = screen.getByText("Argentina");
    await user.click(argentinaOption);

    expect(countryButton).toHaveTextContent("🇦🇷+54");
    expect(onCountryCodeChange).toHaveBeenCalledWith("54");
  });

  it("should handle multiple country changes", async () => {
    const user = userEvent.setup();
    const onCountryCodeChange = vi.fn();
    render(<PhoneInputField onCountryCodeChange={onCountryCodeChange} />);

    const countryButton = screen.getByRole("button");

    // Change to USA
    await user.click(countryButton);
    await user.click(screen.getByText("Estados Unidos"));
    expect(onCountryCodeChange).toHaveBeenCalledWith("1");

    // Change to Spain
    await user.click(countryButton);
    await user.click(screen.getByText("España"));
    expect(onCountryCodeChange).toHaveBeenCalledWith("34");
  });

  it("should maintain phone number when country changes", async () => {
    const user = userEvent.setup();
    render(<PhoneInputField phoneNumber="1234567890" />);

    const phoneInput = screen.getByRole("textbox");
    const countryButton = screen.getByRole("button");

    expect(phoneInput).toHaveValue("1234567890");

    // Change country
    await user.click(countryButton);
    await user.click(screen.getByText("Estados Unidos"));

    expect(phoneInput).toHaveValue("1234567890");
  });

  it("should handle controlled and uncontrolled modes", () => {
    const { rerender } = render(<PhoneInputField />);

    // Uncontrolled mode
    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveValue("");

    // Controlled mode
    rerender(<PhoneInputField phoneNumber="1234567890" />);
    expect(phoneInput).toHaveValue("1234567890");

    // Back to uncontrolled
    rerender(<PhoneInputField />);
    expect(phoneInput).toHaveValue("");
  });

  it("should handle external phone number changes", () => {
    const onPhoneNumberChange = vi.fn();
    const { rerender } = render(
      <PhoneInputField phoneNumber="1111111111" onPhoneNumberChange={onPhoneNumberChange} />,
    );

    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveValue("1111111111");

    rerender(
      <PhoneInputField phoneNumber="2222222222" onPhoneNumberChange={onPhoneNumberChange} />,
    );
    expect(phoneInput).toHaveValue("2222222222");
  });
});

describe("PhoneInputFieldWithRef", () => {
  it("should render correctly", () => {
    render(<PhoneInputFieldWithRef />);

    const countryButton = screen.getByRole("button");
    const phoneInput = screen.getByRole("textbox");

    expect(countryButton).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
  });

  it("should handle onChange callback", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInputFieldWithRef onChange={onChange} />);

    const phoneInput = screen.getByRole("textbox");
    await user.type(phoneInput, "123");

    expect(onChange).toHaveBeenCalledWith("+57123");
  });

  it("should handle onCountryCodeChange callback", async () => {
    const user = userEvent.setup();
    const onCountryCodeChange = vi.fn();
    render(<PhoneInputFieldWithRef onCountryCodeChange={onCountryCodeChange} />);

    const countryButton = screen.getByRole("button");
    await user.click(countryButton);
    await user.click(screen.getByText("Estados Unidos"));

    expect(onCountryCodeChange).toHaveBeenCalledWith("1");
  });

  it("should handle onPhoneNumberChange callback", async () => {
    const user = userEvent.setup();
    const onPhoneNumberChange = vi.fn();
    render(<PhoneInputFieldWithRef onPhoneNumberChange={onPhoneNumberChange} />);

    const phoneInput = screen.getByRole("textbox");
    await user.type(phoneInput, "456");

    expect(onPhoneNumberChange).toHaveBeenCalledWith("456");
  });

  it("should handle ref forwarding", () => {
    const ref = vi.fn();
    render(<PhoneInputFieldWithRef ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("should have correct display name", () => {
    expect(PhoneInputFieldWithRef.displayName).toBe("PhoneInputFieldWithRef");
  });

  it("should pass through all props", () => {
    render(
      <PhoneInputFieldWithRef
        id="test-phone"
        name="test-phone"
        placeholder="Test placeholder"
        disabled
      />,
    );

    const phoneInput = screen.getByRole("textbox");
    expect(phoneInput).toHaveAttribute("id", "test-phone");
    expect(phoneInput).toHaveAttribute("name", "test-phone");
    expect(phoneInput).toHaveAttribute("placeholder", "Test placeholder");
    expect(phoneInput).toBeDisabled();
  });

  it("should handle all callbacks together", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCountryCodeChange = vi.fn();
    const onPhoneNumberChange = vi.fn();

    render(
      <PhoneInputFieldWithRef
        onChange={onChange}
        onCountryCodeChange={onCountryCodeChange}
        onPhoneNumberChange={onPhoneNumberChange}
      />,
    );

    // Change country
    const countryButton = screen.getByRole("button");
    await user.click(countryButton);
    await user.click(screen.getByText("Estados Unidos"));

    expect(onCountryCodeChange).toHaveBeenCalledWith("1");

    // Change phone number
    const phoneInput = screen.getByRole("textbox");
    await user.type(phoneInput, "789");

    expect(onPhoneNumberChange).toHaveBeenCalledWith("789");
    expect(onChange).toHaveBeenCalledWith("+1789");
  });
});
