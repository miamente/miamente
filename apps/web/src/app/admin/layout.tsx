"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCheck, Stethoscope, Settings, BarChart3, Shield } from "lucide-react";

import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { cn } from "@/lib/utils";

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "Usuarios Regulares",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Usuarios Administrativos",
    href: "/admin/admin-users",
    icon: Shield,
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

  // Don't apply AdminAuthGuard for login route
  const isLoginRoute = pathname === "/admin/login";

  const adminContent = (
    <div className="fixed inset-0 top-14 bg-gray-50 dark:bg-gray-900">
      {/* Full-width layout without max-width constraints */}
      <div className="flex h-full">
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

        {/* Main Content - Full width */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
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
