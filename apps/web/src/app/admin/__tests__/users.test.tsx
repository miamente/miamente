import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminUsers from "../users/page";

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
    getUsers: vi.fn(),
    toggleUserStatus: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock the timezone utility
vi.mock("@/lib/timezone", () => ({
  formatBogotaDate: vi.fn((date) => date.toISOString().split("T")[0]),
}));

// Mock the AdminDataTable component
vi.mock("@/components/admin/AdminDataTable", () => ({
  AdminDataTable: ({ title, description, addButtonText, onAdd, data, loading, error, columns, onToggleActive, onDelete, emptyMessage }: {
    title: string;
    description: string;
    addButtonText?: string;
    onAdd?: () => void;
    data: unknown[];
    loading: boolean;
    error: string | null;
    columns: unknown[];
    onToggleActive?: (item: unknown) => void;
    onDelete?: (item: unknown) => void;
    emptyMessage?: string;
  }) => {
    if (loading) {
      return <div data-testid="loading-spinner">Loading...</div>;
    }
    
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
          {addButtonText && onAdd && (
            <button data-testid="button" onClick={onAdd}>
              {addButtonText}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div data-testid="card">
          <div data-testid="card-header">
            <h3 data-testid="card-title">
              {title} ({data.length})
            </h3>
          </div>
          <div data-testid="card-content">
            {data.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {columns.map((column: any) => (
                        <th
                          key={String(column.key)}
                          className="p-4 text-left font-medium"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item: any) => (
                      <tr
                        key={(item as any).id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {(columns as any[]).map((column: any) => (
                          <td key={String(column.key)} className="p-4">
                            {column.render ? column.render(item) : (item as any)[column.key]}
                          </td>
                        ))}
                        <td className="p-4">
                          <div data-testid="dropdown-menu">
                            <div data-testid="dropdown-trigger">
                              <button data-testid="button">
                                <div data-testid="more-vertical-icon">More</div>
                              </button>
                            </div>
                            <div data-testid="dropdown-content">
                              <div data-testid="dropdown-item">
                                <div data-testid="edit-icon">Edit</div>
                                Editar
                              </div>
                              <div 
                                data-testid="dropdown-item" 
                                onClick={() => onToggleActive && onToggleActive(item)}
                              >
                                {item.is_active ? (
                                  <>
                                    <div data-testid="user-x-icon">UserX</div>
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <div data-testid="user-check-icon">UserCheck</div>
                                    Activar
                                  </>
                                )}
                              </div>
                              <div 
                                data-testid="dropdown-item" 
                                onClick={() => onDelete && onDelete(item)}
                                className="text-red-600"
                              >
                                <div data-testid="trash-icon">Trash</div>
                                Eliminar
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  commonRenderers: {
    contact: (item: any) => (
      <div>
        <div className="flex items-center space-x-2 text-sm">
          <div data-testid="mail-icon">Mail</div>
          <span>{(item as any).email}</span>
        </div>
        {(item as any).phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div data-testid="phone-icon">Phone</div>
            <span>{(item as any).phone}</span>
          </div>
        )}
      </div>
    ),
    status: (item: any) => (
      <div className="space-y-1">
        <span data-testid="badge" data-variant={(item as any).is_active ? "default" : "secondary"}>
          {(item as any).is_active ? "Activo" : "Inactivo"}
        </span>
        <br />
        <span data-testid="badge" data-variant={(item as any).is_verified ? "default" : "outline"}>
          {(item as any).is_verified ? "Verificado" : "No verificado"}
        </span>
      </div>
    ),
    date: (item: any, field: string) => (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div data-testid="calendar-icon">Calendar</div>
        <span>
          {new Date((item as any)[field]).toISOString().split("T")[0]}
        </span>
      </div>
    ),
    lastLogin: (item: any) => (
      <div className="text-sm text-gray-500">
        {(item as any).last_login
          ? new Date((item as any).last_login).toISOString().split("T")[0]
          : "Nunca"}
      </div>
    ),
  },
}));

// Mock the useAdminData hook
vi.mock("@/hooks/useAdminData", () => ({
  useAdminData: ({ loadFunction }: { loadFunction: () => Promise<unknown[]> }) => {
    const [data, setData] = React.useState<unknown[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await loadFunction();
          setData(Array.isArray(response) ? response : []);
        } catch (err) {
          console.error("Error loading data:", err);
          setError("Error al cargar los datos. Por favor, inténtalo de nuevo.");
          setData([]);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [loadFunction]);

    const updateItem = (id: string, updatedItem: unknown) => {
      setData((prev: unknown[]) => prev.map((item: any) => item.id === id ? updatedItem : item));
    };

    const removeItem = (id: string) => {
      setData((prev: unknown[]) => prev.filter((item: any) => item.id !== id));
    };

    return {
      data,
      loading,
      error,
      updateItem,
      removeItem,
      setError,
    };
  },
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
  User: () => <div data-testid="user-icon">User</div>,
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

  it("should render the page title for regular users", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockUsers);

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



  it("should display correct verification status", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Verificado")).toBeInTheDocument();
      expect(screen.getByText("No verificado")).toBeInTheDocument();
    });
  });

  it("should handle toggle user status", async () => {
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockUsers);

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
    (
      apiClient.getUsers as unknown as {
        mockResolvedValue: (value: unknown) => void;
        mockRejectedValue: (value: unknown) => void;
        mockImplementation: (value: unknown) => void;
      }
    ).mockResolvedValue(mockUsers);

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
        screen.getByText("Error al cargar los datos. Por favor, inténtalo de nuevo."),
      ).toBeInTheDocument();
    });
  });


  it("should show no users message when no regular users exist", async () => {
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
      expect(
        screen.getByText("No hay usuarios regulares en el sistema"),
      ).toBeInTheDocument();
    });
  });

  it("should display user count in table header", async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Usuarios Regulares (2)")).toBeInTheDocument();
    });
  });
});
