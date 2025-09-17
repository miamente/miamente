"use client";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { NavigationItem, UserMenuOption } from "@/lib/header-types";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  userMenuOptions: UserMenuOption[];
  onUserMenuAction: (action: string) => void;
  userRole?: string;
  userName?: string;
  isAuthenticated: boolean;
}

export function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  userMenuOptions,
  onUserMenuAction,
  userRole,
  userName,
  isAuthenticated,
}: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole as UserRole)),
  );

  const filteredUserOptions = userMenuOptions.filter(
    (option) => !option.roles || (userRole && option.roles.includes(userRole as UserRole)),
  );

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold">Menú</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto">
          {/* User Info */}
          {isAuthenticated && (
            <div className="border-b p-4">
              <div className="px-3 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {userName || "Usuario"}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="border-b p-4">
            <nav className="space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="border-b p-4">
              <div className="space-y-2">
                {filteredUserOptions.map((option, index) => (
                  <div key={index}>
                    {option.divider && index > 0 && <div className="border-border my-2 border-t" />}
                    {option.href ? (
                      <Link
                        href={option.href}
                        onClick={onClose}
                        className="hover:bg-accent/50 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                      >
                        {option.icon && <option.icon className="h-4 w-4" />}
                        {option.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (option.action) {
                            onUserMenuAction(option.action);
                          }
                          onClose();
                        }}
                        className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                      >
                        {option.icon && <option.icon className="h-4 w-4" />}
                        {option.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auth Buttons for non-authenticated users */}
          {!isAuthenticated && (
            <div className="p-4">
              <div className="space-y-2">
                <Link href="/login" onClick={onClose}>
                  <Button variant="outline" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={onClose}>
                  <Button className="w-full">Crear Cuenta</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
