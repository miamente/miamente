import React from "react";
import { render, screen } from "@testing-library/react";
import { ConversionFunnel } from "../conversion-funnel";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, name }: { dataKey: string; fill: string; name: string }) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} data-name={name} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ formatter, labelFormatter }: { formatter: unknown; labelFormatter: unknown }) => (
    <div data-testid="tooltip" data-formatter={formatter} data-label-formatter={labelFormatter} />
  ),
  Legend: () => <div data-testid="legend" />,
}));

describe("ConversionFunnel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    render(<ConversionFunnel data={null} loading={true} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("animate-spin");
  });

  it("should render loading state when data is null", () => {
    render(<ConversionFunnel data={null} loading={false} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
  });

  it("should render chart with valid data", () => {
    const mockData = {
      signups: 100,
      profileCompletions: 80,
      slotCreations: 60,
      appointmentConfirmations: 40,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("should render chart with zero data", () => {
    const mockData = {
      signups: 0,
      profileCompletions: 0,
      slotCreations: 0,
      appointmentConfirmations: 0,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should handle data with some zero values", () => {
    const mockData = {
      signups: 100,
      profileCompletions: 0,
      slotCreations: 50,
      appointmentConfirmations: 0,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should render with default loading prop", () => {
    render(<ConversionFunnel data={null} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
  });

  it("should render chart with large numbers", () => {
    const mockData = {
      signups: 10000,
      profileCompletions: 8000,
      slotCreations: 6000,
      appointmentConfirmations: 4000,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should render all chart components", () => {
    const mockData = {
      signups: 100,
      profileCompletions: 80,
      slotCreations: 60,
      appointmentConfirmations: 40,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    // Check that all chart components are rendered
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("should have correct chart data structure", () => {
    const mockData = {
      signups: 100,
      profileCompletions: 80,
      slotCreations: 60,
      appointmentConfirmations: 40,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    const chartElement = screen.getByTestId("bar-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data") || "[]");

    expect(chartData).toHaveLength(4);
    expect(chartData[0]).toEqual({
      step: "Registros",
      count: 100,
      percentage: 100,
    });
    expect(chartData[1]).toEqual({
      step: "Perfil Completo",
      count: 80,
      percentage: 80,
    });
    expect(chartData[2]).toEqual({
      step: "Slots Creados",
      count: 60,
      percentage: 60,
    });
    expect(chartData[3]).toEqual({
      step: "Citas Confirmadas",
      count: 40,
      percentage: 40,
    });
  });

  it("should calculate percentages correctly when signups is zero", () => {
    const mockData = {
      signups: 0,
      profileCompletions: 0,
      slotCreations: 0,
      appointmentConfirmations: 0,
    };

    render(<ConversionFunnel data={mockData} loading={false} />);

    const chartElement = screen.getByTestId("bar-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data") || "[]");

    expect(chartData[0].percentage).toBe(100); // Registros always 100%
    expect(chartData[1].percentage).toBe(0); // Should be 0 when signups is 0
    expect(chartData[2].percentage).toBe(0); // Should be 0 when signups is 0
    expect(chartData[3].percentage).toBe(0); // Should be 0 when signups is 0
  });
});
