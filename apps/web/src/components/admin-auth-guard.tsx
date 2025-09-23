"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/lib/types";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasAnyRole, userProfile, loading: roleLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (authLoading || roleLoading) return;

    // If no user, redirect to admin login
    if (!user) {
      router.push("/admin/login");
      return;
    }

    // If user exists but userProfile is not loaded yet, wait
    if (!userProfile) {
      return;
    }

    // If user exists but doesn't have admin role, redirect to admin login
    if (!hasAnyRole([UserRole.ADMIN])) {
      router.push("/admin/login");
      return;
    }
  }, [user, userProfile, authLoading, roleLoading, hasAnyRole, router]);

  // Show loading while checking authentication
  if (authLoading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If no user, show loading (redirect is happening)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If userProfile is not loaded yet, show loading
  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If user exists but not admin, show loading (redirect is happening)
  if (!hasAnyRole([UserRole.ADMIN])) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    );
  }

  // User is authenticated and has admin role, show children
  return <>{children}</>;
}
