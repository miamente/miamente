import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminUsers from "../admin-users/page";

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

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/admin/admin-users"),
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getUsers: vi.fn(),
    toggleUserStatus: vi.fn(),
    deleteUser: vi.fn(),
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
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  UserCog: () => <div data-testid="user-cog-icon">UserCog</div>,
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, "confirm", {
  value: mockConfirm,
  writable: true,
});

describe("AdminUsers", () => {
  const mockUsers = [
    {
      id: "1",
      email: "admin@example.com",
      full_name: "Admin User",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      role: "admin",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      email: "moderator@example.com",
      full_name: "Moderator User",
      phone: "+0987654321",
      is_active: false,
      is_verified: true,
      role: "moderator",
      created_at: "2024-01-02T00:00:00Z",
      last_login: null,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);

    // Mock successful API responses
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockUsers);
    (
      apiClient.toggleUserStatus as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue({ ...mockUsers[0], is_active: false });
    (
      apiClient.deleteUser as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue({});
  });

  it("should render the page title and description", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Usuarios Administrativos")).toBeInTheDocument();
      expect(
        screen.getByText("Administrar usuarios con roles administrativos y especiales"),
      ).toBeInTheDocument();
    });
  });

  it("should render the add user button", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Agregar Usuario Administrativo")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminUsers />);

    // Check for loading spinner by class instead of role
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should load and display admin users", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
      expect(screen.getByText("moderator@example.com")).toBeInTheDocument();
    });

    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Moderator User")).toBeInTheDocument();
  });


  it("should display correct role badges", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    // Check for admin role badge with destructive variant
    const adminBadge = screen.getByText("Administrador");
    expect(adminBadge).toHaveAttribute("data-variant", "destructive");

    // Check for moderator role badge with outline variant
    const moderatorBadge = screen.getByText("Moderator");
    expect(moderatorBadge).toHaveAttribute("data-variant", "outline");
  });

  it("should display correct status badges", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Activo")).toBeInTheDocument();
      expect(screen.getByText("Inactivo")).toBeInTheDocument();
    });

    const activeBadges = screen.getAllByText("Activo");
    const inactiveBadges = screen.getAllByText("Inactivo");

    expect(activeBadges.length).toBeGreaterThan(0);
    expect(inactiveBadges.length).toBeGreaterThan(0);
  });

  it("should handle toggle user status", async () => {
    const { apiClient } = await import("@/lib/api");
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    // Find and click the toggle button (desactivar)
    const toggleButton = screen.getByText("Desactivar");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(apiClient.toggleUserStatus).toHaveBeenCalledWith("1", false);
    });
  });

  it("should handle delete user", async () => {
    const { apiClient } = await import("@/lib/api");
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    // Find and click the delete button for the first user (admin)
    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        "¿Estás seguro de que quieres eliminar este usuario administrativo?",
      );
      expect(apiClient.deleteUser).toHaveBeenCalledWith("1");
    });
  });

  it("should not delete user if confirmation is cancelled", async () => {
    const { apiClient } = await import("@/lib/api");
    mockConfirm.mockReturnValue(false);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(apiClient.deleteUser).not.toHaveBeenCalled();
  });

  it("should display error message when API fails", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockRejectedValue(new Error("API Error"));

    render(<AdminUsers />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Error al cargar los datos. Por favor, inténtalo de nuevo.",
        ),
      ).toBeInTheDocument();
    });
  });


  it("should show no users message when no admin users exist", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue([]);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("No hay usuarios administrativos en el sistema")).toBeInTheDocument();
    });
  });

  it("should display user count in table header", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Usuarios Administrativos (2)")).toBeInTheDocument();
    });
  });


});
