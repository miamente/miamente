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
import { UserRole } from "@/lib/types";

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

export function isUserVerified(): boolean {
  // Always return true - no email verification required
  return true;
}

export function isEmailVerified(): boolean {
  // Always return true - no email verification required
  return true;
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
      
      // Only update state if we don't already have a user with the same ID
      // This prevents overriding the state set by registration
      setAuthState(prevState => {
        if (prevState.user && prevState.user.data.id === userData.data.id) {
          return prevState;
        }
        return {
          user: userData,
          isLoading: false,
          isAuthenticated: true,
        };
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

  const loginUnified = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await apiClient.login(credentials.email, credentials.password);
        
        // Update auth state directly with the response data
        setAuthState({
          user: {
            type: response.user_type === "professional" ? UserRole.PROFESSIONAL : UserRole.USER,
            data: response.user_type === "professional" ? response.professional_data! : response.user_data!,
          },
          isLoading: false,
          isAuthenticated: true,
        });

        router.push("/dashboard");
      } catch (error) {
        console.error("Unified login failed:", error);
        throw error;
      }
    },
    [router],
  );

  const registerUser = useCallback(
    async (userData: RegisterUserRequest) => {
      try {
        // Registration now returns tokens and user data
        const response = await apiClient.registerUser(userData);
        
        // Update auth state directly with the response data
        // The response should have a 'user' property from the backend
        setAuthState({
          user: {
            type: UserRole.USER, // Default to user type for registration
            data: response.user!,
          },
          isLoading: false,
          isAuthenticated: true,
        });
        
        router.push("/dashboard");
      } catch (error) {
        console.error("User registration failed:", error);
        throw error;
      }
    },
    [router],
  );

  const registerProfessional = useCallback(
    async (professionalData: RegisterProfessionalRequest) => {
      try {
        // Registration now returns tokens and professional data
        const response = await apiClient.registerProfessional(professionalData);
        
        // Update auth state directly with the response data
        setAuthState({
          user: {
            type: UserRole.PROFESSIONAL,
            data: response.professional!,
          },
          isLoading: false,
          isAuthenticated: true,
        });
        
        router.push("/dashboard");
      } catch (error) {
        console.error("Professional registration failed:", error);
        throw error;
      }
    },
    [router],
  );

  const registerUnified = useCallback(
    async (registerData: { email: string; password: string }) => {
      try {
        // Registration now returns tokens and user data
        const response = await apiClient.registerUnified(registerData);
        
        // Update auth state directly with the response data
        setAuthState({
          user: {
            type: response.user_type === "user" ? UserRole.USER : UserRole.PROFESSIONAL,
            data: response.user_type === "user" ? response.user_data! : response.professional_data!,
          },
          isLoading: false,
          isAuthenticated: true,
        });
        
        router.push("/dashboard");
      } catch (error) {
        console.error("Unified registration failed:", error);
        throw error;
      }
    },
    [router],
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
    loginUnified,
    registerUser,
    registerProfessional,
    registerUnified,
    logout,
    refreshUser,
    getAuthHeaders,
  };
}
