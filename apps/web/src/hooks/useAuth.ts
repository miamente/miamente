/**
 * Authentication hook for managing user state and authentication.
 */
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import {
  apiClient,
  type User,
  type Professional,
  type LoginRequest,
  type RegisterUserRequest,
  type RegisterProfessionalRequest,
} from "@/lib/api";

export interface AuthUser {
  type: "user" | "professional";
  data: User | Professional;
}

// Helper functions to access user properties
export function getUserEmail(user: AuthUser | null): string | undefined {
  if (!user) return undefined;
  return user.data.email;
}

export function getUserId(user: AuthUser | null): string | undefined {
  if (!user) return undefined;
  return user.data.id;
}

export function getUserUid(user: AuthUser | null): string | undefined {
  if (!user) return undefined;
  return user.data.id; // uid is the same as id
}

export function getUserFullName(user: AuthUser | null): string | undefined {
  if (!user) return undefined;
  return user.data.full_name;
}

export function isUserVerified(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.data.is_verified;
}

export function isEmailVerified(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.data.is_verified; // email verification is the same as user verification
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      console.log("checkAuth - token exists:", !!token);
      console.log("checkAuth - token value:", token ? token.substring(0, 20) + "..." : "null");
      if (!token) {
        console.log("checkAuth - no token, setting user to null");
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      console.log("checkAuth - calling getCurrentUser");
      const userData = await apiClient.getCurrentUser();
      console.log("checkAuth - userData received:", userData);
      setAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      // Clear invalid token
      apiClient.logout();
    }
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    console.log("useAuth useEffect - component mounted, calling checkAuth");
    checkAuth();
  }, []); // Remove checkAuth dependency to prevent infinite loop

  // Debug effect to log state changes
  useEffect(() => {
    console.log("useAuth state changed:", {
      user: authState.user
        ? {
            type: authState.user.type,
            id: authState.user.data.id,
            email: authState.user.data.email,
          }
        : null,
      isLoading: authState.isLoading,
      isAuthenticated: authState.isAuthenticated,
    });
  }, [authState.user, authState.isLoading, authState.isAuthenticated]);

  const loginUser = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await apiClient.loginUser(credentials);
        console.log("Login successful, response:", response);

        // Get user data immediately
        const userData = await apiClient.getCurrentUser();
        console.log("User data after login:", userData);

        setAuthState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
        });

        router.push("/dashboard");
      } catch (error) {
        console.error("User login failed:", error);
        throw error;
      }
    },
    [router],
  );

  const loginProfessional = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await apiClient.loginProfessional(credentials);
        console.log("Professional login successful, response:", response);

        // Get user data immediately
        const userData = await apiClient.getCurrentUser();
        console.log("Professional data after login:", userData);

        setAuthState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
        });

        router.push("/dashboard");
      } catch (error) {
        console.error("Professional login failed:", error);
        throw error;
      }
    },
    [router],
  );

  const registerUser = useCallback(
    async (userData: RegisterUserRequest) => {
      try {
        await apiClient.registerUser(userData);
        // Auto-login after registration
        await loginUser({
          email: userData.email,
          password: userData.password,
        });
      } catch (error) {
        console.error("User registration failed:", error);
        throw error;
      }
    },
    [loginUser],
  );

  const registerProfessional = useCallback(
    async (professionalData: RegisterProfessionalRequest) => {
      try {
        await apiClient.registerProfessional(professionalData);
        // Auto-login after registration
        await loginProfessional({
          email: professionalData.email,
          password: professionalData.password,
        });
      } catch (error) {
        console.error("Professional registration failed:", error);
        throw error;
      }
    },
    [loginProfessional],
  );

  const logout = useCallback(() => {
    apiClient.logout();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (authState.isAuthenticated) {
      await checkAuth();
    }
  }, [authState.isAuthenticated, checkAuth]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }, []);

  return {
    ...authState,
    loginUser,
    loginProfessional,
    registerUser,
    registerProfessional,
    logout,
    refreshUser,
    getAuthHeaders,
  };
}
