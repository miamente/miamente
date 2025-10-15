import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { UnifiedHeader } from "../header/unified-header";
// Removed unused imports

// Mock interfaces for components
interface MockMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: unknown[];
  userMenuOptions: unknown[];
  onUserMenuAction: (action: string) => void;
  userRole: string;
  userName: string;
  isAuthenticated: boolean;
}

interface MockNavigationProps {
  navigationItems: unknown[];
  userRole: string;
  className?: string;
}

interface MockUserMenuProps {
  userRole: string;
  userName: string;
  userEmail: string;
  userMenuOptions: unknown[];
  onUserMenuAction: (action: string) => void;
  isAuthenticated: boolean;
}

// Mock Next.js navigation
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => mockPathname),
}));

// Mock AuthContext
const mockAuthContext = {
  account: null as any,
  profile: null,
  role: null as any,
  isLoading: false,
  isAuthenticated: false,
  loginUnified: vi.fn(),
  registerUser: vi.fn(),
  registerProfessional: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(() => mockAuthContext),
  useUnifiedAuthContext: vi.fn(() => mockAuthContext),
}));

// Mock auth hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  useUnifiedAuth: vi.fn(),
  getUserEmail: vi.fn((user) => user?.email || ""),
  getUserFullName: vi.fn((user) => user?.full_name || ""),
}));

// Mock child components
vi.mock("../header/mobile-menu", () => ({
  MobileMenu: ({
    isOpen,
    onClose,
    navigationItems,
    userMenuOptions,
    userRole,
    userName,
    isAuthenticated,
  }: Omit<MockMobileMenuProps, "onUserMenuAction">) => (
    <div data-testid="mobile-menu" data-open={isOpen}>
      <button onClick={onClose}>Close Mobile Menu</button>
      <div data-testid="mobile-nav-items">{navigationItems.length} items</div>
      <div data-testid="mobile-user-menu">{userMenuOptions.length} options</div>
      <div data-testid="mobile-user-role">{userRole}</div>
      <div data-testid="mobile-user-name">{userName}</div>
      <div data-testid="mobile-authenticated">{isAuthenticated.toString()}</div>
    </div>
  ),
}));

vi.mock("../header/navigation", () => ({
  Navigation: ({ navigationItems, userRole, className }: MockNavigationProps) => (
    <nav data-testid="navigation" className={className}>
      <div data-testid="nav-items">{navigationItems.length} items</div>
      <div data-testid="nav-user-role">{userRole}</div>
    </nav>
  ),
}));

vi.mock("../header/user-menu", () => ({
  UserMenu: ({
    userRole,
    userName,
    userEmail,
    userMenuOptions,
    onUserMenuAction,
    isAuthenticated,
  }: MockUserMenuProps) => (
    <div data-testid="user-menu">
      <button>
        {userName || userEmail || "Usuario"}
      </button>
      <div data-testid="user-role">{userRole}</div>
      <div data-testid="user-name">{userName}</div>
      <div data-testid="user-email">{userEmail}</div>
      <div data-testid="user-menu-options">{userMenuOptions.length} options</div>
      <div data-testid="user-authenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => onUserMenuAction("logout")}>Logout</button>
    </div>
  ),
}));

describe("UnifiedHeader", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.account = null;
    mockAuthContext.isLoading = false;
    mockPathname = "/";
  });

  it("should render with default variant", () => {
    render(<UnifiedHeader />);

    expect(screen.getByText("Miamente")).toBeInTheDocument();
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("should render with admin variant", () => {
    render(<UnifiedHeader variant="admin" />);

    expect(screen.getByText("Miamente Admin")).toBeInTheDocument();
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("should show loading state when not mounted", () => {
    render(<UnifiedHeader />);

    // Should show the header with logo in loading state
    expect(screen.getByText("Miamente")).toBeInTheDocument();

    // Should have a button (mobile menu button)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should show loading state when auth is loading", () => {
    mockAuthContext.isLoading = true;
    render(<UnifiedHeader />);

    // Look for disabled button when auth is loading
    const buttons = screen.getAllByRole("button");
    const disabledButton = buttons.find((button) => (button as HTMLButtonElement).disabled);
    expect(disabledButton).toBeDisabled();
  });

  it("should hide user menu on admin login page when configured", () => {
    mockPathname = "/admin/login";
    render(<UnifiedHeader variant="admin" config={{ hideUserMenuOnLogin: true }} />);

    expect(screen.queryByTestId("user-menu")).not.toBeInTheDocument();
  });

  it("should show user menu on admin login page when not configured to hide", () => {
    mockPathname = "/admin/login";
    render(<UnifiedHeader variant="admin" config={{ hideUserMenuOnLogin: false }} />);

    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("should show user menu on non-login pages", () => {
    mockPathname = "/admin/dashboard";
    render(<UnifiedHeader variant="admin" config={{ hideUserMenuOnLogin: true }} />);

    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("should handle user menu logout action", async () => {
    render(<UnifiedHeader />);

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  it("should pass correct props to Navigation component", () => {
    render(<UnifiedHeader />);

    const navigation = screen.getByTestId("navigation");
    expect(navigation).toHaveClass("flex-1", "justify-center");
    expect(screen.getByTestId("nav-items")).toHaveTextContent("2 items"); // USER_NAVIGATION_ITEMS length
  });

  it("should pass correct props to Navigation component for admin variant", () => {
    render(<UnifiedHeader variant="admin" />);

    const navigation = screen.getByTestId("navigation");
    expect(navigation).toHaveClass("flex-1", "justify-center");
    expect(screen.getByTestId("nav-items")).toHaveTextContent("2 items"); // ADMIN_NAVIGATION_ITEMS length
  });

  it("should pass correct props to UserMenu component", async () => {
    const user = userEvent.setup();
    
    mockAuthContext.account = {
      id: "1",
      email: "test@example.com",
      full_name: "Test User",
      phone: "+1234567890",
      phone_country_code: "+1",
      phone_number: "234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_id: "role-1",
      role_name: "user",
    };
    mockAuthContext.role = "user";
    mockAuthContext.isAuthenticated = true;

    render(<UnifiedHeader />);

    // Click on the user menu button to open it
    const userMenuButton = screen.getByRole("button", { name: "Test User" });
    await user.click(userMenuButton);

    expect(screen.getByTestId("user-role")).toHaveTextContent("user");
    expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("user-authenticated")).toHaveTextContent("true");
  });

  it("should pass correct props to UserMenu component for admin variant", async () => {
    const user = userEvent.setup();
    
    mockAuthContext.account = {
      id: "1",
      email: "admin@example.com",
      full_name: "Admin User",
      phone: "+1234567890",
      phone_country_code: "+1",
      phone_number: "234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_id: "role-admin",
      role_name: "admin",
    };
    mockAuthContext.role = "admin";
    mockAuthContext.isAuthenticated = true;

    render(<UnifiedHeader variant="admin" />);

    // Click on the user menu button to open it
    const userMenuButton = screen.getByRole("button", { name: "Admin User" });
    await user.click(userMenuButton);

    expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
    expect(screen.getByTestId("user-name")).toHaveTextContent("Admin User");
    expect(screen.getByTestId("user-email")).toHaveTextContent("admin@example.com");
    expect(screen.getByTestId("user-authenticated")).toHaveTextContent("true");
  });

  it("should show mobile menu button", () => {
    render(<UnifiedHeader />);

    const mobileMenuButton = screen.getByRole("button", { name: "Open mobile menu" });
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveClass("lg:hidden");
  });

  it("should open mobile menu when button is clicked", async () => {
    render(<UnifiedHeader />);

    const mobileMenuButton = screen.getByRole("button", { name: "Open mobile menu" });
    await user.click(mobileMenuButton);

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "true");
  });

  it("should close mobile menu when close button is clicked", async () => {
    render(<UnifiedHeader />);

    // Open mobile menu
    const mobileMenuButton = screen.getByRole("button", { name: "Open mobile menu" });
    await user.click(mobileMenuButton);

    // Close mobile menu
    const closeButton = screen.getByText("Close Mobile Menu");
    await user.click(closeButton);

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "false");
  });

  it("should pass correct props to MobileMenu component", async () => {
    mockAuthContext.account = {
      id: "1",
      email: "test@example.com",
      full_name: "Test User",
      phone: "+1234567890",
      phone_country_code: "+1",
      phone_number: "234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_id: "role-1",
      role_name: "user",
    };
    mockAuthContext.role = "user";
    mockAuthContext.isAuthenticated = true;

    render(<UnifiedHeader />);

    const mobileMenuButton = screen.getByRole("button", { name: "Open mobile menu" });
    await user.click(mobileMenuButton);

    expect(screen.getByTestId("mobile-nav-items")).toHaveTextContent("2 items");
    expect(screen.getByTestId("mobile-user-role")).toHaveTextContent("user");
    expect(screen.getByTestId("mobile-user-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("mobile-authenticated")).toHaveTextContent("true");
  });

  it("should apply correct background class for default variant", () => {
    render(<UnifiedHeader />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "bg-white/70",
      "backdrop-blur",
      "supports-[backdrop-filter]:bg-white/60",
    );
  });

  it("should apply correct background class for admin variant", () => {
    render(<UnifiedHeader variant="admin" />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "bg-red-50/70",
      "backdrop-blur",
      "supports-[backdrop-filter]:bg-red-50/60",
    );
  });

  it("should show Shield icon for admin variant", () => {
    render(<UnifiedHeader variant="admin" />);

    // The Shield icon should be present in the logo
    expect(screen.getByText("Miamente Admin")).toBeInTheDocument();
  });

  it("should handle unauthenticated user", () => {
    mockAuthContext.account = null;
    mockAuthContext.role = null;
    mockAuthContext.isAuthenticated = false;
    render(<UnifiedHeader />);

    expect(screen.getByTestId("user-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("mobile-authenticated")).toHaveTextContent("false");
  });

  it("should handle error in logout action", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockAuthContext.logout.mockImplementation(() => {
      throw new Error("Logout failed");
    });

    render(<UnifiedHeader />);

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    expect(consoleSpy).toHaveBeenCalledWith("Error signing out:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should use custom className when provided", () => {
    render(<UnifiedHeader className="custom-class" />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("custom-class");
  });

  it("should use custom config when provided", () => {
    const customConfig = {
      logoText: "Custom Logo",
      logoHref: "/custom",
      showUserMenu: false,
      showMobileMenu: false,
    };

    render(<UnifiedHeader config={customConfig} />);

    expect(screen.getByText("Custom Logo")).toBeInTheDocument();
    expect(screen.queryByTestId("user-menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open mobile menu" })).not.toBeInTheDocument();
  });

  it("should merge default config with custom config", () => {
    const customConfig = {
      logoText: "Custom Logo",
    };

    render(<UnifiedHeader config={customConfig} />);

    expect(screen.getByText("Custom Logo")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument(); // Should still show user menu from default config
  });
});
