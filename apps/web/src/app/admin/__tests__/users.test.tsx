import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminUsers from "../users/page";

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
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input data-testid="input" onChange={onChange} value={value} {...props} />
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
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
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, "confirm", {
  value: mockConfirm,
  writable: true,
});

describe("AdminUsers (Regular Users)", () => {
  const mockUsers = [
    {
      id: "1",
      email: "user1@example.com",
      full_name: "Regular User 1",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      email: "user2@example.com",
      full_name: "Regular User 2",
      phone: "+0987654321",
      is_active: false,
      is_verified: false,
      role: "user",
      created_at: "2024-01-02T00:00:00Z",
      last_login: null,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);

    // Mock successful API responses
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockResolvedValue(mockUsers);
    (apiClient.toggleUserStatus as any).mockResolvedValue({ ...mockUsers[0], is_active: false });
    (apiClient.deleteUser as any).mockResolvedValue({});
  });

  it("should render the page title for regular users", async () => {
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockResolvedValue(mockUsers);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Usuarios Regulares")).toBeInTheDocument();
      expect(
        screen.getByText("Administrar usuarios regulares de la plataforma"),
      ).toBeInTheDocument();
    });
  });

  it("should call API with user role filter", async () => {
    const { apiClient } = await import("@/lib/api");
    render(<AdminUsers />);

    await waitFor(() => {
      expect(apiClient.getUsers).toHaveBeenCalledWith({ role: "user" });
    });
  });

  it("should load and display regular users only", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    expect(screen.getByText("Regular User 1")).toBeInTheDocument();
    expect(screen.getByText("Regular User 2")).toBeInTheDocument();
  });

  it("should display all users as 'Usuario' role", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      const userBadges = screen.getAllByText("Usuario");
      expect(userBadges).toHaveLength(3); // 2 in table rows + 1 in table header
    });
  });

  it("should have correct role filter options", async () => {
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockResolvedValue(mockUsers);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Todos los usuarios")).toBeInTheDocument();
      expect(screen.getByText("Usuarios regulares")).toBeInTheDocument();
    });
  });

  it("should filter users by search term", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o email...");
    fireEvent.change(searchInput, { target: { value: "user1" } });

    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.queryByText("user2@example.com")).not.toBeInTheDocument();
  });

  it("should filter users by status", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue("Todos los estados");
    fireEvent.change(statusSelect, { target: { value: "active" } });

    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.queryByText("user2@example.com")).not.toBeInTheDocument();
  });

  it("should display correct verification status", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Verificado")).toBeInTheDocument();
      expect(screen.getByText("No verificado")).toBeInTheDocument();
    });
  });

  it("should handle toggle user status", async () => {
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockResolvedValue(mockUsers);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    const toggleButton = screen.getByText("Desactivar");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(apiClient.toggleUserStatus).toHaveBeenCalledWith("1", false);
    });
  });

  it("should handle delete user", async () => {
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockResolvedValue(mockUsers);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText("Eliminar")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        "¿Estás seguro de que quieres eliminar este usuario?",
      );
      expect(apiClient.deleteUser).toHaveBeenCalledWith("1");
    });
  });

  it("should display error message when API fails", async () => {
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockRejectedValue(new Error("API Error"));

    render(<AdminUsers />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar los usuarios. Por favor, inténtalo de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("should show empty state when no users match filters", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o email...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText("No hay usuarios que coincidan con los filtros seleccionados"),
    ).toBeInTheDocument();
  });

  it("should show no users message when no regular users exist", async () => {
    const { apiClient } = await import("@/lib/api");
    (apiClient.getUsers as any).mockResolvedValue([]);

    render(<AdminUsers />);

    await waitFor(() => {
      expect(
        screen.getByText("No hay usuarios que coincidan con los filtros seleccionados"),
      ).toBeInTheDocument();
    });
  });

  it("should display user count in table header", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Usuarios (2 de 2)")).toBeInTheDocument();
    });
  });
});
