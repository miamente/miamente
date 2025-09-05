"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/lib/header-types";
import { cn } from "@/lib/utils";

interface NavigationProps {
  navigationItems: NavigationItem[];
  userRole?: string;
  className?: string;
}

export function Navigation({ navigationItems, userRole, className }: NavigationProps) {
  const pathname = usePathname();

  const filteredItems = navigationItems.filter(
    (item) =>
      !item.roles || (userRole && item.roles.includes(userRole as "user" | "pro" | "admin")),
  );

  return (
    <nav className={cn("hidden items-center space-x-1 lg:flex", className)}>
      {filteredItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          )}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
