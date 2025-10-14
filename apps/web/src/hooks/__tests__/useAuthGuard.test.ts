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

    renderHook(() => useAuthGuard());

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should redirect to custom redirect path when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
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

    renderHook(() => useAuthGuard({ redirectTo: "/custom-login" }));

    expect(mockPush).toHaveBeenCalledWith("/custom-login");
  });

  it("should not redirect when loading", () => {
    mockUseAuth.mockReturnValue({
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

    renderHook(() => useAuthGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not redirect when role matches required role", () => {
    const mockAccount = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      is_verified: true,
      is_active: true,
      phone: "+1234567890",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      role_name: "user",
      role_id: "role-1",
    };

    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      role: "user" as UserRole,
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard({ requiredRole: "user" as UserRole }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.isAuthorized).toBe(true);
  });

  it("should not be authorized when role does not match required role", () => {
    const mockAccount = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      is_verified: true,
      is_active: true,
      phone: "+1234567890",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      role_name: "user",
      role_id: "role-1",
    };

    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      role: "user" as UserRole,
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard({ requiredRole: "admin" as UserRole }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.isAuthorized).toBe(false);
  });

  it("should return correct authorization state when user is authenticated and verified", () => {
    const mockAccount = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      is_verified: true,
      is_active: true,
      phone: "+1234567890",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      role_name: "user",
      role_id: "role-1",
    };

    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      role: "user" as UserRole,
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.user).toEqual(mockAccount);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(true);
  });

  it("should return false authorization when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
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

    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(false);
  });

  it("should return false authorization when loading", () => {
    mockUseAuth.mockReturnValue({
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

    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthorized).toBe(false);
  });
});
