import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ThemeProvider } from "../theme-provider";

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when mounted", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-content">Test Content</div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("should render children when component is rendered", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-content">Test Content</div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("should render NextThemesProvider with correct props", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-content">Test Content</div>
      </ThemeProvider>,
    );

    const provider = screen.getByTestId("next-themes-provider");
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveAttribute("data-props");

    const props = JSON.parse(provider.getAttribute("data-props") || "{}");
    expect(props).toEqual({
      attribute: "class",
      defaultTheme: "light",
      enableSystem: false,
      disableTransitionOnChange: true,
    });
  });

  it("should handle multiple children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("should handle empty children", () => {
    const { container } = render(<ThemeProvider>{null}</ThemeProvider>);

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("should handle undefined children", () => {
    const { container } = render(<ThemeProvider>{undefined}</ThemeProvider>);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
