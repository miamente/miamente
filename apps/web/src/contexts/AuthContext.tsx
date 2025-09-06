/**
 * Authentication context for providing auth state throughout the app.
 */
"use client";

import React, { createContext, useContext, ReactNode } from "react";

import { useAuth, type AuthUser } from "@/hooks/useAuth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (credentials: { email: string; password: string }) => Promise<void>;
  loginProfessional: (credentials: { email: string; password: string }) => Promise<void>;
  registerUser: (userData: Record<string, unknown>) => Promise<void>;
  registerProfessional: (professionalData: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

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
