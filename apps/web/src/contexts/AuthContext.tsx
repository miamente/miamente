/**
 * Authentication context for providing auth state throughout the app.
 * 
 * Supports both legacy (User/Professional) and new (Account + Profile) systems.
 */
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";

import {
  useUnifiedAuth,
  type UnifiedAuthState,
  getUserEmail,
  getUserFullName,
  isUserVerified,
  isEmailVerified,
  getUserId,
  getUserUid,
  getAccountEmail,
  getAccountId,
  getAccountFullName,
  getAccountRole,
} from "@/hooks/useAuth";
import type { UserCreate, ProfessionalCreate } from "@/lib/types";

interface AuthProviderProps {
  readonly children: ReactNode;
}

// Re-export helper functions
export { 
  getUserEmail, 
  getUserFullName, 
  isUserVerified, 
  isEmailVerified, 
  getUserId, 
  getUserUid,
  getAccountEmail,
  getAccountId,
  getAccountFullName,
  getAccountRole,
};

// ============================================================================
// Unified Auth Context (Account + Profile system)
// ============================================================================

const UnifiedAuthContext = createContext<UnifiedAuthState & {
  loginUnified: (credentials: { email: string; password: string }) => Promise<void>;
  registerUser: (userData: UserCreate) => Promise<void>;
  registerProfessional: (professionalData: ProfessionalCreate) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
} | undefined>(undefined);

export function UnifiedAuthProvider({ children }: AuthProviderProps) {
  const auth = useUnifiedAuth();

  const contextValue = useMemo(
    () => ({
      ...auth,
    }),
    [auth],
  );

  return <UnifiedAuthContext.Provider value={contextValue}>{children}</UnifiedAuthContext.Provider>;
}

/**
 * Hook to use the unified auth context (Account + Profile system)
 * 
 * @returns Unified auth state with account, profile, and role
 * 
 * @example
 * const { account, profile, role, isAuthenticated } = useUnifiedAuthContext();
 * if (role === 'user') {
 *   const userProfile = profile as UserProfile;
 *   console.log(userProfile.date_of_birth);
 * }
 */
export function useUnifiedAuthContext() {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error("useUnifiedAuthContext must be used within a UnifiedAuthProvider");
  }
  return context;
}

// ============================================================================
// Legacy hooks for backward compatibility
// ============================================================================

/**
 * @deprecated Use useUnifiedAuthContext with role checking instead
 */
export function useUser() {
  const context = useUnifiedAuthContext();
  const isUser = context.role === 'user';
  
  return {
    isUser,
    user: isUser && context.profile ? context.account : null,
    ...context,
  };
}

/**
 * @deprecated Use useUnifiedAuthContext with role checking instead
 */
export function useProfessional() {
  const context = useUnifiedAuthContext();
  const isProfessional = context.role === 'professional';
  
  return {
    isProfessional,
    professional: isProfessional && context.profile ? context.account : null,
    ...context,
  };
}

// Aliases for backward compatibility
export const AuthProvider = UnifiedAuthProvider;
export const useAuthContext = useUnifiedAuthContext;
