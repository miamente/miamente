import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "../useAuth";
import { apiClient } from "@/lib/api";
import { UserRole } from "@/lib/types";

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();
const mockPrefetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getCurrentUser: vi.fn(),
    loginUser: vi.fn(),
    loginProfessional: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct initial state", async () => {
    const { result } = renderHook(() => useAuth());

    // Should start with correct initial values
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);

    // Wait for the initial auth check to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 },
    );
  });

  it("should handle successful authentication when token exists", async () => {
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

    localStorageMock.getItem.mockReturnValue("valid-token");
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("should handle authentication failure when no token", async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it("should handle successful user login", async () => {
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

    const mockLoginResponse = {
      access_token: "mock-token",
      token_type: "Bearer",
      user_type: "user",
      user: mockUser.data,
    };

    vi.mocked(apiClient.loginUser).mockResolvedValue(mockLoginResponse);
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginUser({ email: "test@example.com", password: "password123" });
    });

    expect(apiClient.loginUser).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle successful professional login", async () => {
    const mockProfessional = {
      type: UserRole.PROFESSIONAL,
      data: {
        id: "prof-123",
        email: "prof@example.com",
        full_name: "Test Professional",
        is_verified: true,
        is_active: true,
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        license_number: "LIC123",
        years_experience: 5,
        rate_cents: 50000,
        currency: "COP",
        bio: "Test bio",
        academic_experience: [],
        work_experience: [],
        certifications: [],
        languages: [],
        therapy_approaches_ids: [],
        specialty_ids: [],
        modalities: [],
        timezone: "America/Bogota",
      },
    };

    const mockLoginResponse = {
      access_token: "mock-token",
      token_type: "Bearer",
      user_type: "professional",
      professional: mockProfessional.data,
    };

    vi.mocked(apiClient.loginProfessional).mockResolvedValue(mockLoginResponse);
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockProfessional);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginProfessional({
        email: "prof@example.com",
        password: "password123",
      });
    });

    expect(apiClient.loginProfessional).toHaveBeenCalledWith({
      email: "prof@example.com",
      password: "password123",
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle login failure", async () => {
    vi.mocked(apiClient.loginUser).mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => useAuth());

    await expect(async () => {
      await result.current.loginUser({ email: "test@example.com", password: "wrongpassword" });
    }).rejects.toThrow("Invalid credentials");
  });

  it("should handle logout", async () => {
    vi.mocked(apiClient.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.logout();
    });

    expect(apiClient.logout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it("should refresh user data", async () => {
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

    localStorageMock.getItem.mockReturnValue("valid-token");
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Refresh user data
    await act(async () => {
      await result.current.refreshUser();
    });

    expect(apiClient.getCurrentUser).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
  });
});
