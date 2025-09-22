import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminDashboard from "../page";
import { getAdminMetrics } from "@/lib/admin";
import { getAppointmentChartData, getConversionFunnelData } from "@/lib/analytics-admin";

// Mock the admin and analytics functions
vi.mock("@/lib/admin", () => ({
  getAdminMetrics: vi.fn(),
}));

vi.mock("@/lib/analytics-admin", () => ({
  getAppointmentChartData: vi.fn(),
  getConversionFunnelData: vi.fn(),
}));

// Mock the components
vi.mock("@/components/appointment-chart", () => ({
  AppointmentChart: ({ data, loading }: { data: unknown[]; loading: boolean }) => (
    <div data-testid="appointment-chart">
      {loading ? "Loading chart..." : `Chart with ${data.length} data points`}
    </div>
  ),
}));

vi.mock("@/components/conversion-funnel", () => ({
  ConversionFunnel: ({ data, loading }: { data: unknown; loading: boolean }) => (
    <div data-testid="conversion-funnel">
      {loading ? "Loading funnel..." : `Funnel with ${data ? Object.keys(data).length : 0} metrics`}
    </div>
  ),
}));

vi.mock("@/components/role-gate", () => ({
  AdminGate: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => (
    <div data-testid="admin-gate">
      {children}
      {fallback}
    </div>
  ),
}));

const mockGetAdminMetrics = vi.mocked(getAdminMetrics);
const mockGetAppointmentChartData = vi.mocked(getAppointmentChartData);
const mockGetConversionFunnelData = vi.mocked(getConversionFunnelData);

describe("AdminDashboard", () => {
  const mockMetrics = {
    total_users: 150,
    new_users_7_days: 12,
    new_users_30_days: 45,
    verified_professionals: 25,
    total_professionals: 30,
    confirmed_appointments_today: 8,
    total_appointments_today: 12,
  };

  const mockChartData = [
    { date: "2024-01-01", confirmed: 5, cancelled: 1, total: 6 },
    { date: "2024-01-02", confirmed: 7, cancelled: 2, total: 9 },
  ];

  const mockFunnelData = {
    signups: 100,
    profileCompletions: 80,
    slotCreations: 60,
    appointmentConfirmations: 40,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockGetAdminMetrics.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockGetAppointmentChartData.mockImplementation(() => new Promise(() => {}));
    mockGetConversionFunnelData.mockImplementation(() => new Promise(() => {}));

    render(<AdminDashboard />);

    // The loading spinner doesn't have role="status", so we just check for the spinner element by its classes
    const spinner = document.querySelector(
      ".h-8.w-8.animate-spin.rounded-full.border-b-2.border-blue-600",
    );
    expect(spinner).toBeInTheDocument();
  });

  it("should show error state when data loading fails", async () => {
    mockGetAdminMetrics.mockRejectedValue(new Error("API Error"));
    mockGetAppointmentChartData.mockRejectedValue(new Error("API Error"));
    mockGetConversionFunnelData.mockRejectedValue(new Error("API Error"));

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar los datos")).toBeInTheDocument();
    });
  });

  it("should render admin dashboard with metrics when data loads successfully", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
    });

    expect(screen.getByText("Resumen general de la plataforma")).toBeInTheDocument();
  });

  it("should display all metric cards with correct data", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Usuarios Registrados")).toBeInTheDocument();
    });

    // Check metric cards
    expect(screen.getByText("150")).toBeInTheDocument(); // total_users
    expect(screen.getByText("Total de usuarios")).toBeInTheDocument();

    expect(screen.getByText("Nuevos Usuarios (7 días)")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument(); // new_users_7_days
    expect(screen.getByText("Últimos 7 días")).toBeInTheDocument();

    expect(screen.getByText("Nuevos Usuarios (30 días)")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument(); // new_users_30_days
    expect(screen.getByText("Últimos 30 días")).toBeInTheDocument();

    expect(screen.getByText("Profesionales Verificados")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument(); // verified_professionals
    expect(screen.getByText("de 30 total")).toBeInTheDocument();

    expect(screen.getByText("Citas Confirmadas Hoy")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument(); // confirmed_appointments_today
    expect(screen.getByText("de 12 total")).toBeInTheDocument();

    expect(screen.getByText("Conversión de Pagos")).toBeInTheDocument();
    expect(screen.getByText("Tasa de conversión")).toBeInTheDocument();
  });

  it("should display management action cards", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Gestionar Profesionales")).toBeInTheDocument();
    });

    expect(screen.getByText("Verificar y administrar")).toBeInTheDocument();
    expect(screen.getByText("Gestionar Citas")).toBeInTheDocument();
    expect(screen.getByText("Ver y administrar citas")).toBeInTheDocument();
    expect(screen.getByText("Registro de Eventos")).toBeInTheDocument();
    expect(screen.getByText("Ver logs del sistema")).toBeInTheDocument();
    expect(screen.getByText("Feature Flags")).toBeInTheDocument();
    expect(screen.getByText("Gestionar funcionalidades")).toBeInTheDocument();
  });

  it("should display analytics charts section", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Citas Confirmadas (Últimos 30 días)")).toBeInTheDocument();
    });

    expect(screen.getByText("Embudo de Conversión")).toBeInTheDocument();
    expect(screen.getByTestId("appointment-chart")).toBeInTheDocument();
    expect(screen.getByTestId("conversion-funnel")).toBeInTheDocument();
  });

  it("should render appointment chart with correct data", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("appointment-chart")).toBeInTheDocument();
    });

    expect(screen.getByText("Chart with 2 data points")).toBeInTheDocument();
  });

  it("should render conversion funnel with correct data", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("conversion-funnel")).toBeInTheDocument();
    });

    expect(screen.getByText("Funnel with 4 metrics")).toBeInTheDocument();
  });

  it("should call all data loading functions on mount", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetAdminMetrics).toHaveBeenCalledTimes(1);
      expect(mockGetAppointmentChartData).toHaveBeenCalledTimes(1);
      expect(mockGetConversionFunnelData).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle partial data loading", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockRejectedValue(new Error("Chart error"));
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar los datos")).toBeInTheDocument();
    });
  });

  it("should display admin gate component", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("admin-gate")).toBeInTheDocument();
    });
  });

  it("should have proper styling classes", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    const { container } = render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
    });

    // Check main container
    const mainContainer = container.querySelector(".container.mx-auto.px-4.py-8");
    expect(mainContainer).toBeInTheDocument();

    // Check metrics grid
    const metricsGrid = container.querySelector(
      ".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-4",
    );
    expect(metricsGrid).toBeInTheDocument();

    // Check action cards grid
    const actionGrid = container.querySelector(
      ".grid.grid-cols-1.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4",
    );
    expect(actionGrid).toBeInTheDocument();

    // Check analytics charts grid
    const chartsGrid = container.querySelector(".mt-8.grid.grid-cols-1.gap-6.lg\\:grid-cols-2");
    expect(chartsGrid).toBeInTheDocument();
  });

  it("should display access denied fallback when admin gate blocks access", async () => {
    mockGetAdminMetrics.mockResolvedValue(mockMetrics);
    mockGetAppointmentChartData.mockResolvedValue(mockChartData);
    mockGetConversionFunnelData.mockResolvedValue(mockFunnelData);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Acceso Denegado")).toBeInTheDocument();
    });

    expect(screen.getByText("No tienes permisos para acceder a esta página.")).toBeInTheDocument();
  });
});
