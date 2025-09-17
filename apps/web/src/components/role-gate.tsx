"use client";
import React from "react";

import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/lib/types";

interface RoleGateProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles (for future multi-role support)
}

export function RoleGate({ roles, children, fallback = null, requireAll = false }: RoleGateProps) {
  const { hasAnyRole, loading } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = requireAll
    ? roles.every((role) => hasAnyRole([role])) // For future multi-role support
    : hasAnyRole(roles);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component version
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  roles: UserRole[],
  fallback?: React.ReactNode,
) {
  return function RoleGuardedComponent(props: P) {
    return (
      <RoleGate roles={roles} fallback={fallback}>
        <Component {...props} />
      </RoleGate>
    );
  };
}

// Specific role gates for convenience
export function AdminGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate roles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function ProfessionalGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate roles={[UserRole.PROFESSIONAL, UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function UserGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate roles={[UserRole.USER, UserRole.PROFESSIONAL, UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
