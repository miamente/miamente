import { describe, it, expect } from "vitest";
import { hasRole, type Role } from "../rbac";

describe("RBAC Functions", () => {
  describe("hasRole", () => {
    it("should return true when user has the required role", () => {
      const roles: readonly Role[] = ["user", "professional"];
      expect(hasRole(roles, "user")).toBe(true);
      expect(hasRole(roles, "professional")).toBe(true);
    });

    it("should return false when user doesn't have the required role", () => {
      const roles: readonly Role[] = ["user"];
      expect(hasRole(roles, "admin")).toBe(false);
      expect(hasRole(roles, "professional")).toBe(false);
    });

    it("should return true when user has any of the required roles (array)", () => {
      const roles: readonly Role[] = ["user", "professional"];
      expect(hasRole(roles, ["admin", "user"])).toBe(true);
      expect(hasRole(roles, ["admin", "professional"])).toBe(true);
      expect(hasRole(roles, ["user", "professional"])).toBe(true);
    });

    it("should return false when user doesn't have any of the required roles (array)", () => {
      const roles: readonly Role[] = ["user"];
      expect(hasRole(roles, ["admin", "professional"])).toBe(false);
    });

    it("should return false when roles is undefined", () => {
      expect(hasRole(undefined, "user")).toBe(false);
      expect(hasRole(undefined, ["user", "admin"])).toBe(false);
    });

    it("should return false when roles is empty array", () => {
      const roles: readonly Role[] = [];
      expect(hasRole(roles, "user")).toBe(false);
      expect(hasRole(roles, ["user", "admin"])).toBe(false);
    });

    it("should work with all role types", () => {
      const allRoles: readonly Role[] = ["user", "professional", "admin"];

      expect(hasRole(allRoles, "user")).toBe(true);
      expect(hasRole(allRoles, "professional")).toBe(true);
      expect(hasRole(allRoles, "admin")).toBe(true);
    });

    it("should work with single role arrays", () => {
      const singleRole: readonly Role[] = ["admin"];

      expect(hasRole(singleRole, "admin")).toBe(true);
      expect(hasRole(singleRole, ["admin"])).toBe(true);
      expect(hasRole(singleRole, "user")).toBe(false);
      expect(hasRole(singleRole, ["user", "professional"])).toBe(false);
    });

    it("should handle multiple required roles correctly", () => {
      const roles: readonly Role[] = ["user", "professional"];

      // User has "user" role, so should pass when "user" is in required array
      expect(hasRole(roles, ["user", "admin"])).toBe(true);

      // User doesn't have "admin" role, so should fail when only "admin" is required
      expect(hasRole(roles, ["admin"])).toBe(false);
    });

    it("should work with readonly arrays", () => {
      const readonlyRoles = ["user", "professional"] as const;

      expect(hasRole(readonlyRoles, "user")).toBe(true);
      expect(hasRole(readonlyRoles, "admin")).toBe(false);
    });

    it("should handle edge cases with role arrays", () => {
      const roles: readonly Role[] = ["user"];

      // Empty required array should return false
      expect(hasRole(roles, [])).toBe(false);

      // Single role in array
      expect(hasRole(roles, ["user"])).toBe(true);
      expect(hasRole(roles, ["admin"])).toBe(false);
    });
  });
});
