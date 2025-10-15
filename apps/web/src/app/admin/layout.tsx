"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Stethoscope, BarChart3, ChevronDown, UserCheck, Shield } from "lucide-react";

import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "Cuentas",
    icon: Users,
    isDropdown: true,
    subItems: [
      {
        name: "Usuarios",
        href: "/admin/accounts/users",
        icon: Users,
      },
      {
        name: "Profesionales",
        href: "/admin/accounts/professionals",
        icon: UserCheck,
      },
      {
        name: "Administradores",
        href: "/admin/accounts/other-roles",
        icon: Shield,
      },
    ],
  },
  {
    name: "Especialidades",
    href: "/admin/specialties",
    icon: Stethoscope,
  },
  {
    name: "Enfoques",
    href: "/admin/approaches",
    icon: Stethoscope,
  },
];

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = React.useState<string[]>([]);

  // Don't apply AdminAuthGuard for login route
  const isLoginRoute = pathname === "/admin/login";

  // Check if any account sub-route is active
  const isAccountRouteActive = pathname.startsWith("/admin/accounts");
  
  // Auto-open accounts dropdown if on accounts route
  React.useEffect(() => {
    if (isAccountRouteActive && !openDropdowns.includes("Cuentas")) {
      setOpenDropdowns(prev => [...prev, "Cuentas"]);
    }
  }, [isAccountRouteActive, openDropdowns]);

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const adminContent = (
    <div className="fixed inset-0 top-14 bg-gray-50">
      {/* Full-width layout without max-width constraints */}
      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm">
          <div className="p-4">
            <ul className="space-y-2">
              {adminNavigation.map((item) => {
                if (item.isDropdown) {
                  const isOpen = openDropdowns.includes(item.name);
                  const hasActiveSubItem = item.subItems?.some(subItem => pathname === subItem.href);
                  
                  return (
                    <li key={item.name}>
                      <Collapsible open={isOpen} onOpenChange={() => toggleDropdown(item.name)}>
                        <CollapsibleTrigger asChild>
                          <button
                            className={cn(
                              "flex w-full items-center justify-between space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              hasActiveSubItem ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50",
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </div>
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isOpen && "rotate-180"
                              )} 
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="mt-1 space-y-1 pl-8">
                            {item.subItems?.map((subItem) => {
                              const isSubItemActive = pathname === subItem.href;
                              return (
                                <li key={subItem.name}>
                                  <Link
                                    href={subItem.href}
                                    className={cn(
                                      "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                      isSubItemActive 
                                        ? "bg-red-100 text-red-700 font-medium" 
                                        : "text-gray-600 hover:bg-gray-50",
                                    )}
                                  >
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.name}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </li>
                  );
                }

                // Regular navigation item
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href!}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50",
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
