"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth, getUserEmail, isEmailVerified } from "./useAuth";

import type { UserRole } from "@/lib/auth";

interface AuthGuardOptions {
  requiredRole?: UserRole;
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // In development mode (emulator), disable email verification requirement by default
  const isDevelopment = typeof window !== "undefined" && window.location.hostname === "localhost";
  const defaultEmailVerification = isDevelopment ? false : true;

  const {
    requiredRole,
    requireEmailVerification = defaultEmailVerification,
    redirectTo = "/login",
  } = options;

  useEffect(() => {
    if (isLoading) return;

    // Debug logging in development
    if (isDevelopment) {
      console.log("useAuthGuard - Development mode:", {
        user: getUserEmail(user),
        emailVerified: isEmailVerified(user),
        requireEmailVerification,
        userType: user?.type,
      });
    }

    // Not logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Email verification required but not verified
    if (requireEmailVerification && !isEmailVerified(user)) {
      if (isDevelopment) {
        console.log("useAuthGuard - Redirecting to /verify (email not verified)");
      }
      router.push("/verify");
      return;
    }

    // Role-based access control
    if (requiredRole && user?.type !== requiredRole) {
      // Don't redirect automatically, let the component handle it
      // This prevents infinite redirect loops
      return;
    }
  }, [user, isLoading, requiredRole, requireEmailVerification, redirectTo, router, isDevelopment]);

  return {
    user,
    isLoading,
    isAuthorized:
      !isLoading &&
      !!user &&
      (!requireEmailVerification || isEmailVerified(user)) &&
      (!requiredRole || user?.type === requiredRole),
  };
}
