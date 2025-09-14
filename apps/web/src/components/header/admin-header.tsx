"use client";
import { Menu, Moon, Sun, Shield } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { MobileMenu } from "./mobile-menu";
import { Navigation } from "./navigation";
import { UserMenu } from "./user-menu";

import { Button } from "@/components/ui/button";
import { useAuth, getUserEmail, getUserFullName } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import {
  DEFAULT_HEADER_CONFIG,
  ADMIN_NAVIGATION_ITEMS,
  ADMIN_MENU_OPTIONS,
  type HeaderProps,
} from "@/lib/header-types";
import { cn } from "@/lib/utils";

export function AdminHeader({ config = {}, className }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const finalConfig = { ...DEFAULT_HEADER_CONFIG, ...config };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUserMenuAction = async (action: string) => {
    if (action === "logout") {
      try {
        await logout();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  const isDark = theme === "dark";
  const isAuthenticated = !!user && !authLoading;
  const userRole = user?.type;
  const userName = getUserFullName(user);
  const userEmail = getUserEmail(user);

  // Show loading state
  if (!mounted || authLoading) {
    return (
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-red-50/70 backdrop-blur supports-[backdrop-filter]:bg-red-50/60 dark:bg-red-950/70 dark:supports-[backdrop-filter]:bg-red-950/60",
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between px-4",
            finalConfig.maxWidth,
          )}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <Link href={finalConfig.logoHref} className="font-semibold">
              {finalConfig.logoText} Admin
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {finalConfig.showThemeToggle && (
              <Button variant="ghost" size="icon" disabled>
                <Sun className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" disabled>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-red-50/70 backdrop-blur supports-[backdrop-filter]:bg-red-50/60 dark:bg-red-950/70 dark:supports-[backdrop-filter]:bg-red-950/60",
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between px-4",
            finalConfig.maxWidth,
          )}
        >
          {/* Logo with Admin indicator */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <Link href={finalConfig.logoHref} className="font-semibold">
              {finalConfig.logoText} Admin
            </Link>
          </div>

          {/* Desktop Navigation */}
          <Navigation
            navigationItems={ADMIN_NAVIGATION_ITEMS}
            userRole={userRole}
            className="flex-1 justify-center"
          />

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Hidden on mobile */}
            {finalConfig.showThemeToggle && (
              <div className="hidden lg:block">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {/* User Menu - Hidden on mobile */}
            {finalConfig.showUserMenu && (
              <div className="hidden lg:block">
                <UserMenu
                  userRole={userRole}
                  userName={userName}
                  userEmail={userEmail}
                  userMenuOptions={ADMIN_MENU_OPTIONS}
                  onUserMenuAction={handleUserMenuAction}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            )}

            {/* Mobile Menu Button */}
            {finalConfig.showMobileMenu && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open mobile menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {finalConfig.showMobileMenu && (
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navigationItems={ADMIN_NAVIGATION_ITEMS}
          userMenuOptions={ADMIN_MENU_OPTIONS}
          onUserMenuAction={handleUserMenuAction}
          userRole={userRole}
          userName={userName}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  );
}
