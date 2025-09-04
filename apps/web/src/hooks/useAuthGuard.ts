"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./useAuth";

import type { UserRole } from "@/lib/auth";

interface AuthGuardOptions {
  requiredRole?: UserRole;
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // In development mode (emulator), disable email verification requirement by default
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const defaultEmailVerification = isDevelopment ? false : true;
  
  const { requiredRole, requireEmailVerification = defaultEmailVerification, redirectTo = "/login" } = options;

  useEffect(() => {
    if (loading) return;

    // Debug logging in development
    if (isDevelopment) {
      console.log('useAuthGuard - Development mode:', {
        user: user?.email,
        emailVerified: user?.emailVerified,
        requireEmailVerification,
        profile: profile?.role
      });
    }

    // Not logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Email verification required but not verified
    if (requireEmailVerification && !user.emailVerified) {
      if (isDevelopment) {
        console.log('useAuthGuard - Redirecting to /verify (email not verified)');
      }
      router.push("/verify");
      return;
    }

    // Role-based access control
    if (requiredRole && profile?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's role
      const roleDashboard = profile?.role ? `/dashboard/${profile.role}` : "/dashboard/user";
      router.push(roleDashboard);
      return;
    }
  }, [user, profile, loading, requiredRole, requireEmailVerification, redirectTo, router, isDevelopment]);

  return {
    user,
    profile,
    loading,
    isAuthorized:
      !loading &&
      !!user &&
      (!requireEmailVerification || user?.emailVerified) &&
      (!requiredRole || profile?.role === requiredRole),
  };
}
