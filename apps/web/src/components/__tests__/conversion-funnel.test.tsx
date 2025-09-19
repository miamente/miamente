import React from "react";
import { render, screen } from "@testing-library/react";
import { ConversionFunnel } from "../conversion-funnel";
import { vi } from "vitest";

// Mock recharts components
vi.mock("recharts", () => ({
  BarChart: vi.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: vi.fn(() => <div data-testid="bar" />),
  XAxis: vi.fn(() => <div data-testid="x-axis" />),
  YAxis: vi.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: vi.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: vi.fn(() => <div data-testid="tooltip" />),
  Legend: vi.fn(() => <div data-testid="legend" />),
  ResponsiveContainer: vi.fn(({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  )),
}));

describe("ConversionFunnel", () => {
  const mockData = {
    signups: 100,
    profileCompletions: 80,
    slotCreations: 60,
    appointmentConfirmations: 40,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    render(<ConversionFunnel data={null} loading={true} />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-blue-600",
    );
  });

  it("should render loading state when data is null", () => {
    render(<ConversionFunnel data={null} loading={false} />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-blue-600",
    );
  });

  it("should render chart with data", () => {
    render(<ConversionFunnel data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("should render with default loading state", () => {
    render(<ConversionFunnel data={null} />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-blue-600",
    );
  });

  it("should handle high conversion rates", () => {
    const highConversionData = {
      signups: 100,
      profileCompletions: 95,
      slotCreations: 90,
      appointmentConfirmations: 85,
    };

    render(<ConversionFunnel data={highConversionData} loading={false} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should have proper CSS classes", () => {
    render(<ConversionFunnel data={mockData} loading={false} />);

    const chartContainer = screen.getByTestId("responsive-container").parentElement;
    expect(chartContainer).toHaveClass("h-64", "w-full");
  });

  it("should handle loading state with data", () => {
    render(<ConversionFunnel data={mockData} loading={true} />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-blue-600",
    );
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });

  it("should handle zero signups", () => {
    const zeroData = {
      signups: 0,
      profileCompletions: 0,
      slotCreations: 0,
      appointmentConfirmations: 0,
    };

    render(<ConversionFunnel data={zeroData} loading={false} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should handle partial data", () => {
    const partialData = {
      signups: 50,
      profileCompletions: 30,
      slotCreations: 0,
      appointmentConfirmations: 0,
    };

    render(<ConversionFunnel data={partialData} loading={false} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });
});
