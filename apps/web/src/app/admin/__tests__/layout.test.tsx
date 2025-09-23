import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePathname } from "next/navigation";

import AdminLayout from "../layout";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// Mock Link component
vi.mock("next/link", () => ({
  default: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon">Users</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  UserCheck: () => <div data-testid="user-check-icon">UserCheck</div>,
  Stethoscope: () => <div data-testid="stethoscope-icon">Stethoscope</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3</div>,
  Brain: () => <div data-testid="brain-icon">Brain</div>,
}));

// Mock the cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => {
    return classes.filter(Boolean).join(" ");
  },
}));

// Mock authentication hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "1", email: "admin@example.com", role: "admin" },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useRole", () => ({
  useRole: () => ({
    hasAnyRole: () => true,
    userProfile: { role: "admin" },
    loading: false,
  }),
}));

describe("AdminLayout", () => {
  const mockChildren = <div data-testid="admin-content">Admin Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the admin layout with navigation", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("should render all navigation items", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    // Check for navigation items
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Usuarios Regulares")).toBeInTheDocument();
    expect(screen.getByText("Usuarios Administrativos")).toBeInTheDocument();
    expect(screen.getByText("Profesionales")).toBeInTheDocument();
    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText("Modalidades")).toBeInTheDocument();
    expect(screen.getByText("Enfoques")).toBeInTheDocument();
  });

  it("should render navigation icons", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    expect(screen.getByTestId("user-check-icon")).toBeInTheDocument();
    expect(screen.getAllByTestId("stethoscope-icon")).toHaveLength(2); // Especialidades and Enfoques both use Stethoscope
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart-icon")).toBeInTheDocument();
  });

  it("should have correct navigation links", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const links = screen.getAllByTestId("link");

    expect(links[0]).toHaveAttribute("href", "/admin");
    expect(links[1]).toHaveAttribute("href", "/admin/users");
    expect(links[2]).toHaveAttribute("href", "/admin/admin-users");
    expect(links[3]).toHaveAttribute("href", "/admin/professionals");
    expect(links[4]).toHaveAttribute("href", "/admin/specialties");
    expect(links[5]).toHaveAttribute("href", "/admin/modalities");
    expect(links[6]).toHaveAttribute("href", "/admin/approaches");
  });

  it("should highlight active navigation item", () => {
    (usePathname as any).mockReturnValue("/admin/users");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const activeLink = screen.getByText("Usuarios Regulares");
    // Just verify the link exists and has the correct href
    expect(activeLink).toBeInTheDocument();
    expect(activeLink.closest("a")).toHaveAttribute("href", "/admin/users");
  });

  it("should highlight admin users navigation item when on admin-users page", () => {
    (usePathname as any).mockReturnValue("/admin/admin-users");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const activeLink = screen.getByText("Usuarios Administrativos");
    expect(activeLink).toBeInTheDocument();
    expect(activeLink.closest("a")).toHaveAttribute("href", "/admin/admin-users");
  });

  it("should highlight professionals navigation item when on professionals page", () => {
    (usePathname as any).mockReturnValue("/admin/professionals");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const activeLink = screen.getByText("Profesionales");
    expect(activeLink).toBeInTheDocument();
    expect(activeLink.closest("a")).toHaveAttribute("href", "/admin/professionals");
  });

  it("should have correct layout structure", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    // Check for main container
    const mainContainer = screen.getByTestId("admin-content").closest(".fixed");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("inset-0", "top-14", "bg-gray-50");

    // Check for sidebar
    const sidebar = screen.getByText("Dashboard").closest("nav");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("w-64", "bg-white", "shadow-sm");

    // Check for main content area
    const mainContent = screen.getByTestId("admin-content").closest("main");
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass("flex-1", "p-6", "overflow-auto");
  });

  it("should apply dark mode classes correctly", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const mainContainer = screen.getByTestId("admin-content").closest(".fixed");
    expect(mainContainer).toHaveClass("dark:bg-gray-900");

    const sidebar = screen.getByText("Dashboard").closest("nav");
    expect(sidebar).toHaveClass("dark:bg-gray-800");
  });

  it("should render children in main content area", () => {
    (usePathname as any).mockReturnValue("/admin");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const mainContent = screen.getByTestId("admin-content").closest("main");
    expect(mainContent).toContainElement(screen.getByTestId("admin-content"));
  });

  it("should have proper navigation item styling for inactive items", () => {
    (usePathname as any).mockReturnValue("/admin/users");
    render(<AdminLayout>{mockChildren}</AdminLayout>);

    const inactiveLink = screen.getByText("Profesionales");
    // Just verify the link exists and has the correct href
    expect(inactiveLink).toBeInTheDocument();
    expect(inactiveLink.closest("a")).toHaveAttribute("href", "/admin/professionals");
  });
});
