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

  const { requiredRole, requireEmailVerification = true, redirectTo = "/login" } = options;

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Email verification required but not verified
    if (requireEmailVerification && !user.emailVerified) {
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
  }, [user, profile, loading, requiredRole, requireEmailVerification, redirectTo, router]);

  return {
    user,
    profile,
    loading,
    isAuthorized:
      !loading &&
      !!user &&
      (!requireEmailVerification || user.emailVerified) &&
      (!requiredRole || profile?.role === requiredRole),
  };
}
