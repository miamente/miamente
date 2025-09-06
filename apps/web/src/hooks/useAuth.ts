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

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

  const loginUser = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await apiClient.loginUser(credentials);
        await checkAuth();
        router.push("/dashboard");
      } catch (error) {
        console.error("User login failed:", error);
        throw error;
      }
    },
    [checkAuth, router],
  );

  const loginProfessional = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await apiClient.loginProfessional(credentials);
        await checkAuth();
        router.push("/professional/dashboard");
      } catch (error) {
        console.error("Professional login failed:", error);
        throw error;
      }
    },
    [checkAuth, router],
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
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (authState.isAuthenticated) {
      await checkAuth();
    }
  }, [authState.isAuthenticated, checkAuth]);

  return {
    ...authState,
    loginUser,
    loginProfessional,
    registerUser,
    registerProfessional,
    logout,
    refreshUser,
  };
}
