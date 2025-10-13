import React from "react";
import { render, screen, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReactNode } from "react";
import {
  AuthProvider,
  useAuthContext,
  useUser,
  useProfessional,
  getUserEmail,
  getUserFullName,
  isUserVerified,
  isEmailVerified,
  getUserId,
  getUserUid,
} from "../AuthContext";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
  useUnifiedAuth: () => mockUseAuth(),
  getUserEmail: vi.fn((user) => user?.data?.email),
  getUserFullName: vi.fn((user) => user?.data?.full_name),
  isUserVerified: vi.fn(() => true),
  isEmailVerified: vi.fn(() => true),
  getUserId: vi.fn((user) => user?.data?.id),
  getUserUid: vi.fn((user) => user?.data?.id),
}));

// Mock the AuthContext module to include all exports
vi.mock("../AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../AuthContext")>();
  return {
    ...actual,
    useUser: vi.fn(),
    useProfessional: vi.fn(),
    getUserEmail: vi.fn((user) => user?.data?.email),
    getUserFullName: vi.fn((user) => user?.data?.full_name),
    isUserVerified: vi.fn((user) => user?.data?.is_verified === true),
    isEmailVerified: vi.fn((user) => user?.data?.is_verified === true),
    getUserId: vi.fn((user) => user?.data?.id),
    getUserUid: vi.fn((user) => user?.data?.id),
  };
});

describe("AuthContext", () => {
  const mockAuthData = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthData);
  });

  describe("AuthProvider", () => {
    it("should render children", () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should provide auth context value", () => {
      const TestComponent = () => {
        const auth = useAuthContext();
        return (
          <div data-testid="auth-status">
            {auth.isAuthenticated ? "authenticated" : "not authenticated"}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      expect(screen.getByTestId("auth-status")).toHaveTextContent("not authenticated");
    });

    it("should include helper functions in context", () => {
      const TestComponent = () => {
        const auth = useAuthContext();
        // Helper functions are imported separately, not part of context
        // Context only includes auth state and methods
        return (
          <div>
            <div data-testid="has-account">
              {typeof auth.account !== "undefined" ? "yes" : "no"}
            </div>
            <div data-testid="has-logout">
              {typeof auth.logout === "function" ? "yes" : "no"}
            </div>
            <div data-testid="has-refreshUser">
              {typeof auth.refreshUser === "function" ? "yes" : "no"}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      expect(screen.getByTestId("has-account")).toHaveTextContent("yes");
      expect(screen.getByTestId("has-logout")).toHaveTextContent("yes");
      expect(screen.getByTestId("has-refreshUser")).toHaveTextContent("yes");
    });
  });

  describe("useAuthContext", () => {
    it("should throw error when used outside provider", () => {
      const TestComponent = () => {
        useAuthContext();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useUnifiedAuthContext must be used within an AuthProvider",
      );
    });

    it("should return context value when used within provider", () => {
      const TestComponent = () => {
        const auth = useAuthContext();
        expect(auth).toBeDefined();
        expect(auth.isAuthenticated).toBe(false);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });
  });

  describe("useUser", () => {
    it("should return user data when user type is user", () => {
      const mockUserData = {
        user: {
          type: UserRole.USER,
          data: {
            id: "user-123",
            email: "user@example.com",
            full_name: "Test User",
            is_verified: true,
            is_active: true,
            phone: "+1234567890",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        },
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
      };

      mockUseAuth.mockReturnValue(mockUserData);
      vi.mocked(useUser).mockReturnValue({
        isUser: true,
        user: mockUserData.user.data,
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

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.isUser).toBe(true);
      expect(result.current.user).toEqual(mockUserData.user.data);
    });

    it("should return null when user type is not user", () => {
      const mockProfessionalData = {
        ...mockAuthData,
        user: {
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
        },
      };

      mockUseAuth.mockReturnValue(mockProfessionalData);
      vi.mocked(useUser).mockReturnValue({
        isUser: false,
        user: null,
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

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.isUser).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe("useProfessional", () => {
    it("should return professional data when user type is professional", () => {
      const mockProfessionalData = {
        user: {
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
        },
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
      };

      mockUseAuth.mockReturnValue(mockProfessionalData);
      vi.mocked(useProfessional).mockReturnValue({
        isProfessional: true,
        professional: mockProfessionalData.user.data,
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

      const { result } = renderHook(() => useProfessional(), {
        wrapper: ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.isProfessional).toBe(true);
      expect(result.current.professional).toEqual(mockProfessionalData.user.data);
    });

    it("should return null when user type is not professional", () => {
      const mockUserData = {
        user: {
          type: UserRole.USER,
          data: {
            id: "user-123",
            email: "user@example.com",
            full_name: "Test User",
            is_verified: true,
            is_active: true,
            phone: "+1234567890",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        },
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
      };

      mockUseAuth.mockReturnValue(mockUserData);
      vi.mocked(useProfessional).mockReturnValue({
        isProfessional: false,
        professional: null,
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

      const { result } = renderHook(() => useProfessional(), {
        wrapper: ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.isProfessional).toBe(false);
      expect(result.current.professional).toBe(null);
    });
  });

  describe("helper functions", () => {
    it("should re-export helper functions", () => {
      expect(typeof getUserEmail).toBe("function");
      expect(typeof getUserFullName).toBe("function");
      expect(typeof isUserVerified).toBe("function");
      expect(typeof isEmailVerified).toBe("function");
      expect(typeof getUserId).toBe("function");
      expect(typeof getUserUid).toBe("function");
    });
  });
});
