/**
 * Authentication hook for managing user state and authentication.
 */
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import {
  apiClient,
  type LoginRequest,
  type RegisterUserRequest,
  type RegisterProfessionalRequest,
} from "@/lib/api";
import type { AuthUser } from "@/lib/types";

// Re-export AuthUser from types for backward compatibility
export type { AuthUser };

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
  return user.data.is_verified ?? false;
}

export function isEmailVerified(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.data.is_verified ?? false; // email verification is the same as user verification
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
      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      const userData = await apiClient.getCurrentUser();
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
    checkAuth();
  }, [checkAuth]);

  const loginUser = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await apiClient.loginUser(credentials);

        // Use the same checkAuth logic that works for refresh
        await new Promise((resolve) => setTimeout(resolve, 100));
        await checkAuth();

        router.push("/dashboard");
      } catch (error) {
        console.error("User login failed:", error);
        throw error;
      }
    },
    [router, checkAuth],
  );

  const loginProfessional = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await apiClient.loginProfessional(credentials);

        // Use the same checkAuth logic that works for refresh
        await new Promise((resolve) => setTimeout(resolve, 100));
        await checkAuth();

        router.push("/dashboard");
      } catch (error) {
        console.error("Professional login failed:", error);
        throw error;
      }
    },
    [router, checkAuth],
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
    await checkAuth();
  }, [checkAuth]);

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
