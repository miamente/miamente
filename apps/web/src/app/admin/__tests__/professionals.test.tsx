import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminProfessionals from "../professionals/page";

// Define proper types for mock components
interface MockComponentProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface MockButtonProps extends MockComponentProps {
  onClick?: () => void;
}

interface MockInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  [key: string]: unknown;
}

interface MockDropdownProps extends MockComponentProps {
  asChild?: boolean;
  align?: string;
}

interface MockDropdownItemProps extends MockComponentProps {
  onClick?: () => void;
  className?: string;
}

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionals: vi.fn(),
    toggleProfessionalStatus: vi.fn(),
    deleteProfessional: vi.fn(),
  },
}));

// Mock the timezone utility
vi.mock("@/lib/timezone", () => ({
  formatBogotaDate: vi.fn((date) => date.toISOString().split("T")[0]),
}));

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: MockComponentProps) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: MockButtonProps) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, ...props }: MockInputProps) => (
    <input data-testid="input" onChange={onChange} value={value} {...props} />
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, ...props }: MockComponentProps & { variant?: string }) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: MockComponentProps) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children, align, ...props }: MockDropdownProps) => (
    <div data-testid="dropdown-content" data-align={align} {...props}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className, ...props }: MockDropdownItemProps) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className} {...props}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild, ...props }: MockDropdownProps) => (
    <div data-testid="dropdown-trigger" data-as-child={asChild} {...props}>
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  MoreVertical: () => <div data-testid="more-vertical-icon">More</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  UserX: () => <div data-testid="user-x-icon">UserX</div>,
  UserCheck: () => <div data-testid="user-check-icon">UserCheck</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Stethoscope: () => <div data-testid="stethoscope-icon">Stethoscope</div>,
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, "confirm", {
  value: mockConfirm,
  writable: true,
});

describe("AdminProfessionals", () => {
  const mockProfessionals = [
    {
      id: "1",
      email: "professional1@example.com",
      full_name: "Professional 1",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      license_number: "PSI-12345",
      years_experience: 5,
      specialty_ids: ["spec1", "spec2"],
      modality_ids: ["mod1"],
      therapeutic_approach_ids: [],
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      email: "professional2@example.com",
      full_name: "Professional 2",
      phone: "+0987654321",
      is_active: false,
      is_verified: false,
      license_number: "PSI-67890",
      years_experience: 3,
      specialty_ids: [],
      modality_ids: [],
      therapeutic_approach_ids: [],
      created_at: "2024-01-02T00:00:00Z",
      last_login: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it("should render the page title and description", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Profesionales")).toBeInTheDocument();
      expect(screen.getByText("Administrar profesionales de la plataforma")).toBeInTheDocument();
    });
  });

  it("should render the add professional button", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Agregar Profesional")).toBeInTheDocument();
    });
  });

  it("should load and display professionals", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
      expect(screen.getByText("professional2@example.com")).toBeInTheDocument();
    });

    expect(screen.getByText("Professional 1")).toBeInTheDocument();
    expect(screen.getByText("Professional 2")).toBeInTheDocument();
  });

  it("should display specialty information correctly", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("2 especialidad(es)")).toBeInTheDocument();
      expect(screen.getByText("Sin especialidades")).toBeInTheDocument();
    });
  });

  it("should filter professionals by search term", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre, email o biografía...");
    fireEvent.change(searchInput, { target: { value: "professional1" } });

    expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    expect(screen.queryByText("professional2@example.com")).not.toBeInTheDocument();
  });

  it("should filter professionals by status", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue("Todos los estados");
    fireEvent.change(statusSelect, { target: { value: "active" } });

    expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    expect(screen.queryByText("professional2@example.com")).not.toBeInTheDocument();
  });

  it("should display correct verification status", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Verificado")).toBeInTheDocument();
      expect(screen.getByText("No verificado")).toBeInTheDocument();
    });
  });

  it("should handle toggle professional status", async () => {
    const { apiClient } = await import("@/lib/api");
    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const toggleButton = screen.getByText("Desactivar");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(apiClient.toggleProfessionalStatus).toHaveBeenCalledWith("1", false);
    });
  });

  it("should handle delete professional", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        "¿Estás seguro de que quieres eliminar este profesional?",
      );
      expect(apiClient.deleteProfessional).toHaveBeenCalledWith("1");
    });
  });

  it("should not delete professional if confirmation is cancelled", async () => {
    mockConfirm.mockReturnValue(false);
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(apiClient.deleteProfessional).not.toHaveBeenCalled();
  });

  it("should display error message when API fails", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockRejectedValue(new Error("API Error"));

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar los profesionales. Por favor, inténtalo de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("should show empty state when no professionals match filters", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre, email o biografía...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText("No hay profesionales que coincidan con los filtros seleccionados"),
    ).toBeInTheDocument();
  });

  it("should show no professionals message when no professionals exist", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue([]);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(
        screen.getByText("No hay profesionales que coincidan con los filtros seleccionados"),
      ).toBeInTheDocument();
    });
  });

  it("should display professional count in table header", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Profesionales (2 de 2)")).toBeInTheDocument();
    });
  });

  it("should handle API errors gracefully during status toggle", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);
    (
      apiClient.toggleProfessionalStatus as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockRejectedValue(new Error("Toggle failed"));

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const toggleButton = screen.getByText("Desactivar");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("Error al actualizar el estado del profesional")).toBeInTheDocument();
    });
  });

  it("should handle API errors gracefully during professional deletion", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockProfessionals);
    (
      apiClient.deleteProfessional as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockRejectedValue(new Error("Delete failed"));

    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("professional1@example.com")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Error al eliminar el profesional")).toBeInTheDocument();
    });
  });
});
