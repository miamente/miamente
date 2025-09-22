import React from "react";
import { render, screen } from "@testing-library/react";
import { AppointmentChart } from "../appointment-chart";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, name }: { dataKey: string; stroke: string; name: string }) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke} data-name={name} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ formatter, labelFormatter }: { formatter: unknown; labelFormatter: unknown }) => (
    <div data-testid="tooltip" data-formatter={formatter} data-label-formatter={labelFormatter} />
  ),
  Legend: ({ formatter }: { formatter: unknown }) => (
    <div data-testid="legend" data-formatter={formatter} />
  ),
}));

describe("AppointmentChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    render(<AppointmentChart data={[]} loading={true} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("animate-spin");
  });

  it("should render loading state with default prop", () => {
    render(<AppointmentChart data={[]} loading={true} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
  });

  it("should render empty state when no data", () => {
    render(<AppointmentChart data={[]} loading={false} />);

    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("should render chart with valid data", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 10,
        total: 15,
      },
      {
        date: "2024-01-02",
        confirmed: 8,
        total: 12,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
  });

  it("should render all chart components", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 10,
        total: 15,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    // Check that all chart components are rendered
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();

    // Check that both lines are rendered
    const lines = screen.getAllByTestId("line");
    expect(lines).toHaveLength(2);
  });

  it("should render chart with single data point", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 5,
        total: 8,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render chart with zero values", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 0,
        total: 0,
      },
      {
        date: "2024-01-02",
        confirmed: 0,
        total: 5,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render chart with large numbers", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 1000,
        total: 1500,
      },
      {
        date: "2024-01-02",
        confirmed: 800,
        total: 1200,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should format dates correctly in chart data", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 10,
        total: 15,
      },
      {
        date: "2024-02-15",
        confirmed: 8,
        total: 12,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    const chartElement = screen.getByTestId("line-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data") || "[]");

    expect(chartData).toHaveLength(2);

    // Check that dates are formatted (not the original ISO strings)
    expect(chartData[0].date).not.toBe("2024-01-01");
    expect(chartData[1].date).not.toBe("2024-02-15");

    // Check that the numeric values are preserved
    expect(chartData[0].confirmed).toBe(10);
    expect(chartData[0].total).toBe(15);
    expect(chartData[1].confirmed).toBe(8);
    expect(chartData[1].total).toBe(12);

    // Check that dates are strings (formatted)
    expect(typeof chartData[0].date).toBe("string");
    expect(typeof chartData[1].date).toBe("string");
  });

  it("should render both lines with correct properties", () => {
    const mockData = [
      {
        date: "2024-01-01",
        confirmed: 10,
        total: 15,
      },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    const lines = screen.getAllByTestId("line");

    // Check total line
    const totalLine = lines.find((line) => line.getAttribute("data-key") === "total");
    expect(totalLine).toBeInTheDocument();
    expect(totalLine).toHaveAttribute("data-stroke", "#8884d8");
    expect(totalLine).toHaveAttribute("data-name", "total");

    // Check confirmed line
    const confirmedLine = lines.find((line) => line.getAttribute("data-key") === "confirmed");
    expect(confirmedLine).toBeInTheDocument();
    expect(confirmedLine).toHaveAttribute("data-stroke", "#82ca9d");
    expect(confirmedLine).toHaveAttribute("data-name", "confirmed");
  });

  it("should handle multiple data points", () => {
    const mockData = [
      { date: "2024-01-01", confirmed: 10, total: 15 },
      { date: "2024-01-02", confirmed: 8, total: 12 },
      { date: "2024-01-03", confirmed: 12, total: 18 },
      { date: "2024-01-04", confirmed: 6, total: 9 },
      { date: "2024-01-05", confirmed: 15, total: 20 },
    ];

    render(<AppointmentChart data={mockData} loading={false} />);

    const chartElement = screen.getByTestId("line-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data") || "[]");

    expect(chartData).toHaveLength(5);
    expect(chartData[0].confirmed).toBe(10);
    expect(chartData[0].total).toBe(15);
    expect(chartData[4].confirmed).toBe(15);
    expect(chartData[4].total).toBe(20);
  });
});
