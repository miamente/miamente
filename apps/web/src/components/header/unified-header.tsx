"use client";
import React, { useEffect, useState } from "react";
import { Menu, Moon, Sun, Shield } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import { MobileMenu } from "./mobile-menu";
import { Navigation } from "./navigation";
import { UserMenu } from "./user-menu";

import { Button } from "@/components/ui/button";
import { useAuth, getUserEmail, getUserFullName } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import {
  DEFAULT_HEADER_CONFIG,
  USER_NAVIGATION_ITEMS,
  USER_MENU_OPTIONS,
  ADMIN_NAVIGATION_ITEMS,
  ADMIN_MENU_OPTIONS,
  type HeaderProps,
} from "@/lib/header-types";
import { cn } from "@/lib/utils";

export function UnifiedHeader({
  config = {} as const,
  className,
  variant = "default",
}: Readonly<HeaderProps>) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const finalConfig = { ...DEFAULT_HEADER_CONFIG, ...config };

  // Determine if this is admin variant
  const isAdminVariant = variant === "admin";

  // Always call both hooks to avoid conditional hook usage
  const { user: defaultUser, isLoading: defaultAuthLoading } = useAuthContext();
  const { user: adminUser, isLoading: adminAuthLoading } = useAuth();

  // Use appropriate auth data based on variant
  const user = isAdminVariant ? adminUser : defaultUser;
  const authLoading = isAdminVariant ? adminAuthLoading : defaultAuthLoading;

  // Don't show user menu on login page if configured
  const isLoginPage = pathname === "/admin/login";
  const shouldHideUserMenu = finalConfig.hideUserMenuOnLogin && isLoginPage;

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

  // Get variant-specific configurations
  const getVariantConfig = () => {
    if (isAdminVariant) {
      return {
        backgroundClass:
          "bg-red-50/70 backdrop-blur supports-[backdrop-filter]:bg-red-50/60 dark:bg-red-950/70 dark:supports-[backdrop-filter]:bg-red-950/60",
        logoContent: (
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="font-semibold">{finalConfig.logoText} Admin</span>
          </div>
        ),
        navigationItems: ADMIN_NAVIGATION_ITEMS,
        menuOptions: ADMIN_MENU_OPTIONS,
      };
    }

    return {
      backgroundClass:
        "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60",
      logoContent: <span className="font-semibold">{finalConfig.logoText}</span>,
      navigationItems: USER_NAVIGATION_ITEMS,
      menuOptions: USER_MENU_OPTIONS,
    };
  };

  const variantConfig = getVariantConfig();

  // Show loading state
  if (!mounted || authLoading) {
    return (
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b",
          variantConfig.backgroundClass,
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between px-4",
            finalConfig.maxWidth,
          )}
        >
          <Link href={finalConfig.logoHref}>{variantConfig.logoContent}</Link>
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
          "sticky top-0 z-40 w-full border-b",
          variantConfig.backgroundClass,
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
          <Link href={finalConfig.logoHref}>{variantConfig.logoContent}</Link>

          {/* Desktop Navigation */}
          <Navigation
            navigationItems={variantConfig.navigationItems}
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

            {/* User Menu - Hidden on mobile and conditionally on login page */}
            {finalConfig.showUserMenu && !shouldHideUserMenu && (
              <div className="hidden lg:block">
                <UserMenu
                  userRole={userRole}
                  userName={userName}
                  userEmail={userEmail}
                  userMenuOptions={variantConfig.menuOptions}
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
          navigationItems={variantConfig.navigationItems}
          userMenuOptions={variantConfig.menuOptions}
          onUserMenuAction={handleUserMenuAction}
          userRole={userRole}
          userName={userName}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  );
}
