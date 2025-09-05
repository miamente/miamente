"use client";
import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { MobileMenu } from "./mobile-menu";
import { Navigation } from "./navigation";
import { UserMenu } from "./user-menu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { signOut } from "@/lib/auth";
import {
  DEFAULT_HEADER_CONFIG,
  USER_NAVIGATION_ITEMS,
  USER_MENU_OPTIONS,
  type HeaderProps,
} from "@/lib/header-types";
import { cn } from "@/lib/utils";

export function Header({ config = {}, className }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, profile, loading: authLoading } = useAuth();
  const { userProfile, loading: roleLoading } = useRole();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const finalConfig = { ...DEFAULT_HEADER_CONFIG, ...config };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUserMenuAction = async (action: string) => {
    if (action === "logout") {
      try {
        await signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  const isDark = theme === "dark";
  const isAuthenticated = !!user && !authLoading;
  const userRole = userProfile?.role;
  const userName = userProfile?.fullName || profile?.fullName;
  const userEmail = user?.email || profile?.email;

  // Show loading state
  if (!mounted || authLoading || roleLoading) {
    return (
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between px-4",
            finalConfig.maxWidth,
          )}
        >
          <Link href={finalConfig.logoHref} className="font-semibold">
            {finalConfig.logoText}
          </Link>
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
          "sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60",
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between px-4",
            finalConfig.maxWidth,
          )}
        >
          {/* Logo */}
          <Link href={finalConfig.logoHref} className="font-semibold">
            {finalConfig.logoText}
          </Link>

          {/* Desktop Navigation */}
          <Navigation
            navigationItems={USER_NAVIGATION_ITEMS}
            userRole={userRole}
            className="flex-1 justify-center"
          />

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {finalConfig.showThemeToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* User Menu */}
            {finalConfig.showUserMenu && (
              <UserMenu
                userRole={userRole}
                userName={userName}
                userEmail={userEmail}
                userMenuOptions={USER_MENU_OPTIONS}
                onUserMenuAction={handleUserMenuAction}
                isAuthenticated={isAuthenticated}
              />
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
          navigationItems={USER_NAVIGATION_ITEMS}
          userMenuOptions={USER_MENU_OPTIONS}
          onUserMenuAction={handleUserMenuAction}
          userRole={userRole}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  );
}
