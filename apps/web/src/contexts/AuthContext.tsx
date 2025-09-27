/**
 * Authentication context for providing auth state throughout the app.
 */
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";

import {
  useAuth,
  type AuthUser,
  getUserEmail,
  getUserFullName,
  isUserVerified,
  isEmailVerified,
  getUserId,
  getUserUid,
} from "@/hooks/useAuth";

interface AuthContextType {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly loginUser: (credentials: {
    readonly email: string;
    readonly password: string;
  }) => Promise<void>;
  readonly loginProfessional: (credentials: {
    readonly email: string;
    readonly password: string;
  }) => Promise<void>;
  readonly loginUnified: (credentials: {
    readonly email: string;
    readonly password: string;
  }) => Promise<void>;
  readonly registerUser: (userData: {
    readonly email: string;
    readonly full_name: string;
    readonly password: string;
    readonly phone?: string;
  }) => Promise<void>;
  readonly registerProfessional: (professionalData: {
    readonly email: string;
    readonly full_name: string;
    readonly password: string;
    readonly specialty: string;
    readonly rate_cents: number;
    readonly phone?: string;
  }) => Promise<void>;
  readonly registerUnified: (registerData: {
    readonly email: string;
    readonly password: string;
  }) => Promise<void>;
  readonly logout: () => void;
  readonly refreshUser: () => Promise<void>;
  readonly getUserEmail: (user: AuthUser | null) => string | undefined;
  readonly getUserFullName: (user: AuthUser | null) => string | undefined;
  readonly isUserVerified: (user: AuthUser | null) => boolean;
  readonly isEmailVerified: (user: AuthUser | null) => boolean;
  readonly getUserId: (user: AuthUser | null) => string | undefined;
  readonly getUserUid: (user: AuthUser | null) => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  const contextValue = useMemo(
    () => ({
      ...auth,
      getUserEmail,
      getUserFullName,
      isUserVerified,
      isEmailVerified,
      getUserId,
      getUserUid,
    }),
    [auth],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Re-export helper functions
export { getUserEmail, getUserFullName, isUserVerified, isEmailVerified, getUserId, getUserUid };

// Convenience hooks for specific user types
export function useUser() {
  const { user, ...rest } = useAuthContext();
  return {
    ...rest,
    user: user?.type === "user" ? user.data : null,
    isUser: user?.type === "user",
  };
}

export function useProfessional() {
  const { user, ...rest } = useAuthContext();
  return {
    ...rest,
    professional: user?.type === "professional" ? user.data : null,
    isProfessional: user?.type === "professional",
  };
}
