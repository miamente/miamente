import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";

import DashboardPage from "../page";
import { useAuth, isUserVerified, getUserEmail, getUserFullName } from "@/hooks/useAuth";
import { UserRole } from "@/lib/types";

// Mock hooks and modules
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  useUnifiedAuth: vi.fn(),
  isUserVerified: vi.fn(),
  getUserEmail: vi.fn(),
  getUserFullName: vi.fn(),
  getAccountEmail: vi.fn(),
  getAccountId: vi.fn(),
  getAccountFullName: vi.fn(),
  getAccountRole: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockUseAuth = vi.mocked(useAuth);
const mockIsUserVerified = vi.mocked(isUserVerified);
const mockGetUserEmail = vi.mocked(getUserEmail);
const mockGetUserFullName = vi.mocked(getUserFullName);

// Create a mock for useUnifiedAuth
import { useUnifiedAuth } from "@/hooks/useAuth";
const mockUseUnifiedAuth = vi.mocked(useUnifiedAuth);

describe("DashboardPage", () => {
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
    mockGetUserEmail.mockReturnValue("test@example.com");
    mockGetUserFullName.mockReturnValue("Test User");
    
    // Default mock for useUnifiedAuth (can be overridden in individual tests)
    mockUseUnifiedAuth.mockReturnValue({
      account: null,
      profile: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it("should show loading state when isLoading is true", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
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

    mockUseUnifiedAuth.mockReturnValue({
      account: null,
      profile: null,
      role: null,
      isLoading: true,
      isAuthenticated: false,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    // The loading spinner doesn't have role="status", so we just check for the text
  });

  it("should redirect to login when user is not authenticated", async () => {
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

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
    expect(screen.getByText("Redirigiendo al login...")).toBeInTheDocument();
  });

  it("should render dashboard when user is authenticated (no verification required)", async () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true); // Always true now

    render(<DashboardPage />);

    // Should render dashboard content, not redirect
    expect(screen.getByText("Dashboard Usuario")).toBeInTheDocument();
  });

  it("should render user dashboard when user is authenticated and verified", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(screen.getByText("Dashboard Usuario")).toBeInTheDocument();
    expect(screen.getByText("Bienvenido, Test User")).toBeInTheDocument();
    expect(screen.getByText("Rol: Usuario")).toBeInTheDocument();
  });

  it("should render professional dashboard when professional is authenticated and verified", () => {
    const mockProfessional = {
      type: UserRole.PROFESSIONAL,
      data: {
        id: "prof-123",
        email: "prof@example.com",
        full_name: "Dr. Test Professional",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockProfessional,
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockProfessional.data,
      profile: null,
      role: "professional",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);
    mockGetUserFullName.mockReturnValue("Dr. Test Professional");

    render(<DashboardPage />);

    expect(screen.getByText("Dashboard Profesional")).toBeInTheDocument();
    expect(screen.getByText("Bienvenido, Dr. Test Professional")).toBeInTheDocument();
    expect(screen.getByText("Rol: Profesional")).toBeInTheDocument();
  });

  it("should display profile information card", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(screen.getByText("Información del Perfil")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Rol:")).toBeInTheDocument();
    expect(screen.getByText("Usuario")).toBeInTheDocument();
    expect(screen.getByText("Email Verificado:")).toBeInTheDocument();
    expect(screen.getByText("Sí")).toBeInTheDocument();
    expect(screen.getByText("Nombre:")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should display user-specific action buttons", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(screen.getByText("Acciones de Usuario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Completar Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buscar Profesionales" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mis Citas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Historial de Sesiones" })).toBeInTheDocument();
  });

  it("should display professional-specific action buttons", () => {
    const mockProfessional = {
      type: UserRole.PROFESSIONAL,
      data: {
        id: "prof-123",
        email: "prof@example.com",
        full_name: "Dr. Test Professional",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockProfessional,
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockProfessional.data,
      profile: null,
      role: "professional",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);
    mockGetUserFullName.mockReturnValue("Dr. Test Professional");

    render(<DashboardPage />);

    expect(screen.getByText("Gestión Profesional")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Configurar Disponibilidad" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Citas Programadas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gestionar Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Estadísticas" })).toBeInTheDocument();
  });

  it("should display additional feature cards", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Soporte")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Notificaciones" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Configurar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contactar Soporte" })).toBeInTheDocument();
  });

  it("should display user-specific notification text", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(screen.getByText("Revisa tus notificaciones y recordatorios")).toBeInTheDocument();
  });

  it("should display professional-specific notification text", () => {
    const mockProfessional = {
      type: UserRole.PROFESSIONAL,
      data: {
        id: "prof-123",
        email: "prof@example.com",
        full_name: "Dr. Test Professional",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockProfessional,
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockProfessional.data,
      profile: null,
      role: "professional",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);
    mockGetUserFullName.mockReturnValue("Dr. Test Professional");

    render(<DashboardPage />);

    expect(
      screen.getByText("Gestiona las notificaciones de tus citas y pacientes"),
    ).toBeInTheDocument();
  });

  it("should display user-specific configuration text", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(screen.getByText("Personaliza tu experiencia de usuario")).toBeInTheDocument();
  });

  it("should display professional-specific configuration text", () => {
    const mockProfessional = {
      type: UserRole.PROFESSIONAL,
      data: {
        id: "prof-123",
        email: "prof@example.com",
        full_name: "Dr. Test Professional",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockProfessional,
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockProfessional.data,
      profile: null,
      role: "professional",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);
    mockGetUserFullName.mockReturnValue("Dr. Test Professional");

    render(<DashboardPage />);

    expect(screen.getByText("Configura tu perfil profesional y preferencias")).toBeInTheDocument();
  });

  it("should display support card with correct text", () => {
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
    
    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: null,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    
    mockIsUserVerified.mockReturnValue(true);

    render(<DashboardPage />);

    expect(
      screen.getByText("¿Necesitas ayuda? Contacta con nuestro equipo de soporte"),
    ).toBeInTheDocument();
  });
});
