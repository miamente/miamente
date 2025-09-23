import { describe, it, expect } from "vitest";
import {
  DEFAULT_HEADER_CONFIG,
  USER_NAVIGATION_ITEMS,
  ADMIN_NAVIGATION_ITEMS,
  USER_MENU_OPTIONS,
  ADMIN_MENU_OPTIONS,
  type NavigationItem,
  type UserMenuOption,
  type HeaderConfig,
  type HeaderProps,
} from "../header-types";
import { UserRole } from "../types";

describe("Header Types and Constants", () => {
  describe("DEFAULT_HEADER_CONFIG", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_HEADER_CONFIG).toEqual({
        showThemeToggle: true,
        showUserMenu: true,
        showMobileMenu: true,
        logoHref: "/",
        logoText: "Miamente",
        maxWidth: "max-w-6xl",
        hideUserMenuOnLogin: false,
      });
    });

    it("should have all required properties", () => {
      expect(DEFAULT_HEADER_CONFIG).toHaveProperty("showThemeToggle");
      expect(DEFAULT_HEADER_CONFIG).toHaveProperty("showUserMenu");
      expect(DEFAULT_HEADER_CONFIG).toHaveProperty("showMobileMenu");
      expect(DEFAULT_HEADER_CONFIG).toHaveProperty("logoHref");
      expect(DEFAULT_HEADER_CONFIG).toHaveProperty("logoText");
      expect(DEFAULT_HEADER_CONFIG).toHaveProperty("maxWidth");
    });

    it("should have correct types", () => {
      expect(typeof DEFAULT_HEADER_CONFIG.showThemeToggle).toBe("boolean");
      expect(typeof DEFAULT_HEADER_CONFIG.showUserMenu).toBe("boolean");
      expect(typeof DEFAULT_HEADER_CONFIG.showMobileMenu).toBe("boolean");
      expect(typeof DEFAULT_HEADER_CONFIG.logoHref).toBe("string");
      expect(typeof DEFAULT_HEADER_CONFIG.logoText).toBe("string");
      expect(typeof DEFAULT_HEADER_CONFIG.maxWidth).toBe("string");
    });
  });

  describe("USER_NAVIGATION_ITEMS", () => {
    it("should contain expected navigation items", () => {
      expect(USER_NAVIGATION_ITEMS).toHaveLength(2);

      expect(USER_NAVIGATION_ITEMS[0]).toEqual({
        label: "Inicio",
        href: "/",
        roles: [UserRole.USER, UserRole.PROFESSIONAL],
      });

      expect(USER_NAVIGATION_ITEMS[1]).toEqual({
        label: "Profesionales",
        href: "/professionals",
        roles: [UserRole.USER, UserRole.PROFESSIONAL],
      });
    });

    it("should have correct structure for each item", () => {
      USER_NAVIGATION_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("href");
        expect(item).toHaveProperty("roles");
        expect(typeof item.label).toBe("string");
        expect(typeof item.href).toBe("string");
        expect(Array.isArray(item.roles)).toBe(true);
      });
    });

    it("should include both USER and PROFESSIONAL roles", () => {
      USER_NAVIGATION_ITEMS.forEach((item) => {
        expect(item.roles).toContain(UserRole.USER);
        expect(item.roles).toContain(UserRole.PROFESSIONAL);
        expect(item.roles).not.toContain(UserRole.ADMIN);
      });
    });
  });

  describe("ADMIN_NAVIGATION_ITEMS", () => {
    it("should contain expected admin navigation items", () => {
      expect(ADMIN_NAVIGATION_ITEMS).toHaveLength(2);

      expect(ADMIN_NAVIGATION_ITEMS[0]).toEqual({
        label: "Profesionales",
        href: "/admin/professionals",
        roles: [UserRole.ADMIN],
      });

      expect(ADMIN_NAVIGATION_ITEMS[1]).toEqual({
        label: "Configuración",
        href: "/admin/feature-flags",
        roles: [UserRole.ADMIN],
      });
    });

    it("should have correct structure for each item", () => {
      ADMIN_NAVIGATION_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("href");
        expect(item).toHaveProperty("roles");
        expect(typeof item.label).toBe("string");
        expect(typeof item.href).toBe("string");
        expect(Array.isArray(item.roles)).toBe(true);
      });
    });

    it("should include only ADMIN role", () => {
      ADMIN_NAVIGATION_ITEMS.forEach((item) => {
        expect(item.roles).toEqual([UserRole.ADMIN]);
        expect(item.roles).not.toContain(UserRole.USER);
        expect(item.roles).not.toContain(UserRole.PROFESSIONAL);
      });
    });

    it("should have admin-specific hrefs", () => {
      ADMIN_NAVIGATION_ITEMS.forEach((item) => {
        expect(item.href).toMatch(/^\/admin\//);
      });
    });
  });

  describe("USER_MENU_OPTIONS", () => {
    it("should contain expected user menu options", () => {
      expect(USER_MENU_OPTIONS).toHaveLength(4);

      // Check first option (Dashboard)
      expect(USER_MENU_OPTIONS[0]).toEqual({
        label: "Dashboard",
        href: "/dashboard",
        roles: [UserRole.USER, UserRole.PROFESSIONAL],
      });

      // Check user profile option
      expect(USER_MENU_OPTIONS[1]).toEqual({
        label: "Mi Perfil",
        href: "/profile/user",
        roles: [UserRole.USER],
      });

      // Check professional profile option
      expect(USER_MENU_OPTIONS[2]).toEqual({
        label: "Mi Perfil",
        href: "/profile/professional",
        roles: [UserRole.PROFESSIONAL],
      });

      // Check logout option
      expect(USER_MENU_OPTIONS[3]).toEqual({
        label: "Cerrar Sesión",
        action: "logout",
        roles: [UserRole.USER, UserRole.PROFESSIONAL],
        divider: true,
      });
    });

    it("should have correct structure for each option", () => {
      USER_MENU_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty("label");
        expect(option).toHaveProperty("roles");
        expect(typeof option.label).toBe("string");
        expect(Array.isArray(option.roles)).toBe(true);

        // Should have either href or action
        expect(option.href || option.action).toBeDefined();
      });
    });

    it("should have logout option with special properties", () => {
      const logoutOption = USER_MENU_OPTIONS[3];
      expect(logoutOption.action).toBe("logout");
      expect(logoutOption.divider).toBe(true);
      expect(logoutOption.href).toBeUndefined();
    });
  });

  describe("ADMIN_MENU_OPTIONS", () => {
    it("should contain expected admin menu options", () => {
      expect(ADMIN_MENU_OPTIONS).toHaveLength(3);

      expect(ADMIN_MENU_OPTIONS[0]).toEqual({
        label: "Dashboard",
        href: "/admin",
        roles: [UserRole.ADMIN],
      });

      expect(ADMIN_MENU_OPTIONS[1]).toEqual({
        label: "Configuración",
        href: "/admin/feature-flags",
        roles: [UserRole.ADMIN],
      });

      expect(ADMIN_MENU_OPTIONS[2]).toEqual({
        label: "Cerrar Sesión",
        action: "logout",
        roles: [UserRole.ADMIN],
        divider: true,
      });
    });

    it("should have correct structure for each option", () => {
      ADMIN_MENU_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty("label");
        expect(option).toHaveProperty("roles");
        expect(typeof option.label).toBe("string");
        expect(Array.isArray(option.roles)).toBe(true);
      });
    });

    it("should include only ADMIN role", () => {
      ADMIN_MENU_OPTIONS.forEach((option) => {
        expect(option.roles).toEqual([UserRole.ADMIN]);
      });
    });

    it("should have admin-specific hrefs", () => {
      ADMIN_MENU_OPTIONS.forEach((option) => {
        if (option.href) {
          expect(option.href).toMatch(/^\/admin/);
        }
      });
    });
  });

  describe("Type Definitions", () => {
    it("should allow NavigationItem with all properties", () => {
      const item: NavigationItem = {
        label: "Test",
        href: "/test",
        icon: () => null,
        roles: [UserRole.USER],
        external: true,
      };

      expect(item.label).toBe("Test");
      expect(item.href).toBe("/test");
      expect(item.external).toBe(true);
    });

    it("should allow NavigationItem with minimal properties", () => {
      const item: NavigationItem = {
        label: "Test",
        href: "/test",
      };

      expect(item.label).toBe("Test");
      expect(item.href).toBe("/test");
    });

    it("should allow UserMenuOption with all properties", () => {
      const option: UserMenuOption = {
        label: "Test",
        href: "/test",
        action: "test",
        icon: () => null,
        roles: [UserRole.USER],
        divider: true,
      };

      expect(option.label).toBe("Test");
      expect(option.href).toBe("/test");
      expect(option.action).toBe("test");
      expect(option.divider).toBe(true);
    });

    it("should allow HeaderConfig with all properties", () => {
      const config: HeaderConfig = {
        showThemeToggle: true,
        showUserMenu: false,
        showMobileMenu: true,
        logoHref: "/custom",
        logoText: "Custom",
        maxWidth: "max-w-4xl",
      };

      expect(config.showThemeToggle).toBe(true);
      expect(config.showUserMenu).toBe(false);
      expect(config.logoText).toBe("Custom");
    });

    it("should allow HeaderProps with config", () => {
      const props: HeaderProps = {
        config: {
          showThemeToggle: false,
        },
        className: "custom-class",
      };

      expect(props.config?.showThemeToggle).toBe(false);
      expect(props.className).toBe("custom-class");
    });
  });

  describe("Role-based Filtering", () => {
    it("should allow filtering USER_NAVIGATION_ITEMS by role", () => {
      const userItems = USER_NAVIGATION_ITEMS.filter((item) => item.roles?.includes(UserRole.USER));
      const professionalItems = USER_NAVIGATION_ITEMS.filter((item) =>
        item.roles?.includes(UserRole.PROFESSIONAL),
      );

      expect(userItems).toHaveLength(2);
      expect(professionalItems).toHaveLength(2);
    });

    it("should allow filtering ADMIN_NAVIGATION_ITEMS by role", () => {
      const adminItems = ADMIN_NAVIGATION_ITEMS.filter((item) =>
        item.roles?.includes(UserRole.ADMIN),
      );

      expect(adminItems).toHaveLength(2);
    });

    it("should allow filtering USER_MENU_OPTIONS by role", () => {
      const userOptions = USER_MENU_OPTIONS.filter((option) =>
        option.roles?.includes(UserRole.USER),
      );
      const professionalOptions = USER_MENU_OPTIONS.filter((option) =>
        option.roles?.includes(UserRole.PROFESSIONAL),
      );

      // USER role appears in 3 options: Dashboard, Mi Perfil (user), Cerrar Sesión
      expect(userOptions).toHaveLength(3);
      // PROFESSIONAL role appears in 3 options: Dashboard, Mi Perfil (professional), Cerrar Sesión
      expect(professionalOptions).toHaveLength(3);
    });
  });
});
