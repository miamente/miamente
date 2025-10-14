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
  const { account, role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const { requiredRole, redirectTo = "/login" } = options;

  useEffect(() => {
    if (isLoading) return;

    // Not logged in
    if (!isAuthenticated || !account) {
      router.push(redirectTo);
      return;
    }

    // Role-based access control
    if (requiredRole && role !== requiredRole) {
      // Don't redirect automatically, let the component handle it
      // This prevents infinite redirect loops
      return;
    }
  }, [account, role, isAuthenticated, isLoading, requiredRole, redirectTo, router]);

  return {
    user: account, // For backward compatibility
    isLoading,
    isAuthorized: !isLoading && isAuthenticated && !!account && (!requiredRole || role === requiredRole),
  };
}
