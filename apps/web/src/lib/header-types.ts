import { UserRole } from "@/lib/types";

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
    roles: [UserRole.USER, UserRole.PROFESSIONAL],
  },
  {
    label: "Profesionales",
    href: "/professionals",
    roles: [UserRole.USER, UserRole.PROFESSIONAL],
  },
];

// Navigation items for admin users
export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Profesionales",
    href: "/admin/professionals",
    roles: [UserRole.ADMIN],
  },
  {
    label: "Citas",
    href: "/admin/appointments",
    roles: [UserRole.ADMIN],
  },
  {
    label: "Configuración",
    href: "/admin/feature-flags",
    roles: [UserRole.ADMIN],
  },
];

// User menu options for regular users (user and professional)
export const USER_MENU_OPTIONS: UserMenuOption[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: [UserRole.USER, UserRole.PROFESSIONAL],
  },
  {
    label: "Mi Perfil",
    href: "/profile/user",
    roles: [UserRole.USER],
  },
  {
    label: "Mi Perfil",
    href: "/profile/professional",
    roles: [UserRole.PROFESSIONAL],
  },
  {
    label: "Cerrar Sesión",
    action: "logout", // Special action identifier
    roles: [UserRole.USER, UserRole.PROFESSIONAL],
    divider: true,
  },
];

// Admin menu options
export const ADMIN_MENU_OPTIONS: UserMenuOption[] = [
  {
    label: "Dashboard",
    href: "/admin",
    roles: [UserRole.ADMIN],
  },
  {
    label: "Configuración",
    href: "/admin/feature-flags",
    roles: [UserRole.ADMIN],
  },
  {
    label: "Cerrar Sesión",
    action: "logout", // Special action identifier
    roles: [UserRole.ADMIN],
    divider: true,
  },
];
