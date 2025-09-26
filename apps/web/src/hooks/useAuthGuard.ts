"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./useAuth";

import type { UserRole } from "@/lib/auth";

interface AuthGuardOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { requiredRole, redirectTo = "/login" } = options;

  useEffect(() => {
    if (isLoading) return;

    // Not logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Role-based access control
    if (requiredRole && user?.type !== requiredRole) {
      // Don't redirect automatically, let the component handle it
      // This prevents infinite redirect loops
      return;
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  return {
    user,
    isLoading,
    isAuthorized: !isLoading && !!user && (!requiredRole || user?.type === requiredRole),
  };
}
