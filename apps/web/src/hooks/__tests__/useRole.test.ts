import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useRole } from "../useRole";
import { useAuth } from "../useAuth";
import { apiClient } from "@/lib/api";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
vi.mock("../useAuth");
vi.mock("@/lib/api");

const mockUseAuth = vi.mocked(useAuth);
const mockApiClient = vi.mocked(apiClient);

describe("useRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct initial state when no user", async () => {
    mockUseAuth.mockReturnValue({
      account: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      role: null,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.userProfile).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasRole(UserRole.USER)).toBe(false);
    expect(result.current.hasAnyRole([UserRole.USER, UserRole.PROFESSIONAL])).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isProfessional()).toBe(false);
    expect(result.current.isUser()).toBe(false);
    expect(result.current.getUserRole()).toBe(null);
  });

  it("should fetch user profile when user is authenticated", async () => {
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

    const mockApiResponse = {
      role: "user",
      account: {
        id: "user-123",
        full_name: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        is_verified: true,
      },
      profile: null,
    };

    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      isLoading: false,
      isAuthenticated: true,
      role: "user" as UserRole,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    mockApiClient.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith("/accounts/me");
    expect(result.current.userProfile).toEqual({
      id: "user-123",
      role: UserRole.USER,
      full_name: "Test User",
      email: "test@example.com",
      phone: "+1234567890",
      is_verified: true,
    });
  });

  it("should handle professional user type", async () => {
    const mockAccount = {
      id: "prof-123",
      email: "prof@example.com",
      full_name: "Test Professional",
      is_verified: true,
      is_active: true,
      phone: "+1234567890",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      role_id: "role-2",
      role_name: "professional",
    };

    const mockApiResponse = {
      role: "professional",
      account: {
        id: "prof-123",
        full_name: "Test Professional",
        email: "prof@example.com",
        phone: "+1234567890",
        is_verified: true,
      },
      profile: null,
    };

    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      isLoading: false,
      isAuthenticated: true,
      role: "professional" as UserRole,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    mockApiClient.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.userProfile?.role).toBe(UserRole.PROFESSIONAL);
    expect(result.current.isProfessional()).toBe(true);
    expect(result.current.isUser()).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
  });

  it("should handle API errors gracefully", async () => {
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
      isLoading: false,
      isAuthenticated: true,
      role: "user" as UserRole,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    mockApiClient.get.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load user profile");
    expect(result.current.userProfile).toBe(null);
  });

  it("should correctly identify user roles", async () => {
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

    const mockApiResponse = {
      role: "user",
      account: {
        id: "user-123",
        full_name: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        is_verified: true,
      },
      profile: null,
    };

    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      isLoading: false,
      isAuthenticated: true,
      role: "user" as UserRole,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    mockApiClient.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasRole(UserRole.USER)).toBe(true);
    expect(result.current.hasRole(UserRole.PROFESSIONAL)).toBe(false);
    expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
    expect(result.current.hasAnyRole([UserRole.USER, UserRole.PROFESSIONAL])).toBe(true);
    expect(result.current.hasAnyRole([UserRole.PROFESSIONAL, UserRole.ADMIN])).toBe(false);
    expect(result.current.isUser()).toBe(true);
    expect(result.current.isProfessional()).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.getUserRole()).toBe(UserRole.USER);
  });

  it("should handle loading state correctly", () => {
    mockUseAuth.mockReturnValue({
      account: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      role: null,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.loading).toBe(true);
  });

  it("should clear user profile when user becomes null", async () => {
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

    const mockApiResponse = {
      role: "user",
      account: {
        id: "user-123",
        full_name: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        is_verified: true,
      },
      profile: null,
    };

    // Start with authenticated user
    mockUseAuth.mockReturnValue({
      account: mockAccount,
      profile: null,
      isLoading: false,
      isAuthenticated: true,
      role: "user" as UserRole,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    mockApiClient.get.mockResolvedValue(mockApiResponse);

    const { result, rerender } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.userProfile).not.toBe(null);

    // Change to no user
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

    rerender();

    expect(result.current.userProfile).toBe(null);
    expect(result.current.loading).toBe(false);
  });
});
