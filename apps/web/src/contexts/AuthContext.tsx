/**
 * Authentication context for providing auth state throughout the app.
 */
"use client";

import React, { createContext, useContext, ReactNode } from "react";

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
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (credentials: { email: string; password: string }) => Promise<void>;
  loginProfessional: (credentials: { email: string; password: string }) => Promise<void>;
  registerUser: (userData: {
    email: string;
    full_name: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  registerProfessional: (professionalData: {
    email: string;
    full_name: string;
    password: string;
    specialty: string;
    rate_cents: number;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getUserEmail: (user: AuthUser | null) => string | undefined;
  getUserFullName: (user: AuthUser | null) => string | undefined;
  isUserVerified: (user: AuthUser | null) => boolean;
  isEmailVerified: (user: AuthUser | null) => boolean;
  getUserId: (user: AuthUser | null) => string | undefined;
  getUserUid: (user: AuthUser | null) => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  const contextValue = {
    ...auth,
    getUserEmail,
    getUserFullName,
    isUserVerified,
    isEmailVerified,
    getUserId,
    getUserUid,
  };

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
