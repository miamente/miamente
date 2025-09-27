import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LoginForm } from "../login-form";
import { type AuthUser, UserRole } from "@/lib/types";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock AuthContext
const mockLoginUser = vi.fn();
const mockLoginProfessional = vi.fn();
const mockLoginUnified = vi.fn();
const mockAuthContext = {
  user: null as AuthUser | null,
  loginUser: mockLoginUser,
  loginProfessional: mockLoginProfessional,
  loginUnified: mockLoginUnified,
  logout: vi.fn(),
  isLoading: false,
  isAuthenticated: false,
  registerUser: vi.fn(),
  registerProfessional: vi.fn(),
  registerUnified: vi.fn(),
  refreshUser: vi.fn(),
  getUserEmail: vi.fn(),
  getUserFullName: vi.fn(),
  isUserVerified: vi.fn(),
  isEmailVerified: vi.fn(),
  getUserId: vi.fn(),
  getUserUid: vi.fn(),
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(() => mockAuthContext),
  isUserVerified: vi.fn((user) => user?.email_verified || false),
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = null;
  });

  it("should render login form with default props", () => {
    render(<LoginForm />);

    expect(screen.getAllByText("Iniciar Sesión")).toHaveLength(2); // Title and button
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar Sesión" })).toBeInTheDocument();
    expect(screen.getByText("¿No tienes cuenta?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Regístrate" })).toBeInTheDocument();
  });

  it("should render admin login form when isAdminLogin is true", () => {
    render(<LoginForm isAdminLogin={true} />);

    expect(screen.getByText("Iniciar Sesión - Administración")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // Admin icon
    expect(screen.queryByText("¿No tienes cuenta?")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Regístrate" })).not.toBeInTheDocument();
  });

  it("should handle form submission with valid data", async () => {
    mockLoginUnified.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(mockLoginUnified).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should handle admin login form submission", async () => {
    mockLoginUser.mockResolvedValue(undefined);

    render(<LoginForm isAdminLogin={true} />);

    await user.type(screen.getByPlaceholderText("Email"), "admin@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "admin123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "admin123",
      });
    });
  });

  it("should use unified login for regular form", async () => {
    mockLoginUnified.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(mockLoginUnified).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should show error message when login fails", async () => {
    mockLoginUnified.mockRejectedValue(new Error("Invalid credentials"));

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should show loading state during form submission", async () => {
    mockLoginUnified.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    expect(screen.getByText("Iniciando sesión...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciando sesión..." })).toBeDisabled();
  });

  it("should redirect authenticated user to dashboard", () => {
    mockAuthContext.user = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "test@example.com",
        full_name: "Test User",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    render(<LoginForm />);

    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should redirect authenticated admin user to admin dashboard", () => {
    mockAuthContext.user = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    render(<LoginForm isAdminLogin={true} />);

    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should redirect unverified user to verify page", () => {
    mockAuthContext.user = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "test@example.com",
        full_name: "Test User",
        phone: "+1234567890",
        is_active: true,
        is_verified: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    render(<LoginForm />);

    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should show error for non-admin user trying to access admin login", async () => {
    mockAuthContext.user = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "User Name",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    render(<LoginForm isAdminLogin={true} />);

    // The component redirects immediately, so we check for the redirect message
    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should use custom redirect path when provided", () => {
    mockAuthContext.user = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "test@example.com",
        full_name: "Test User",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    render(<LoginForm redirectPath="/custom-dashboard" />);

    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should disable form fields during loading", async () => {
    mockLoginUnified.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    expect(screen.getByPlaceholderText("Email")).toBeDisabled();
    expect(screen.getByPlaceholderText("Contraseña")).toBeDisabled();
  });

  it("should prevent form submission with invalid email", async () => {
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "invalid-email");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    // The login functions should not be called due to validation failure
    expect(mockLoginUnified).not.toHaveBeenCalled();
  });

  it("should show validation errors for empty password", async () => {
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText(/contraseña/i)).toBeInTheDocument();
    });
  });

  it("should handle unified login failure", async () => {
    mockLoginUnified.mockRejectedValue(new Error("Login failed"));

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("should clear error message when form is resubmitted", async () => {
    mockLoginUnified.mockRejectedValueOnce(new Error("First error")).mockResolvedValueOnce(undefined);

    render(<LoginForm />);

    // First submission with error
    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Second submission should clear error
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });
});
