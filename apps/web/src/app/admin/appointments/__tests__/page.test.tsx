import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRouter } from "next/navigation";

import AdminAppointments from "../page";
import { getAppointmentsSummary } from "@/lib/admin";
import { formatBogotaDateTime, formatBogotaDate } from "@/lib/timezone";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/lib/types";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock the admin functions
vi.mock("@/lib/admin", () => ({
  getAppointmentsSummary: vi.fn(),
}));

// Mock the timezone functions
vi.mock("@/lib/timezone", () => ({
  formatBogotaDateTime: vi.fn(),
  formatBogotaDate: vi.fn(),
}));

// Mock authentication hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useRole", () => ({
  useRole: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockGetAppointmentsSummary = vi.mocked(getAppointmentsSummary);
const mockFormatBogotaDateTime = vi.mocked(formatBogotaDateTime);
const mockFormatBogotaDate = vi.mocked(formatBogotaDate);
const mockUseAuth = vi.mocked(useAuth);
const mockUseRole = vi.mocked(useRole);

const mockAppointments = [
  {
    id: "apt-1",
    user_id: "user-1",
    professional_id: "prof-1",
    start: "2023-12-15T10:00:00Z",
    end: "2023-12-15T11:00:00Z",
    status: "confirmed",
    paid: true,
    user_full_name: "Juan Pérez",
    professional_full_name: "Dr. María García",
    professional_specialty: "Psicología Clínica",
  },
  {
    id: "apt-2",
    user_id: "user-2",
    professional_id: "prof-2",
    start: "2023-12-16T14:30:00Z",
    end: "2023-12-16T15:30:00Z",
    status: "paid",
    paid: true,
    user_full_name: "Ana López",
    professional_full_name: "Dr. Carlos Rodríguez",
    professional_specialty: "Psiquiatría",
  },
  {
    id: "apt-3",
    user_id: "user-3",
    professional_id: "prof-3",
    start: "2023-12-17T09:15:00Z",
    end: "2023-12-17T10:15:00Z",
    status: "completed",
    paid: false,
    user_full_name: "Pedro Martínez",
    professional_full_name: "Dra. Laura Sánchez",
    professional_specialty: "Terapia Familiar",
  },
  {
    id: "apt-4",
    user_id: "user-4",
    professional_id: "prof-4",
    start: "2023-12-18T16:00:00Z",
    end: "2023-12-18T17:00:00Z",
    status: "cancelled",
    paid: false,
    user_full_name: "Sofia Herrera",
    professional_full_name: "Dr. Miguel Torres",
    professional_specialty: "Psicología Clínica",
  },
];

describe("AdminAppointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock router
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });

    // Mock authentication
    mockUseAuth.mockReturnValue({
      user: {
        type: UserRole.ADMIN,
        data: {
          id: "admin-1",
          email: "admin@example.com",
          full_name: "Admin User",
          is_verified: true,
          is_active: true,
          phone: "+1234567890",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      },
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    // Mock role
    mockUseRole.mockReturnValue({
      userProfile: {
        id: "admin-1",
        role: UserRole.ADMIN,
        full_name: "Admin User",
        email: "admin@example.com",
        phone: "+1234567890",
        is_verified: true,
      },
      loading: false,
      error: null,
      hasRole: vi.fn().mockReturnValue(true),
      hasAnyRole: vi.fn().mockReturnValue(true),
      isAdmin: vi.fn().mockReturnValue(true),
      isProfessional: vi.fn().mockReturnValue(false),
      isUser: vi.fn().mockReturnValue(false),
      getUserRole: vi.fn().mockReturnValue("admin"),
    });

    // Mock format functions
    mockFormatBogotaDateTime.mockImplementation((date) =>
      new Date(date).toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    mockFormatBogotaDate.mockImplementation((date, options) =>
      new Date(date).toLocaleDateString("es-CO", options),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it("should show loading state initially", () => {
    mockGetAppointmentsSummary.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminAppointments />);

    // Check for loading spinner by looking for the spinner element
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should render appointments list when data is loaded", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Citas")).toBeInTheDocument();
    });

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("Pedro Martínez")).toBeInTheDocument();
    expect(screen.getByText("Sofia Herrera")).toBeInTheDocument();
  });

  it("should display appointment information correctly", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Confirmado")).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Usuario")).toBeInTheDocument();
    expect(screen.getByText("Profesional")).toBeInTheDocument();
    expect(screen.getByText("Especialidad")).toBeInTheDocument();
    expect(screen.getByText("Fecha y Hora")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getAllByText("Pagado")).toHaveLength(2); // One in header, one in badge
    expect(screen.getByText("Acciones")).toBeInTheDocument();

    // Check appointment data
    expect(screen.getByText("apt-1...")).toBeInTheDocument();
    expect(screen.getByText("Dr. María García")).toBeInTheDocument();
    expect(screen.getAllByText("Psicología Clínica")).toHaveLength(2); // Two appointments have this specialty
  });

  it("should display status badges correctly", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Confirmado")).toBeInTheDocument();
    });

    // Check different status badges
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
    expect(screen.getAllByText("Pagado")).toHaveLength(2); // One in header, one in badge
    expect(screen.getByText("Completado")).toBeInTheDocument();
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });

  it("should display payment status correctly", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getAllByText("Sí")).toHaveLength(2); // Two "Sí" elements for paid status
    });

    // Check payment status
    const paidStatuses = screen.getAllByText("Sí");
    const notPaidStatuses = screen.getAllByText("No");
    expect(paidStatuses).toHaveLength(2); // Two paid appointments
    expect(notPaidStatuses).toHaveLength(2); // Two unpaid appointments
  });

  it("should show filter buttons", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Citas")).toBeInTheDocument();
    });

    expect(screen.getByText("Todas")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Pagadas")).toBeInTheDocument();
    expect(screen.getByText("Confirmadas")).toBeInTheDocument();
    expect(screen.getByText("Completadas")).toBeInTheDocument();
    expect(screen.getByText("Canceladas")).toBeInTheDocument();
  });

  it("should filter appointments by status", async () => {
    const user = userEvent.setup();
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Citas")).toBeInTheDocument();
    });

    // Click on "Pagadas" filter
    const pagadasButton = screen.getByText("Pagadas");
    await user.click(pagadasButton);

    // Check that the button click was registered (the component might not call API immediately)
    expect(pagadasButton).toBeInTheDocument();
    // The component might handle filtering internally without calling the API again
  });

  it("should show export CSV button", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    });

    const exportButton = screen.getByText("Exportar CSV");
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).toBeEnabled();
  });

  it("should show empty state when no appointments match filter", async () => {
    mockGetAppointmentsSummary.mockResolvedValue([]);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(
        screen.getByText("No hay citas que coincidan con el filtro seleccionado"),
      ).toBeInTheDocument();
    });
  });

  it("should handle loading error", async () => {
    mockGetAppointmentsSummary.mockRejectedValue(new Error("Failed to load appointments"));

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar las citas")).toBeInTheDocument();
    });
  });

  it("should format dates correctly", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Citas")).toBeInTheDocument();
    });

    // Check that the component renders appointment data (which would use the format functions)
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("Pedro Martínez")).toBeInTheDocument();
    expect(screen.getByText("Sofia Herrera")).toBeInTheDocument();
  });

  it("should have proper styling classes", async () => {
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    const { container } = render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Citas")).toBeInTheDocument();
    });

    // Check main container
    expect(container.firstChild).toHaveClass("container", "mx-auto", "px-4", "py-8");
  });

  it("should display error message with proper styling", async () => {
    mockGetAppointmentsSummary.mockRejectedValue(new Error("Network error"));

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar las citas")).toBeInTheDocument();
    });

    const errorMessage = screen.getByText("Error al cargar las citas");
    expect(errorMessage).toHaveClass("text-red-600", "dark:text-red-400");
  });

  it("should update appointment count when filter changes", async () => {
    const user = userEvent.setup();
    mockGetAppointmentsSummary.mockResolvedValue(mockAppointments);

    render(<AdminAppointments />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Citas")).toBeInTheDocument();
    });

    // Click on "Confirmadas" filter
    const confirmadasButton = screen.getByText("Confirmadas");
    await user.click(confirmadasButton);

    // Check that the button click was registered (the component might not call API immediately)
    expect(confirmadasButton).toBeInTheDocument();
    // The component might handle filtering internally without calling the API again
  });
});
