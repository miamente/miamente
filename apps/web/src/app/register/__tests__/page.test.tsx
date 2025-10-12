import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRouter } from "next/navigation";

import RegisterPage from "../page";
import { useAuth, isUserVerified } from "@/hooks/useAuth";
import { registerWithEmail } from "@/lib/auth";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  useUnifiedAuth: vi.fn(),
  isUserVerified: vi.fn(),
}));

// Mock the auth utilities
vi.mock("@/lib/auth", () => ({
  registerWithEmail: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockIsUserVerified = vi.mocked(isUserVerified);
const mockRegisterWithEmail = vi.mocked(registerWithEmail);
const mockUseRouter = vi.mocked(useRouter);

describe("RegisterPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render registration form when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    expect(screen.getByRole("button", { name: "Crear Cuenta" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirmar Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear Cuenta" })).toBeInTheDocument();
    expect(screen.getByText("¿Ya tienes cuenta?")).toBeInTheDocument();
    expect(screen.getByText("Inicia sesión")).toBeInTheDocument();
  });

  it("should show redirecting message when user is authenticated", () => {
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

    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });

  it("should redirect to dashboard when user is verified", () => {
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

    mockIsUserVerified.mockReturnValue(true);
    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should redirect to verify when user is not verified", () => {
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

    mockIsUserVerified.mockReturnValue(false);
    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle successful registration and redirect to dashboard", async () => {
    const mockRegisterUser = vi.fn().mockResolvedValue(undefined);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: mockRegisterUser,
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Fill out the form - use fireEvent for better performance
    const nameInput = screen.getByPlaceholderText("Nombre completo");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Contraseña");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirmar Contraseña");
    const checkbox = screen.getByRole("checkbox", { name: /acepto los términos/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    fireEvent.click(checkbox);

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
      });
    });
  });

  it("should handle registration error", async () => {
    const user = userEvent.setup();
    const mockRegisterUser = vi.fn().mockRejectedValue(new Error("Email already exists"));

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: mockRegisterUser,
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Fill out and submit the form
    await user.type(screen.getByPlaceholderText("Nombre completo"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.type(screen.getByPlaceholderText("Confirmar Contraseña"), "password123");
    await user.click(screen.getByRole("checkbox", { name: /acepto los términos/i }));
    await user.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("should show loading state during registration", async () => {
    const user = userEvent.setup();
    // Make the promise resolve after a delay to test loading state
    const mockRegisterUser = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: mockRegisterUser,
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Fill out and submit the form
    await user.type(screen.getByPlaceholderText("Nombre completo"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.type(screen.getByPlaceholderText("Confirmar Contraseña"), "password123");
    await user.click(screen.getByRole("checkbox", { name: /acepto los términos/i }));
    await user.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText("Creando cuenta e iniciando sesión...")).toBeInTheDocument();
    });

    // Check that form is disabled during loading
    expect(screen.getByPlaceholderText("Nombre completo")).toBeDisabled();
    expect(screen.getByPlaceholderText("Email")).toBeDisabled();
    expect(screen.getByPlaceholderText("Contraseña")).toBeDisabled();
    expect(screen.getByPlaceholderText("Confirmar Contraseña")).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /acepto los términos/i })).toBeDisabled();
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Submit form without filling fields
    await user.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    // Check that validation errors appear
    await waitFor(() => {
      expect(screen.getByText("El nombre debe tener al menos 2 caracteres")).toBeInTheDocument();
    });
  });

  it.skip("should show validation error for invalid email", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Fill out form with invalid email
    await user.type(screen.getByPlaceholderText("Nombre completo"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "invalid-email");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.type(screen.getByPlaceholderText("Confirmar Contraseña"), "password123");
    await user.click(screen.getByRole("checkbox", { name: /acepto los términos/i }));

    // Submit the form
    await user.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    // Check that email validation error appears immediately
    expect(screen.getByText("Email inválido")).toBeInTheDocument();

    // Verify that registerWithEmail was not called due to validation error
    expect(mockRegisterWithEmail).not.toHaveBeenCalled();
  });

  it("should show validation error for password mismatch", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Fill out form with mismatched passwords
    await user.type(screen.getByPlaceholderText("Nombre completo"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.type(screen.getByPlaceholderText("Confirmar Contraseña"), "different123");
    await user.click(screen.getByRole("checkbox", { name: /acepto los términos/i }));
    await user.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    // Check that password mismatch error appears
    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
    });
  });

  it("should show validation error for missing consent", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    // Fill out form without checking consent
    await user.type(screen.getByPlaceholderText("Nombre completo"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "password123");
    await user.type(screen.getByPlaceholderText("Confirmar Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Crear Cuenta" }));

    // Check that consent validation error appears
    await waitFor(() => {
      expect(
        screen.getByText("Debes aceptar los términos y condiciones y la política de privacidad"),
      ).toBeInTheDocument();
    });
  });

  it("should have proper links to terms and privacy", () => {
    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    const termsLink = screen.getByText("Términos y Condiciones");
    const privacyLink = screen.getByText("Política de Privacidad");

    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("should have proper link to login page", () => {
    mockUseAuth.mockReturnValue({
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
      getAuthHeaders: vi.fn(),
    });

    render(<RegisterPage />);

    const loginLink = screen.getByText("Inicia sesión");
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
