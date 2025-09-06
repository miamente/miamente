import type { UserRole } from "@/hooks/useRole";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  external?: boolean;
}

export interface UserMenuOption {
  label: string;
  href?: string;
  action?: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  divider?: boolean;
}

export interface HeaderConfig {
  showThemeToggle?: boolean;
  showUserMenu?: boolean;
  showMobileMenu?: boolean;
  logoHref?: string;
  logoText?: string;
  maxWidth?: string;
}

export interface HeaderProps {
  config?: HeaderConfig;
  className?: string;
}

export const DEFAULT_HEADER_CONFIG: Required<HeaderConfig> = {
  showThemeToggle: true,
  showUserMenu: true,
  showMobileMenu: true,
  logoHref: "/",
  logoText: "Miamente",
  maxWidth: "max-w-6xl",
};

// Navigation items for regular users (user and pro)
export const USER_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Inicio",
    href: "/",
    roles: ["user", "pro"],
  },
  {
    label: "Profesionales",
    href: "/professionals",
    roles: ["user", "pro"],
  },
];

// Navigation items for admin users
export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Profesionales",
    href: "/admin/professionals",
    roles: ["admin"],
  },
  {
    label: "Citas",
    href: "/admin/appointments",
    roles: ["admin"],
  },
  {
    label: "Configuración",
    href: "/admin/feature-flags",
    roles: ["admin"],
  },
];

// User menu options for regular users (user and pro)
export const USER_MENU_OPTIONS: UserMenuOption[] = [
  {
    label: "Dashboard",
    href: "/dashboard/user",
    roles: ["user"],
  },
  {
    label: "Dashboard",
    href: "/dashboard/pro",
    roles: ["pro"],
  },
  {
    label: "Mi Perfil",
    href: "/profile/user",
    roles: ["user"],
  },
  {
    label: "Mi Perfil",
    href: "/profile/professional",
    roles: ["pro"],
  },
  {
    label: "Cerrar Sesión",
    action: "logout", // Special action identifier
    roles: ["user", "pro"],
    divider: true,
  },
];

// Admin menu options
export const ADMIN_MENU_OPTIONS: UserMenuOption[] = [
  {
    label: "Dashboard",
    href: "/admin",
    roles: ["admin"],
  },
  {
    label: "Configuración",
    href: "/admin/feature-flags",
    roles: ["admin"],
  },
  {
    label: "Cerrar Sesión",
    action: "logout", // Special action identifier
    roles: ["admin"],
    divider: true,
  },
];
