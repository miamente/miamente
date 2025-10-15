import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AdminAuthGuard } from "../admin-auth-guard";
import { UserRole, type UserProfile } from "@/lib/types";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock hooks
const mockUseAuth = {
  account: null as any,
  isLoading: false,
  isAuthenticated: false,
};

const mockUseRole = {
  hasAnyRole: vi.fn(),
  userProfile: null as UserProfile | null,
  loading: false,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => mockUseAuth),
  useUnifiedAuth: vi.fn(() => mockUseAuth),
  getAccountRole: vi.fn((account) => account?.role_name || account?.role?.name),
}));

vi.mock("@/hooks/useRole", () => ({
  useRole: vi.fn(() => mockUseRole),
}));

describe("AdminAuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.account = null;
    mockUseAuth.isLoading = false;
    mockUseAuth.isAuthenticated = false;
    mockUseRole.userProfile = null;
    mockUseRole.loading = false;
    mockUseRole.hasAnyRole.mockReturnValue(false);
  });

  it("should render children when user is authenticated and has admin role", () => {
    mockUseAuth.account = {
      id: "1",
      email: "admin@example.com",
      full_name: "Admin User",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_name: "admin",
    };
    mockUseAuth.isAuthenticated = true;
    mockUseRole.userProfile = {
      account_id: "1",
      date_of_birth: "1990-01-01",
      emergency_contact_name: "Emergency Contact",
      emergency_phone_country_code: "+1",
      emergency_phone_number: "1234567890",
    };
    mockUseRole.hasAnyRole.mockReturnValue(true);

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("should show loading spinner when auth is loading", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should show loading spinner when role is loading", () => {
    mockUseRole.loading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should redirect to admin login when no user is authenticated", async () => {
    mockUseAuth.account = null;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/login");
    });

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should redirect to admin login when user doesn't have admin role", async () => {
    mockUseAuth.account = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "User Name",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };
    mockUseRole.userProfile = {
      account_id: "1",
      date_of_birth: "1990-01-01",
      emergency_contact_name: "Emergency Contact",
      emergency_phone_country_code: "+1",
      emergency_phone_number: "1234567890",
    };
    mockUseRole.hasAnyRole.mockReturnValue(false);

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/login");
    });

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should show loading when user exists but userProfile is not loaded", () => {
    mockUseAuth.account = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };
    mockUseRole.userProfile = null;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should not redirect while auth is loading", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not redirect while auth is loading", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(mockPush).not.toHaveBeenCalled();
  });


  it("should show loading spinner with correct styling", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toHaveClass(
      "h-8",
      "w-8",
      "animate-spin",
      "rounded-full",
      "border-b-2",
      "border-red-600",
    );
  });


  it("should re-evaluate when user changes", async () => {
    const { rerender } = render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    // Initially no user
    expect(mockPush).toHaveBeenCalledWith("/admin/login");

    // User becomes authenticated with admin role
    mockUseAuth.account = {
      id: "1",
      email: "admin@example.com",
      full_name: "Admin User",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_name: "admin",
    };
    mockUseAuth.isAuthenticated = true;
    mockUseRole.userProfile = {
      account_id: "1",
      date_of_birth: "1990-01-01",
      emergency_contact_name: "Emergency Contact",
      emergency_phone_country_code: "+1",
      emergency_phone_number: "1234567890",
    };
    mockUseRole.hasAnyRole.mockReturnValue(true);

    rerender(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  it("should handle edge case where user exists but has no profile", () => {
    mockUseAuth.account = {
      id: "1",
      email: "user@example.com",
      full_name: "User Name",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_name: "user",
    };
    mockUseAuth.isAuthenticated = true;
    mockUseRole.userProfile = null;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>,
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });
});
