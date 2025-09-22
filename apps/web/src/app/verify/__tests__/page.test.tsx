import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRouter } from "next/navigation";

import VerifyPage from "../page";
import { useAuth, isUserVerified, getUserEmail } from "@/hooks/useAuth";
import { resendEmailVerification, logout } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  isUserVerified: vi.fn(),
  getUserEmail: vi.fn(),
}));

// Mock the auth utilities
vi.mock("@/lib/auth", () => ({
  resendEmailVerification: vi.fn(),
  logout: vi.fn(),
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockIsUserVerified = vi.mocked(isUserVerified);
const mockGetUserEmail = vi.mocked(getUserEmail);
const mockResendEmailVerification = vi.mocked(resendEmailVerification);
const mockLogout = vi.mocked(logout);
const mockApiClient = vi.mocked(apiClient);
const mockUseRouter = vi.mocked(useRouter);

describe("VerifyPage", () => {
  const mockPush = vi.fn();
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location.hostname
    Object.defineProperty(window, "location", {
      value: {
        hostname: "localhost",
      },
      writable: true,
    });

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("test@example.com");
    mockIsUserVerified.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state when loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);
    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should render verification form when user is authenticated but not verified", () => {
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    expect(screen.getByText("Verificar Email")).toBeInTheDocument();
    expect(screen.getByText(/Te hemos enviado un email de verificación a/)).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Reenviar Email de Verificación")).toBeInTheDocument();
    expect(screen.getByText("Ya verifiqué mi email")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("should show development mode notice in localhost", () => {
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    expect(screen.getByText(/Modo Desarrollo:/)).toBeInTheDocument();
    expect(screen.getByText(/puedes simular la verificación/)).toBeInTheDocument();
  });

  it("should not show development mode notice in production", () => {
    // Mock production environment
    Object.defineProperty(window, "location", {
      value: {
        hostname: "miamente.com",
      },
      writable: true,
    });

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    expect(screen.queryByText(/Modo Desarrollo:/)).not.toBeInTheDocument();
  });

  it("should handle resend verification email successfully", async () => {
    const user = userEvent.setup();
    // Make the promise resolve after a delay to test loading state
    mockResendEmailVerification.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    const resendButton = screen.getByText("Reenviar Email de Verificación");
    await user.click(resendButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText("Reenviando...")).toBeInTheDocument();
    });
    expect(mockResendEmailVerification).toHaveBeenCalled();

    // Check success state
    await waitFor(() => {
      expect(screen.getByText("Email de verificación reenviado exitosamente")).toBeInTheDocument();
    });
  });

  it("should handle resend verification email error", async () => {
    const user = userEvent.setup();
    mockResendEmailVerification.mockRejectedValue(new Error("Network error"));

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    const resendButton = screen.getByText("Reenviar Email de Verificación");
    await user.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should handle logout successfully", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    const logoutButton = screen.getByText("Cerrar Sesión");
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should handle simulate verification in development mode", async () => {
    const user = userEvent.setup();
    mockApiClient.post.mockResolvedValue({});
    mockRefreshUser.mockResolvedValue(undefined);

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    const simulateButton = screen.getByText("Ya verifiqué mi email");
    await user.click(simulateButton);

    expect(mockApiClient.post).toHaveBeenCalledWith("/auth/simulate-verification");
    expect(mockRefreshUser).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle simulate verification API error in development mode", async () => {
    const user = userEvent.setup();
    mockApiClient.post.mockRejectedValue(new Error("API error"));

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    const simulateButton = screen.getByText("Ya verifiqué mi email");
    await user.click(simulateButton);

    await waitFor(() => {
      expect(screen.getByText("Error al simular la verificación del email")).toBeInTheDocument();
    });
  });

  it("should handle simulate verification in production mode", async () => {
    // Mock production environment
    Object.defineProperty(window, "location", {
      value: {
        hostname: "miamente.com",
      },
      writable: true,
    });

    const user = userEvent.setup();

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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);

    const simulateButton = screen.getByText("Ya verifiqué mi email");
    await user.click(simulateButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "El email aún no ha sido verificado. Por favor revisa tu bandeja de entrada.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("should redirect to dashboard when user is already verified", () => {
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
      getAuthHeaders: vi.fn(),
    });

    render(<VerifyPage />);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
