"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCheck, Stethoscope, Settings, BarChart3, Shield, LogOut } from "lucide-react";

import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "Usuarios",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Profesionales",
    href: "/admin/professionals",
    icon: UserCheck,
  },
  {
    name: "Especialidades",
    href: "/admin/specialties",
    icon: Stethoscope,
  },
  {
    name: "Modalidades",
    href: "/admin/modalities",
    icon: Settings,
  },
  {
    name: "Enfoques",
    href: "/admin/approaches",
    icon: Stethoscope,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout: authLogout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      await authLogout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Don't apply AdminAuthGuard for login route
  const isLoginRoute = pathname === "/admin/login";

  const adminContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.data?.full_name || "Administrador"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white shadow-sm dark:bg-gray-800">
            <div className="p-4">
              <ul className="space-y-2">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );

  // For login route, render children directly (login has its own layout)
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // For all other admin routes, wrap with AdminAuthGuard
  return <AdminAuthGuard>{adminContent}</AdminAuthGuard>;
}
