import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  getStoredToken,
  setAuthToken,
  clearAuthToken,
  getUserProfile,
  isAuthenticated,
} from "../auth";
import { isEmailVerified, getUserUid } from "../../hooks/useAuth";
import { UserRole } from "../types";

// Mock the API client
vi.mock("../api", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
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

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

describe("auth utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("registerWithEmail", () => {
    it("should register a user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: "user" as const,
        is_verified: false,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockUser);

      const result = await registerWithEmail({
        email: "test@example.com",
        password: "password123",
        full_name: "John Doe",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/register/user", {
        email: "test@example.com",
        password: "password123",
        full_name: "John Doe",
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle registration error", async () => {
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("Email already exists"));

      await expect(
        registerWithEmail({
          email: "test@example.com",
          password: "password123",
          full_name: "John Doe",
        }),
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("loginWithEmail", () => {
    it("should login a user successfully", async () => {
      const mockResponse = {
        user: {
          id: "user-123",
          email: "test@example.com",
          role: "user" as const,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
        access_token: "mock-token",
      };
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await loginWithEmail("test@example.com", "password123");

      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle login error", async () => {
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("Invalid credentials"));

      await expect(loginWithEmail("test@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid credentials",
      );
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.clearToken).mockResolvedValueOnce(undefined);

      await logout();

      expect(apiClient.clearToken).toHaveBeenCalled();
    });

    it("should handle logout error", async () => {
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.clearToken).mockRejectedValueOnce(new Error("Logout failed"));

      // Should not throw even if there's an error
      await expect(logout()).resolves.toBeUndefined();
    });
  });

  describe("token management", () => {
    it("should get stored token", () => {
      localStorageMock.getItem.mockReturnValue("stored-token");
      expect(getStoredToken()).toBe("stored-token");
    });

    it("should return null when no token is stored", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(getStoredToken()).toBeNull();
    });

    it("should set stored token", () => {
      setAuthToken("new-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "new-token");
    });

    it("should clear stored token", () => {
      clearAuthToken();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
    });
  });

  describe("getUserProfile", () => {
    it("should get user profile successfully", async () => {
      const mockProfile = {
        id: "user-123",
        email: "test@example.com",
        role: "user" as const,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProfile });

      const result = await getUserProfile();

      expect(apiClient.get).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(mockProfile);
    });

    it("should handle profile fetch error", async () => {
      const { apiClient } = await import("../api");
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Network error"));

      const result = await getUserProfile();

      expect(result).toBeNull();
    });
  });

  describe("isEmailVerified", () => {
    it("should return true for verified email", () => {
      const user = {
        type: "user" as UserRole,
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
        },
      };
      expect(isEmailVerified(user)).toBe(true);
    });

    it("should return false for unverified email", () => {
      const user = {
        type: "user" as UserRole,
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
          created_at: "2023-01-01T00:00:00Z",
        },
      };
      expect(isEmailVerified(user)).toBe(false);
    });

    it("should return false for user with is_verified false", () => {
      const user = {
        type: "user" as UserRole,
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
          created_at: "2023-01-01T00:00:00Z",
        },
      };
      expect(isEmailVerified(user)).toBe(false);
    });

    it("should return false for null user", () => {
      expect(isEmailVerified(null)).toBe(false);
    });
  });

  describe("getUserUid", () => {
    it("should return id from user object", () => {
      const user = {
        type: "user" as UserRole,
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
        },
      };
      expect(getUserUid(user)).toBe("user-123");
    });

    it("should return id for user with id", () => {
      const user = {
        type: "user" as UserRole,
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
        },
      };
      expect(getUserUid(user)).toBe("user-123");
    });

    it("should return undefined for null user", () => {
      expect(getUserUid(null)).toBeUndefined();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true for valid token", () => {
      // Create a mock JWT token with future expiration
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      const signature = "mock-signature";
      const token = `${header}.${payload}.${signature}`;

      localStorageMock.getItem.mockReturnValue(token);
      expect(isAuthenticated()).toBe(true);
    });

    it("should return false for expired token", () => {
      // Create a mock JWT token with past expiration
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
      const signature = "mock-signature";
      const token = `${header}.${payload}.${signature}`;

      localStorageMock.getItem.mockReturnValue(token);
      expect(isAuthenticated()).toBe(false);
    });

    it("should return false for invalid token", () => {
      localStorageMock.getItem.mockReturnValue("invalid-token");
      expect(isAuthenticated()).toBe(false);
    });

    it("should return false for no token", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);
    });
  });
});
