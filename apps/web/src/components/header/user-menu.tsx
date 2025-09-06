"use client";
import { ChevronDown, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { UserMenuOption } from "@/lib/header-types";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
  userMenuOptions: UserMenuOption[];
  onUserMenuAction: (action: string) => void;
  isAuthenticated: boolean;
}

export function UserMenu({
  userRole,
  userName,
  userEmail,
  userMenuOptions,
  onUserMenuAction,
  isAuthenticated,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Iniciar Sesión
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Crear Cuenta</Button>
        </Link>
      </div>
    );
  }

  const filteredUserOptions = userMenuOptions.filter(
    (option) =>
      !option.roles || (userRole && option.roles.includes(userRole as "user" | "pro" | "admin")),
  );

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "admin":
        return <Settings className="h-4 w-4" />;
      case "pro":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3"
      >
        {getRoleIcon(userRole)}
        <span className="hidden sm:inline">{userName || userEmail || "Usuario"}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-md border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="p-2">
            {/* User Info */}
            <div className="px-3 py-2 text-sm">
              <div className="font-medium">{userName || "Usuario"}</div>
            </div>

            {/* Menu Options */}
            <div className="space-y-1">
              {filteredUserOptions.map((option, index) => (
                <div key={index}>
                  {option.divider && index > 0 && <div className="border-border my-1 border-t" />}
                  {option.href ? (
                    <Link
                      href={option.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === option.href
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50",
                      )}
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
                        setIsOpen(false);
                      }}
                      className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
                    >
                      {option.icon && <option.icon className="h-4 w-4" />}
                      {option.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
