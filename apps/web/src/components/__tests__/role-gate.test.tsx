import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RoleGate, AdminGate, ProfessionalGate, UserGate, withRoleGuard } from "../role-gate";
import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/lib/types";

// Mock the useRole hook
vi.mock("@/hooks/useRole");

const mockUseRole = vi.mocked(useRole);

describe("RoleGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user has required role", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <RoleGate roles={[UserRole.USER]}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("should render fallback when user doesn't have required role", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(false),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <RoleGate roles={[UserRole.ADMIN]} fallback={<div data-testid="fallback">Access Denied</div>}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>,
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should render loading spinner when loading", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn(),
      loading: true,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    const { container } = render(
      <RoleGate roles={[UserRole.USER]}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>,
    );

    // Check for loading spinner by looking for the specific classes
    const loadingSpinner = container.querySelector(".animate-spin");
    expect(loadingSpinner).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should render null fallback by default", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(false),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    const { container } = render(
      <RoleGate roles={[UserRole.ADMIN]}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should handle multiple roles correctly", () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    mockUseRole.mockReturnValue({
      hasAnyRole,
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <RoleGate roles={[UserRole.USER, UserRole.PROFESSIONAL]}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>,
    );

    expect(hasAnyRole).toHaveBeenCalledWith([UserRole.USER, UserRole.PROFESSIONAL]);
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("should handle requireAll prop correctly", () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    mockUseRole.mockReturnValue({
      hasAnyRole,
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <RoleGate roles={[UserRole.USER, UserRole.PROFESSIONAL]} requireAll={true}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>,
    );

    // When requireAll is true, it should check each role individually
    expect(hasAnyRole).toHaveBeenCalledWith([UserRole.USER]);
    expect(hasAnyRole).toHaveBeenCalledWith([UserRole.PROFESSIONAL]);
  });
});

describe("AdminGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children for admin users", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <AdminGate>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGate>,
    );

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("should render fallback for non-admin users", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(false),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <AdminGate fallback={<div data-testid="admin-fallback">Admin Access Required</div>}>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGate>,
    );

    expect(screen.getByTestId("admin-fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });
});

describe("ProfessionalGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children for professional and admin users", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <ProfessionalGate>
        <div data-testid="professional-content">Professional Content</div>
      </ProfessionalGate>,
    );

    expect(screen.getByTestId("professional-content")).toBeInTheDocument();
  });

  it("should check for professional and admin roles", () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    mockUseRole.mockReturnValue({
      hasAnyRole,
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <ProfessionalGate>
        <div data-testid="professional-content">Professional Content</div>
      </ProfessionalGate>,
    );

    expect(hasAnyRole).toHaveBeenCalledWith([UserRole.PROFESSIONAL, UserRole.ADMIN]);
  });
});

describe("UserGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children for all user types", () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <UserGate>
        <div data-testid="user-content">User Content</div>
      </UserGate>,
    );

    expect(screen.getByTestId("user-content")).toBeInTheDocument();
  });

  it("should check for all user roles", () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    mockUseRole.mockReturnValue({
      hasAnyRole,
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(
      <UserGate>
        <div data-testid="user-content">User Content</div>
      </UserGate>,
    );

    expect(hasAnyRole).toHaveBeenCalledWith([UserRole.USER, UserRole.PROFESSIONAL, UserRole.ADMIN]);
  });
});

describe("withRoleGuard HOC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should wrap component with role guard", () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div data-testid="test-component">{message}</div>
    );

    const GuardedComponent = withRoleGuard(TestComponent, [UserRole.USER]);

    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(<GuardedComponent message="Hello World" />);

    expect(screen.getByTestId("test-component")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should render fallback when user doesn't have required role", () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div data-testid="test-component">{message}</div>
    );

    const GuardedComponent = withRoleGuard(
      TestComponent,
      [UserRole.ADMIN],
      <div data-testid="fallback">Access Denied</div>,
    );

    mockUseRole.mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(false),
      loading: false,
      userProfile: null,
      error: null,
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isProfessional: vi.fn(),
      isUser: vi.fn(),
      getUserRole: vi.fn(),
    });

    render(<GuardedComponent message="Hello World" />);

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("test-component")).not.toBeInTheDocument();
  });
});
