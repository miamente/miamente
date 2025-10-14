/**
 * Authentication hook for managing user state and authentication.
 * 
 * Updated to use unified Account + Profile system.
 */
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import {
  apiClient,
  type LoginRequest,
  type RegisterUserRequest,
  type RegisterProfessionalRequest,
} from "@/lib/api";
import type { 
  AccountWithRole,
  UserProfile,
  ProfessionalProfile,
} from "@/lib/types";
import { UserRole } from "@/lib/types";

// Unified state using Account + Profile
export interface UnifiedAuthState {
  account: AccountWithRole | null;
  profile: UserProfile | ProfessionalProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Helper functions for unified Account structure
export function getAccountEmail(account: AccountWithRole | null): string | undefined {
  return account?.email;
}

export function getAccountId(account: AccountWithRole | null): string | undefined {
  return account?.id;
}

export function getAccountFullName(account: AccountWithRole | null): string | undefined {
  return account?.full_name;
}

export function getAccountRole(account: AccountWithRole | null): string | undefined {
  return account?.role_name;
}

// Legacy aliases for backward compatibility
export const getUserEmail = getAccountEmail;
export const getUserId = getAccountId;
export const getUserUid = getAccountId;
export const getUserFullName = getAccountFullName;

export function isUserVerified(): boolean {
  // Always return true - no email verification required
  return true;
}

export function isEmailVerified(): boolean {
  // Always return true - no email verification required
  return true;
}

// useAuth is now an alias for useUnifiedAuth for backward compatibility
export const useAuth = useUnifiedAuth;

/**
 * NEW: Unified authentication hook using Account + Profile system
 * 
 * This is the recommended hook for new code. It uses the unified
 * account system with separate account and profile data.
 * 
 * @returns UnifiedAuthState with account, profile, and role
 */
export function useUnifiedAuth() {
  const [authState, setAuthState] = useState<UnifiedAuthState>({
    account: null,
    profile: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAuthState({
          account: null,
          profile: null,
          role: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Get current user using new /accounts/me endpoint
      const response = await apiClient.get<{ account: AccountWithRole; role: string; profile?: UserProfile | ProfessionalProfile | null }>("/accounts/me");
      
      // Parse response from new unified format
      const { account, role: roleName, profile } = response;

      setAuthState({
        account,
        profile: profile || null,
        role: roleName as UserRole,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        account: null,
        profile: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
      });
      apiClient.logout();
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginUnified = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await apiClient.login(credentials.email, credentials.password);

        // Extract account, role, and profile from UnifiedAuthResponse
        setAuthState({
          account: response.account as unknown as AccountWithRole,
          profile: response.profile as UserProfile | ProfessionalProfile | null,
          role: response.role as UserRole,
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
        const response = await apiClient.registerUser(userData);

        // Extract from UnifiedAuthResponse
        setAuthState({
          account: response.account,
          profile: response.profile || null,
          role: response.role as UserRole,
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
        const response = await apiClient.registerProfessional(professionalData);

        // Extract from UnifiedAuthResponse
        setAuthState({
          account: response.account,
          profile: response.profile || null,
          role: response.role as UserRole,
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

  const logout = useCallback(() => {
    apiClient.logout();
    setAuthState({
      account: null,
      profile: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    loginUnified,
    registerUser,
    registerProfessional,
    logout,
    refreshUser,
  };
}
