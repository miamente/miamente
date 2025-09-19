import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuthGuard } from "../useAuthGuard";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
vi.mock("../useAuth", () => ({
  useAuth: vi.fn(),
  getUserEmail: vi.fn((user) => user?.data?.email),
  isEmailVerified: vi.fn((user) => user?.data?.is_verified),
}));
vi.mock("next/navigation");

const mockUseAuth = vi.mocked(useAuth);
const mockUseRouter = vi.mocked(useRouter);

describe("useAuthGuard", () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    renderHook(() => useAuthGuard());

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should redirect to custom redirect path when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    renderHook(() => useAuthGuard({ redirectTo: "/custom-login" }));

    expect(mockPush).toHaveBeenCalledWith("/custom-login");
  });

  it("should not redirect when loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    renderHook(() => useAuthGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should redirect to verify when email verification is required but not verified", () => {
    const mockUser = {
      type: "user" as UserRole as UserRole,
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
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    renderHook(() => useAuthGuard({ requireEmailVerification: true }));

    expect(mockPush).toHaveBeenCalledWith("/verify");
  });

  it("should not redirect when email verification is required and user is verified", () => {
    const mockUser = {
      type: "user" as UserRole as UserRole,
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    renderHook(() => useAuthGuard({ requireEmailVerification: true }));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not redirect when role matches required role", () => {
    const mockUser = {
      type: "user" as UserRole as UserRole,
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard({ requiredRole: "user" as UserRole }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.isAuthorized).toBe(true);
  });

  it("should not be authorized when role does not match required role", () => {
    const mockUser = {
      type: "user" as UserRole as UserRole,
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard({ requiredRole: "admin" as UserRole }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.isAuthorized).toBe(false);
  });

  it("should return correct authorization state when user is authenticated and verified", () => {
    const mockUser = {
      type: "user" as UserRole as UserRole,
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
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(true);
  });

  it("should return false authorization when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(false);
  });

  it("should return false authorization when loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthorized).toBe(false);
  });

  it("should handle development mode email verification", () => {
    // Mock window.location.hostname to be localhost
    Object.defineProperty(window, "location", {
      value: {
        hostname: "localhost",
      },
      writable: true,
    });

    const mockUser = {
      type: "user" as UserRole as UserRole,
      data: {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        is_verified: false, // Not verified
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
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard());

    // In development mode, email verification should be disabled by default
    expect(result.current.isAuthorized).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should handle production mode email verification", () => {
    // Mock window.location.hostname to be production domain
    Object.defineProperty(window, "location", {
      value: {
        hostname: "miamente.com",
      },
      writable: true,
    });

    const mockUser = {
      type: "user" as UserRole as UserRole,
      data: {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        is_verified: false, // Not verified
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
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    renderHook(() => useAuthGuard());

    // In production mode, email verification should be required by default
    expect(mockPush).toHaveBeenCalledWith("/verify");
  });
});
