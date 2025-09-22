import React from "react";
import { render, screen } from "@testing-library/react";
import { HeaderWrapper } from "../header/header-wrapper";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock child components
vi.mock("../header/admin-header", () => ({
  AdminHeader: ({ config, className }: { config: unknown; className?: string }) => (
    <header data-testid="admin-header" data-config={JSON.stringify(config)} className={className}>
      Admin Header
    </header>
  ),
}));

vi.mock("../header/header", () => ({
  Header: ({ config, className }: { config: unknown; className?: string }) => (
    <header data-testid="header" data-config={JSON.stringify(config)} className={className}>
      Regular Header
    </header>
  ),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = vi.mocked(usePathname);

describe("HeaderWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render AdminHeader for admin routes", () => {
    mockUsePathname.mockReturnValue("/admin/dashboard");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByText("Admin Header")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("should render Header for non-admin routes", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Regular Header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should render AdminHeader for admin sub-routes", () => {
    mockUsePathname.mockReturnValue("/admin/users/profile");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByText("Admin Header")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("should render Header for root route", () => {
    mockUsePathname.mockReturnValue("/");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Regular Header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should render Header for nested non-admin routes", () => {
    mockUsePathname.mockReturnValue("/professionals/123");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Regular Header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should pass props to AdminHeader for admin routes", () => {
    mockUsePathname.mockReturnValue("/admin/dashboard");

    const config = { logoText: "TestApp" };
    const className = "custom-class";

    render(<HeaderWrapper config={config} className={className} />);

    const adminHeader = screen.getByTestId("admin-header");
    expect(adminHeader).toHaveAttribute("data-config", JSON.stringify(config));
    expect(adminHeader).toHaveClass("custom-class");
  });

  it("should pass props to Header for non-admin routes", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    const config = { logoText: "TestApp" };
    const className = "custom-class";

    render(<HeaderWrapper config={config} className={className} />);

    const header = screen.getByTestId("header");
    expect(header).toHaveAttribute("data-config", JSON.stringify(config));
    expect(header).toHaveClass("custom-class");
  });

  it("should handle admin route with query parameters", () => {
    mockUsePathname.mockReturnValue("/admin/users?id=123");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByText("Admin Header")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("should handle admin route with hash", () => {
    mockUsePathname.mockReturnValue("/admin/settings#general");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByText("Admin Header")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("should handle edge case with admin in path but not at start", () => {
    mockUsePathname.mockReturnValue("/users/admin-profile");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Regular Header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should handle empty pathname", () => {
    mockUsePathname.mockReturnValue("");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Regular Header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should handle pathname with only slash", () => {
    mockUsePathname.mockReturnValue("/");

    render(<HeaderWrapper />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Regular Header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should re-render when pathname changes", () => {
    const { rerender } = render(<HeaderWrapper />);

    // Initially render for non-admin route
    mockUsePathname.mockReturnValue("/dashboard");
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();

    // Change to admin route
    mockUsePathname.mockReturnValue("/admin/dashboard");
    rerender(<HeaderWrapper />);
    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();

    // Change back to non-admin route
    mockUsePathname.mockReturnValue("/profile");
    rerender(<HeaderWrapper />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();
  });

  it("should handle complex admin routes", () => {
    const adminRoutes = [
      "/admin",
      "/admin/",
      "/admin/dashboard",
      "/admin/users",
      "/admin/users/create",
      "/admin/settings/general",
      "/admin/analytics/reports/monthly",
    ];

    adminRoutes.forEach((route) => {
      mockUsePathname.mockReturnValue(route);
      const { unmount } = render(<HeaderWrapper />);

      expect(screen.getByTestId("admin-header")).toBeInTheDocument();
      expect(screen.getByText("Admin Header")).toBeInTheDocument();
      expect(screen.queryByTestId("header")).not.toBeInTheDocument();

      unmount();
    });
  });

  it("should handle complex non-admin routes", () => {
    const nonAdminRoutes = [
      "/dashboard",
      "/profile/settings",
      "/professionals/123/reviews",
      "/appointments/upcoming",
      "/settings/account",
      "/help/faq",
    ];

    nonAdminRoutes.forEach((route) => {
      mockUsePathname.mockReturnValue(route);
      const { unmount } = render(<HeaderWrapper />);

      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByText("Regular Header")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-header")).not.toBeInTheDocument();

      unmount();
    });
  });
});
