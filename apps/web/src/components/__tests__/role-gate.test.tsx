import React from "react";
import { render, screen } from "@testing-library/react";
import { RoleGate } from "../role-gate";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserRole } from "@/lib/types";

// Mock the useRole hook
vi.mock("@/hooks/useRole", () => ({
  useRole: vi.fn(),
}));

import { useRole } from "@/hooks/useRole";
const mockUseRole = vi.mocked(useRole);

describe("RoleGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user has required role", () => {
    mockUseRole.mockReturnValue({
      userProfile: { id: "1", role: UserRole.ADMIN },
      loading: false,
      error: null,
      hasRole: vi.fn(),
      hasAnyRole: vi.fn((roles: UserRole[]) => roles.includes(UserRole.ADMIN)),
      isAdmin: vi.fn(() => true),
      isProfessional: vi.fn(() => false),
      isUser: vi.fn(() => false),
      getUserRole: vi.fn(() => "admin"),
    });

    render(
      <RoleGate roles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </RoleGate>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("should render fallback when user does not have required role", () => {
    mockUseRole.mockReturnValue({
      userProfile: { id: "1", role: UserRole.USER },
      loading: false,
      error: null,
      hasRole: vi.fn(),
      hasAnyRole: vi.fn((roles: UserRole[]) => !roles.includes(UserRole.ADMIN)),
      isAdmin: vi.fn(() => false),
      isProfessional: vi.fn(() => false),
      isUser: vi.fn(() => true),
      getUserRole: vi.fn(() => "user"),
    });

    render(
      <RoleGate roles={[UserRole.ADMIN]} fallback={<div>Access Denied</div>}>
        <div>Admin Content</div>
      </RoleGate>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("should render nothing when user does not have required role and no fallback", () => {
    mockUseRole.mockReturnValue({
      userProfile: { id: "1", role: UserRole.USER },
      loading: false,
      error: null,
      hasRole: vi.fn(),
      hasAnyRole: vi.fn((roles: UserRole[]) => !roles.includes(UserRole.ADMIN)),
      isAdmin: vi.fn(() => false),
      isProfessional: vi.fn(() => false),
      isUser: vi.fn(() => true),
      getUserRole: vi.fn(() => "user"),
    });

    const { container } = render(
      <RoleGate roles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </RoleGate>,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render children when user has any of the required roles", () => {
    mockUseRole.mockReturnValue({
      userProfile: { id: "1", role: UserRole.PROFESSIONAL },
      loading: false,
      error: null,
      hasRole: vi.fn(),
      hasAnyRole: vi.fn((roles: UserRole[]) =>
        roles.some((role) => [UserRole.ADMIN, UserRole.PROFESSIONAL].includes(role)),
      ),
      isAdmin: vi.fn(() => false),
      isProfessional: vi.fn(() => true),
      isUser: vi.fn(() => false),
      getUserRole: vi.fn(() => "professional"),
    });

    render(
      <RoleGate roles={[UserRole.ADMIN, UserRole.PROFESSIONAL]}>
        <div>Professional Content</div>
      </RoleGate>,
    );

    expect(screen.getByText("Professional Content")).toBeInTheDocument();
  });

  it("should render fallback when user is not authenticated", () => {
    mockUseRole.mockReturnValue({
      userProfile: null,
      loading: false,
      error: null,
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(() => false), // No access when not authenticated
      isAdmin: vi.fn(() => false),
      isProfessional: vi.fn(() => false),
      isUser: vi.fn(() => false),
      getUserRole: vi.fn(() => null),
    });

    render(
      <RoleGate roles={[UserRole.ADMIN]} fallback={<div>Please Login</div>}>
        <div>Admin Content</div>
      </RoleGate>,
    );

    expect(screen.getByText("Please Login")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("should render children when user has all required roles (requireAll=true)", () => {
    mockUseRole.mockReturnValue({
      userProfile: { id: "1", role: UserRole.ADMIN },
      loading: false,
      error: null,
      hasRole: vi.fn(),
      hasAnyRole: vi.fn((roles: UserRole[]) => roles.includes(UserRole.ADMIN)),
      isAdmin: vi.fn(() => true),
      isProfessional: vi.fn(() => false),
      isUser: vi.fn(() => false),
      getUserRole: vi.fn(() => "admin"),
    });

    render(
      <RoleGate roles={[UserRole.ADMIN]} requireAll={true}>
        <div>Admin Content</div>
      </RoleGate>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
