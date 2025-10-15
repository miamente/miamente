"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getAccountRole } from "@/hooks/useAuth";
import { UserRole } from "@/lib/types";

interface AdminAuthGuardProps {
  readonly children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { account, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (authLoading) return;

    // If no user, redirect to admin login
    if (!isAuthenticated || !account) {
      router.push("/admin/login");
      return;
    }

    // Check if user has admin role directly from account
    const roleName = getAccountRole(account);
    if (roleName !== "admin") {
      router.push("/admin/login");
    }
  }, [account, isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" role="status" aria-label="loading" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show loading (redirect is happening)
  if (!isAuthenticated || !account) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" role="status" aria-label="loading" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  const roleName = getAccountRole(account);
  if (roleName !== "admin") {
    // Not admin, show loading (redirect is happening)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" role="status" aria-label="loading" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role, show children
  return <>{children}</>;
}
