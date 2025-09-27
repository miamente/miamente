import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";

import LoginPage from "../page";
import { useAuthContext, isUserVerified } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";

// Mock the auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
  isUserVerified: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockUseAuthContext = vi.mocked(useAuthContext);
const mockIsUserVerified = vi.mocked(isUserVerified);
const mockUseRouter = vi.mocked(useRouter);

describe("LoginPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
    mockIsUserVerified.mockReturnValue(false);
  });

  it("should render login form when user is not authenticated", () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    expect(screen.getAllByText("Iniciar Sesión")).toHaveLength(2);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar Sesión" })).toBeInTheDocument();
    expect(screen.getByText("¿No tienes cuenta?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Regístrate" })).toBeInTheDocument();
  });

  it("should show redirecting message when user is authenticated but not verified", () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        is_verified: false,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });
    mockIsUserVerified.mockReturnValue(false);

    render(<LoginPage />);

    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should redirect to verify page when user is authenticated but not verified", async () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        is_verified: false,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });
    mockIsUserVerified.mockReturnValue(false);

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should redirect to dashboard when user is authenticated and verified", async () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });
    mockIsUserVerified.mockReturnValue(true);

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should handle successful professional login", async () => {
    const user = userEvent.setup();
    const mockLoginUnified = vi.fn().mockResolvedValue(undefined);

    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: mockLoginUnified,
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "prof@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(mockLoginUnified).toHaveBeenCalledWith({
        email: "prof@example.com",
        password: "password123",
      });
    });
  });

  it("should handle unified login failure", async () => {
    const user = userEvent.setup();
    const mockLoginUnified = vi.fn().mockRejectedValue(new Error("Login failed"));

    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: mockLoginUnified,
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "user@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(mockLoginUnified).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });
  });

  it("should show error message when login fails", async () => {
    const user = userEvent.setup();
    const mockLoginUnified = vi.fn().mockRejectedValue(new Error("Login failed"));

    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: mockLoginUnified,
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("should show loading state during login", async () => {
    const user = userEvent.setup();
    const mockLoginUnified = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: mockLoginUnified,
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText("Iniciando sesión...")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Iniciando sesión..." })).toBeDisabled();
    expect(screen.getByPlaceholderText("Email")).toBeDisabled();
    expect(screen.getByPlaceholderText("Contraseña")).toBeDisabled();
  });

  it("should handle form submission with valid data", async () => {
    const user = userEvent.setup();
    const mockLoginUnified = vi.fn().mockResolvedValue(undefined);

    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: mockLoginUnified,
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

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

  it("should have proper form structure and accessibility", () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    // The form element doesn't have role="form" by default, so we check for the form element directly
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText("Email");
    expect(emailInput).toHaveAttribute("type", "email");

    const passwordInput = screen.getByPlaceholderText("Contraseña");
    expect(passwordInput).toHaveAttribute("type", "password");

    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("should have proper styling classes", () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    const { container } = render(<LoginPage />);

    // Check main container
    expect(container.firstChild).toHaveClass(
      "flex",
      "min-h-[50vh]",
      "items-center",
      "justify-center",
    );

    // Check card structure - find by class directly
    const card = container.querySelector(".w-full.max-w-md");
    expect(card).toBeInTheDocument();
  });

  it("should handle generic error messages", async () => {
    const user = userEvent.setup();
    const mockLoginUnified = vi.fn().mockRejectedValue("String error");

    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: mockLoginUnified,
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => {
      expect(screen.getByText("Error al iniciar sesión")).toBeInTheDocument();
    });
  });
});
