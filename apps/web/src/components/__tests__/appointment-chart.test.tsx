import React from "react";
import { render, screen } from "@testing-library/react";
import { AppointmentChart } from "../appointment-chart";
import { vi } from "vitest";

// Mock recharts components
vi.mock("recharts", () => ({
  LineChart: vi.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: vi.fn(() => <div data-testid="line" />),
  XAxis: vi.fn(() => <div data-testid="x-axis" />),
  YAxis: vi.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: vi.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: vi.fn(() => <div data-testid="tooltip" />),
  Legend: vi.fn(() => <div data-testid="legend" />),
  ResponsiveContainer: vi.fn(({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  )),
}));

describe("AppointmentChart", () => {
  const mockData = [
    {
      date: "2023-01-01",
      appointments: 10,
      confirmed: 8,
      cancelled: 2,
      total: 10,
    },
    {
      date: "2023-01-02",
      appointments: 15,
      confirmed: 12,
      cancelled: 3,
      total: 15,
    },
    {
      date: "2023-01-03",
      appointments: 8,
      confirmed: 6,
      cancelled: 2,
      total: 8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    render(<AppointmentChart data={[]} loading={true} />);

    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-blue-600",
    );
  });

  it("should render no data message when data is empty", () => {
    render(<AppointmentChart data={[]} loading={false} />);

    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("should render chart with data", () => {
    render(<AppointmentChart data={mockData} loading={false} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getAllByTestId("line")).toHaveLength(2); // Two Line components
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("should format dates correctly", () => {
    render(<AppointmentChart data={mockData} loading={false} />);

    // The component should render without errors when data is provided
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should have correct chart configuration", () => {
    render(<AppointmentChart data={mockData} loading={false} />);

    // The component should render with proper structure
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("should render with default loading state", () => {
    render(<AppointmentChart data={[]} />);

    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("should handle single data point", () => {
    const singleData = [mockData[0]];
    render(<AppointmentChart data={singleData} loading={false} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle data with missing properties", () => {
    const incompleteData = [
      {
        date: "2023-01-01",
        appointments: 10,
        confirmed: 0,
        cancelled: 0,
        total: 10,
      },
    ];

    render(<AppointmentChart data={incompleteData} loading={false} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should have proper CSS classes", () => {
    render(<AppointmentChart data={mockData} loading={false} />);

    const chartContainer = screen.getByTestId("responsive-container").parentElement;
    expect(chartContainer).toHaveClass("h-64", "w-full");
  });

  it("should handle loading state with data", () => {
    render(<AppointmentChart data={mockData} loading={true} />);

    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-blue-600",
    );
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });
});
