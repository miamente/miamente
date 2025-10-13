import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminUsers from "../page";

// Mock the API client
const mockApiClient = vi.hoisted(() => ({
  getAllAccountsAdmin: vi.fn(),
  toggleAccountStatus: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiClient: mockApiClient,
}));

// Mock the useAdminData hook
const mockUseAdminData = {
  data: [] as MockUser[] | null,
  loading: false,
  error: null as string | null,
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  setError: vi.fn(),
};

vi.mock("@/hooks/useAdminData", () => ({
  useAdminData: vi.fn(() => mockUseAdminData),
}));

// Mock AdminDataTable component
interface MockUser {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role: string;
  created_at: string;
  last_login: string | null;
}

interface AdminDataTableProps {
  title: string;
  description: string;
  data: MockUser[] | null;
  loading: boolean;
  error: string | null;
  onToggleActive: (user: MockUser) => void;
  onDelete: (user: MockUser) => void;
  onAdd: () => void;
}

vi.mock("@/components/admin/AdminDataTable", () => ({
  AdminDataTable: ({ title, description, data, loading, error, onToggleActive, onDelete, onAdd }: AdminDataTableProps) => (
    <div data-testid="admin-data-table">
      <h1>{title}</h1>
      <p>{description}</p>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && data.length > 0 && (
        <div>
          {data.map((user: MockUser) => (
            <div key={user.id} data-testid={`user-${user.id}`}>
              {user.full_name}
              <button onClick={() => onToggleActive(user)}>Toggle Active</button>
              <button onClick={() => onDelete(user)}>Delete</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={onAdd}>Add User</button>
    </div>
  ),
  commonRenderers: {
    contact: (user: MockUser) => <span>{user.email}</span>,
    status: (user: MockUser) => <span>{user.is_active ? "Active" : "Inactive"}</span>,
    date: (user: MockUser, field: string) => <span>{user[field as keyof MockUser]}</span>,
    lastLogin: (user: MockUser) => <span>{user.last_login || "Never"}</span>,
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  User: () => <div data-testid="user-icon">User</div>,
}));

// Mock Badge component
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, "confirm", {
  value: mockConfirm,
  writable: true,
});

describe("AdminUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminData.data = [];
    mockUseAdminData.loading = false;
    mockUseAdminData.error = null;
  });

  it("should render the admin users page with correct title and description", () => {
    render(<AdminUsers />);

    expect(screen.getByText("Gestión de Usuarios Regulares")).toBeInTheDocument();
    expect(screen.getByText("Administrar usuarios regulares de la plataforma")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    mockUseAdminData.loading = true;
    render(<AdminUsers />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show error state", () => {
    mockUseAdminData.error = "Test error";
    render(<AdminUsers />);

    expect(screen.getByText("Error: Test error")).toBeInTheDocument();
  });

  it("should render users when data is available", () => {
    const mockUsers: MockUser[] = [
      {
        id: "user-1",
        full_name: "John Doe",
        email: "john@example.com",
        is_active: true,
        role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
        
      },
      {
        id: "user-2",
        full_name: "Jane Smith",
        email: "jane@example.com",
        is_active: false,
        role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
      },
    ];

    mockUseAdminData.data = mockUsers;
    render(<AdminUsers />);

    expect(screen.getByTestId(`user-${mockUsers[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`user-${mockUsers[1].id}`)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should call toggleUserStatus when toggle active button is clicked", async () => {
    const mockUser: MockUser = {
      id: "user-1",
      full_name: "John Doe",
      email: "john@example.com",
      is_active: true,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    };

    mockUseAdminData.data = [mockUser];
    mockApiClient.toggleAccountStatus.mockResolvedValue({ ...mockUser, is_active: false });

    render(<AdminUsers />);

    const toggleButton = screen.getByText("Toggle Active");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockApiClient.toggleAccountStatus).toHaveBeenCalledWith("user-1", false);
      expect(mockUseAdminData.updateItem).toHaveBeenCalledWith("user-1", { ...mockUser, is_active: false });
    });
  });

  it("should handle toggle user status error", async () => {
    const mockUser: MockUser = {
      id: "user-1",
      full_name: "John Doe",
      email: "john@example.com",
      is_active: true,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    };

    mockUseAdminData.data = [mockUser];
    mockApiClient.toggleAccountStatus.mockRejectedValue(new Error("API Error"));

    render(<AdminUsers />);

    const toggleButton = screen.getByText("Toggle Active");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockUseAdminData.setError).toHaveBeenCalledWith("Error al actualizar el estado del usuario");
    });
  });

  it("should call deleteUser when delete button is clicked and user confirms", async () => {
    const mockUser: MockUser = {
      id: "user-1",
      full_name: "John Doe",
      email: "john@example.com",
      is_active: true,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    };

    mockUseAdminData.data = [mockUser];
    mockConfirm.mockReturnValue(true);
    mockApiClient.deleteAccount.mockResolvedValue({});

    render(<AdminUsers />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("¿Estás seguro de que quieres eliminar este usuario?");
      expect(mockApiClient.deleteAccount).toHaveBeenCalledWith("user-1");
      expect(mockUseAdminData.removeItem).toHaveBeenCalledWith("user-1");
    });
  });

  it("should not delete user when user cancels confirmation", async () => {
    const mockUser: MockUser = {
      id: "user-1",
      full_name: "John Doe",
      email: "john@example.com",
      is_active: true,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    };

    mockUseAdminData.data = [mockUser];
    mockConfirm.mockReturnValue(false);

    render(<AdminUsers />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("¿Estás seguro de que quieres eliminar este usuario?");
      expect(mockApiClient.deleteAccount).not.toHaveBeenCalled();
      expect(mockUseAdminData.removeItem).not.toHaveBeenCalled();
    });
  });

  it("should handle delete user error", async () => {
    const mockUser: MockUser = {
      id: "user-1",
      full_name: "John Doe",
      email: "john@example.com",
      is_active: true,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    };

    mockUseAdminData.data = [mockUser];
    mockConfirm.mockReturnValue(true);
    mockApiClient.deleteAccount.mockRejectedValue(new Error("API Error"));

    render(<AdminUsers />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockUseAdminData.setError).toHaveBeenCalledWith("Error al eliminar el usuario");
    });
  });

  it("should call handleAddUser when add button is clicked", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<AdminUsers />);

    const addButton = screen.getByText("Add User");
    fireEvent.click(addButton);

    expect(consoleSpy).toHaveBeenCalledWith("Agregar usuario");
    
    consoleSpy.mockRestore();
  });

  it("should pass correct props to AdminDataTable", () => {
    const mockUsers = [
      {
        id: "user-1",
        full_name: "John Doe",
        email: "john@example.com",
        is_active: true,
        role: "user",
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
      },
    ];

    mockUseAdminData.data = mockUsers;
    mockUseAdminData.loading = true;
    mockUseAdminData.error = "Test error";

    render(<AdminUsers />);

    const adminDataTable = screen.getByTestId("admin-data-table");
    expect(adminDataTable).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Error: Test error")).toBeInTheDocument();
  });

  it("should handle empty users array", () => {
    mockUseAdminData.data = [];
    render(<AdminUsers />);

    expect(screen.getByTestId("admin-data-table")).toBeInTheDocument();
    expect(screen.queryByTestId(/user-/)).not.toBeInTheDocument();
  });
});