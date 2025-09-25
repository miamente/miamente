import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";

import { AdminAuthGuard } from "../admin-auth-guard";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/lib/types";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock hooks
const mockUseAuth = {
  user: null,
  isLoading: false,
};

const mockUseRole = {
  hasAnyRole: vi.fn(),
  userProfile: null,
  loading: false,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => mockUseAuth),
}));

vi.mock("@/hooks/useRole", () => ({
  useRole: vi.fn(() => mockUseRole),
}));

describe("AdminAuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.user = null;
    mockUseAuth.isLoading = false;
    mockUseRole.userProfile = null;
    mockUseRole.loading = false;
    mockUseRole.hasAnyRole.mockReturnValue(false);
  });

  it("should render children when user is authenticated and has admin role", () => {
    mockUseAuth.user = {
      id: "1",
      email: "admin@example.com",
      type: "admin",
    };
    mockUseRole.userProfile = {
      id: "1",
      role: UserRole.ADMIN,
    };
    mockUseRole.hasAnyRole.mockReturnValue(true);

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("should show loading spinner when auth is loading", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should show loading spinner when role is loading", () => {
    mockUseRole.loading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should redirect to admin login when no user is authenticated", async () => {
    mockUseAuth.user = null;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/login");
    });

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should redirect to admin login when user doesn't have admin role", async () => {
    mockUseAuth.user = {
      id: "1",
      email: "user@example.com",
      type: "user",
    };
    mockUseRole.userProfile = {
      id: "1",
      role: UserRole.USER,
    };
    mockUseRole.hasAnyRole.mockReturnValue(false);

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/login");
    });

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should show loading when user exists but userProfile is not loaded", () => {
    mockUseAuth.user = {
      id: "1",
      email: "admin@example.com",
      type: "admin",
    };
    mockUseRole.userProfile = null;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("should not redirect while auth is loading", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not redirect while role is loading", () => {
    mockUseRole.loading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should call hasAnyRole with correct parameters", () => {
    mockUseAuth.user = {
      id: "1",
      email: "admin@example.com",
      type: "admin",
    };
    mockUseRole.userProfile = {
      id: "1",
      role: UserRole.ADMIN,
    };

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(mockUseRole.hasAnyRole).toHaveBeenCalledWith([UserRole.ADMIN]);
  });

  it("should show loading spinner with correct styling", () => {
    mockUseAuth.isLoading = true;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toHaveClass("h-8", "w-8", "animate-spin", "rounded-full", "border-b-2", "border-red-600");
  });

  it("should handle multiple role checks correctly", () => {
    mockUseAuth.user = {
      id: "1",
      email: "admin@example.com",
      type: "admin",
    };
    mockUseRole.userProfile = {
      id: "1",
      role: UserRole.ADMIN,
    };
    mockUseRole.hasAnyRole.mockReturnValue(true);

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(mockUseRole.hasAnyRole).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("should re-evaluate when user changes", async () => {
    const { rerender } = render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    // Initially no user
    expect(mockPush).toHaveBeenCalledWith("/admin/login");

    // User becomes authenticated with admin role
    mockUseAuth.user = {
      id: "1",
      email: "admin@example.com",
      type: "admin",
    };
    mockUseRole.userProfile = {
      id: "1",
      role: UserRole.ADMIN,
    };
    mockUseRole.hasAnyRole.mockReturnValue(true);

    rerender(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  it("should handle edge case where user exists but has no profile", () => {
    mockUseAuth.user = {
      id: "1",
      email: "user@example.com",
      type: "user",
    };
    mockUseRole.userProfile = null;

    render(
      <AdminAuthGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuthGuard>
    );

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });
});
