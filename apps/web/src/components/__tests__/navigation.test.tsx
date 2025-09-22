import React from "react";
import { render, screen } from "@testing-library/react";
import { Navigation } from "../header/navigation";
import { usePathname } from "next/navigation";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserRole } from "@/lib/types";

// Mock external modules
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: vi.fn(({ children, href, className }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  )),
}));

const mockUsePathname = vi.mocked(usePathname);

describe("Navigation", () => {
  const mockNavigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: () => <span data-testid="dashboard-icon">📊</span>,
      roles: [UserRole.USER, UserRole.PROFESSIONAL],
    },
    {
      href: "/profile",
      label: "Perfil",
      icon: () => <span data-testid="profile-icon">👤</span>,
      roles: [UserRole.USER, UserRole.PROFESSIONAL],
    },
    {
      href: "/admin",
      label: "Admin",
      icon: () => <span data-testid="admin-icon">⚙️</span>,
      roles: [UserRole.ADMIN],
    },
    {
      href: "/public",
      label: "Público",
      icon: () => <span data-testid="public-icon">🌐</span>,
      // No roles specified - should be visible to all
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("should render with default props", () => {
    render(<Navigation navigationItems={mockNavigationItems} />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Público")).toBeInTheDocument(); // No roles specified
  });

  it("should render all navigation items when no userRole provided", () => {
    render(<Navigation navigationItems={mockNavigationItems} />);

    expect(screen.getByText("Público")).toBeInTheDocument();
    // Items with roles should not be visible when no userRole
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Perfil")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("should filter navigation items by user role", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("should show admin items for admin user", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="admin" />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.getByTestId("admin-icon")).toBeInTheDocument();
  });

  it("should show professional items for professional user", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="professional" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("should highlight active navigation item", () => {
    mockUsePathname.mockReturnValue("/profile");
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    const profileLink = screen.getByText("Perfil").closest("a");
    expect(profileLink).toHaveClass("bg-accent", "text-accent-foreground");
  });

  it("should not highlight inactive navigation items", () => {
    mockUsePathname.mockReturnValue("/profile");
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveClass("text-muted-foreground");
    expect(dashboardLink).not.toHaveClass("bg-accent", "text-accent-foreground");
  });

  it("should render icons when provided", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();
    expect(screen.getByTestId("profile-icon")).toBeInTheDocument();
    expect(screen.getByTestId("public-icon")).toBeInTheDocument();
  });

  it("should handle navigation items without icons", () => {
    const itemsWithoutIcons = [
      {
        href: "/simple",
        label: "Simple Link",
        roles: [UserRole.USER],
      },
    ];

    render(<Navigation navigationItems={itemsWithoutIcons} userRole="user" />);

    expect(screen.getByText("Simple Link")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <Navigation
        navigationItems={mockNavigationItems}
        userRole="user"
        className="custom-nav-class"
      />,
    );

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("custom-nav-class");
  });

  it("should apply default navigation classes", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("hidden", "items-center", "space-x-1", "lg:flex");
  });

  it("should handle empty navigation items array", () => {
    render(<Navigation navigationItems={[]} userRole="user" />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav).toBeEmptyDOMElement();
  });

  it("should handle navigation items with multiple roles", () => {
    const multiRoleItems = [
      {
        href: "/multi",
        label: "Multi Role",
        icon: () => <span data-testid="multi-icon">🔀</span>,
        roles: [UserRole.USER, UserRole.ADMIN, UserRole.PROFESSIONAL],
      },
    ];

    // Test with user role
    const { unmount: unmount1 } = render(
      <Navigation navigationItems={multiRoleItems} userRole="user" />,
    );
    expect(screen.getByText("Multi Role")).toBeInTheDocument();
    unmount1();

    // Test with admin role
    const { unmount: unmount2 } = render(
      <Navigation navigationItems={multiRoleItems} userRole="admin" />,
    );
    expect(screen.getByText("Multi Role")).toBeInTheDocument();
    unmount2();

    // Test with professional role
    render(<Navigation navigationItems={multiRoleItems} userRole="professional" />);
    expect(screen.getByText("Multi Role")).toBeInTheDocument();
  });

  it("should handle different pathname values", () => {
    mockUsePathname.mockReturnValue("/admin");
    render(<Navigation navigationItems={mockNavigationItems} userRole="admin" />);

    const adminLink = screen.getByText("Admin").closest("a");
    expect(adminLink).toHaveClass("bg-accent", "text-accent-foreground");
  });

  it("should render links with correct href attributes", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    const profileLink = screen.getByText("Perfil").closest("a");

    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  it("should apply hover styles to inactive items", () => {
    mockUsePathname.mockReturnValue("/profile");
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveClass(
      "text-muted-foreground",
      "hover:text-foreground",
      "hover:bg-accent/50",
    );
  });

  it("should handle undefined userRole gracefully", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole={undefined} />);

    // Should only show items without roles
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("should handle empty string userRole", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="" />);

    // Should only show items without roles
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("should handle invalid userRole", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="invalid" />);

    // Should only show items without roles
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("should render all items when userRole matches multiple roles", () => {
    const itemsWithMultipleRoles = [
      {
        href: "/user-only",
        label: "User Only",
        roles: [UserRole.USER],
      },
      {
        href: "/admin-only",
        label: "Admin Only",
        roles: [UserRole.ADMIN],
      },
      {
        href: "/both",
        label: "Both Roles",
        roles: [UserRole.USER, UserRole.ADMIN],
      },
    ];

    // Test with user role
    const { unmount: unmount1 } = render(
      <Navigation navigationItems={itemsWithMultipleRoles} userRole="user" />,
    );
    expect(screen.getByText("User Only")).toBeInTheDocument();
    expect(screen.getByText("Both Roles")).toBeInTheDocument();
    expect(screen.queryByText("Admin Only")).not.toBeInTheDocument();
    unmount1();

    // Test with admin role
    render(<Navigation navigationItems={itemsWithMultipleRoles} userRole="admin" />);
    expect(screen.getByText("Admin Only")).toBeInTheDocument();
    expect(screen.getByText("Both Roles")).toBeInTheDocument();
    expect(screen.queryByText("User Only")).not.toBeInTheDocument();
  });

  it("should maintain proper link structure", () => {
    render(<Navigation navigationItems={mockNavigationItems} userRole="user" />);

    const links = screen.getAllByTestId("next-link");
    expect(links).toHaveLength(3); // Dashboard, Perfil, Público

    links.forEach((link) => {
      expect(link).toHaveClass("flex", "items-center", "gap-2", "rounded-md", "px-3", "py-2");
    });
  });

  it("should handle navigation items with special characters in labels", () => {
    const specialItems = [
      {
        href: "/special",
        label: "Item with & special chars!",
        roles: [UserRole.USER],
      },
    ];

    render(<Navigation navigationItems={specialItems} userRole="user" />);
    expect(screen.getByText("Item with & special chars!")).toBeInTheDocument();
  });

  it("should handle navigation items with long hrefs", () => {
    const longHrefItems = [
      {
        href: "/very/long/path/with/many/segments",
        label: "Long Path",
        roles: [UserRole.USER],
      },
    ];

    render(<Navigation navigationItems={longHrefItems} userRole="user" />);

    const link = screen.getByText("Long Path").closest("a");
    expect(link).toHaveAttribute("href", "/very/long/path/with/many/segments");
  });
});
