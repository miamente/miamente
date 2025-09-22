import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminProfessionals from "../page";
import { getProfessionalsSummary, updateProfessionalVerification } from "@/lib/admin";
import { formatBogotaDate } from "@/lib/timezone";

// Mock the admin functions
vi.mock("@/lib/admin", () => ({
  getProfessionalsSummary: vi.fn(),
  updateProfessionalVerification: vi.fn(),
}));

// Mock the timezone function
vi.mock("@/lib/timezone", () => ({
  formatBogotaDate: vi.fn(),
}));

// Mock the AdminGate component
vi.mock("@/components/role-gate", () => ({
  AdminGate: ({ children }: { children: React.ReactNode; fallback: React.ReactNode }) => {
    // For testing, we'll assume admin access is granted
    return <div data-testid="admin-gate">{children}</div>;
  },
}));

const mockGetProfessionalsSummary = vi.mocked(getProfessionalsSummary);
const mockUpdateProfessionalVerification = vi.mocked(updateProfessionalVerification);
const mockFormatBogotaDate = vi.mocked(formatBogotaDate);

const mockProfessionals = [
  {
    id: "prof-1",
    fullName: "Dr. Juan Pérez",
    email: "juan.perez@example.com",
    specialty: "Psicología Clínica",
    isVerified: true,
    createdAt: "2023-01-15T10:00:00Z",
    appointmentCount: 25,
    averageRating: 4.8,
  },
  {
    id: "prof-2",
    fullName: "Dra. María García",
    email: "maria.garcia@example.com",
    specialty: "Psiquiatría",
    isVerified: false,
    createdAt: "2023-02-20T14:30:00Z",
    appointmentCount: 0,
    averageRating: 0,
  },
  {
    id: "prof-3",
    fullName: "Dr. Carlos López",
    email: "carlos.lopez@example.com",
    specialty: "Terapia Familiar",
    isVerified: true,
    createdAt: "2023-03-10T09:15:00Z",
    appointmentCount: 12,
    averageRating: 4.5,
  },
];

describe("AdminProfessionals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatBogotaDate.mockImplementation((date) =>
      new Date(date).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
  });

  it("should show loading state initially", () => {
    mockGetProfessionalsSummary.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminProfessionals />);

    // Check loading spinner appears (it's a div with animate-spin class)
    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).toBeInTheDocument();
  });

  it("should render professionals list when data is loaded", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Profesionales")).toBeInTheDocument();
    });

    expect(screen.getByText("Lista de Profesionales")).toBeInTheDocument();
    expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Dra. María García")).toBeInTheDocument();
    expect(screen.getByText("Dr. Carlos López")).toBeInTheDocument();
  });

  it("should display professional information correctly", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Especialidad")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Citas")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("Registro")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();

    // Check professional data
    expect(screen.getByText("juan.perez@example.com")).toBeInTheDocument();
    expect(screen.getByText("Psicología Clínica")).toBeInTheDocument();
    expect(screen.getAllByText("Verificado")).toHaveLength(2);
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("should show verification status badges correctly", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getAllByText("Verificado")).toHaveLength(2);
    });

    // Check verified status
    const verifiedBadges = screen.getAllByText("Verificado");
    expect(verifiedBadges).toHaveLength(2); // Dr. Juan Pérez and Dr. Carlos López

    // Check pending status
    expect(screen.getByText("Pendiente")).toBeInTheDocument(); // Dra. María García
  });

  it("should display rating correctly", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("4.8")).toBeInTheDocument();
    });

    // Check star rating
    expect(screen.getAllByText("★")).toHaveLength(2);
    expect(screen.getByText("4.5")).toBeInTheDocument();

    // Check no ratings case
    expect(screen.getByText("Sin calificaciones")).toBeInTheDocument();
  });

  it("should show action buttons for each professional", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    // Check verify/revoke buttons
    const revokeButtons = screen.getAllByText("Revocar");
    const verifyButtons = screen.getAllByText("Verificar");
    expect(revokeButtons).toHaveLength(2); // Verified professionals
    expect(verifyButtons).toHaveLength(1); // Unverified professional

    // Check view credentials buttons
    const viewCredentialsButtons = screen.getAllByText("Ver Credenciales");
    expect(viewCredentialsButtons).toHaveLength(3);
  });

  it("should handle verification toggle successfully", async () => {
    const user = userEvent.setup();
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);
    mockUpdateProfessionalVerification.mockResolvedValue({ success: true });

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    const revokeButton = screen.getAllByText("Revocar")[0];
    await user.click(revokeButton);

    expect(mockUpdateProfessionalVerification).toHaveBeenCalledWith("prof-1", false);
  });

  it("should handle verification toggle error", async () => {
    const user = userEvent.setup();
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);
    mockUpdateProfessionalVerification.mockResolvedValue({
      success: false,
      error: "Error updating verification",
    });

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    const revokeButton = screen.getAllByText("Revocar")[0];
    await user.click(revokeButton);

    await waitFor(() => {
      expect(screen.getByText("Error updating verification")).toBeInTheDocument();
    });
  });

  it("should show loading state during verification update", async () => {
    const user = userEvent.setup();
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);
    mockUpdateProfessionalVerification.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
    );

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    const revokeButton = screen.getAllByText("Revocar")[0];
    await user.click(revokeButton);

    // Check loading spinner appears (it's a div with animate-spin class)
    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).toBeInTheDocument();
  });

  it("should handle view credentials button click", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    const viewCredentialsButton = screen.getAllByText("Ver Credenciales")[0];
    await user.click(viewCredentialsButton);

    expect(alertSpy).toHaveBeenCalledWith("Ver credenciales - Por implementar");

    alertSpy.mockRestore();
  });

  it("should show empty state when no professionals", async () => {
    mockGetProfessionalsSummary.mockResolvedValue([]);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("No hay profesionales registrados")).toBeInTheDocument();
    });
  });

  it("should handle loading error", async () => {
    mockGetProfessionalsSummary.mockRejectedValue(new Error("Failed to load"));

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar los profesionales")).toBeInTheDocument();
    });
  });

  it("should format dates correctly", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    });

    expect(mockFormatBogotaDate).toHaveBeenCalledWith(new Date("2023-01-15T10:00:00Z"), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });

  it("should have proper styling classes", async () => {
    mockGetProfessionalsSummary.mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Profesionales")).toBeInTheDocument();
    });

    // Check main container
    const container = screen.getByText("Gestión de Profesionales").closest("div")?.parentElement;
    expect(container).toHaveClass("container", "mx-auto", "px-4", "py-8");

    // Check table styling
    const table = screen.getByRole("table");
    expect(table).toHaveClass("w-full");

    // Check row hover effects
    const rows = screen.getAllByRole("row");
    rows.forEach((row, index) => {
      if (index > 0) {
        // Skip header row
        expect(row).toHaveClass("border-b", "hover:bg-neutral-50", "dark:hover:bg-neutral-800");
      }
    });
  });

  it("should display error message with proper styling", async () => {
    mockGetProfessionalsSummary.mockRejectedValue(new Error("Network error"));

    render(<AdminProfessionals />);

    await waitFor(() => {
      const errorMessage = screen.getByText("Error al cargar los profesionales");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.closest("div")).toHaveClass(
        "mb-6",
        "rounded-md",
        "border",
        "border-red-200",
        "bg-red-50",
        "p-4",
        "text-red-600",
        "dark:border-red-800",
        "dark:bg-red-900/20",
        "dark:text-red-400",
      );
    });
  });
});
