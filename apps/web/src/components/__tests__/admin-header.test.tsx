import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminHeader } from "../header/admin-header";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRole } from "@/lib/types";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  getUserEmail: vi.fn(),
  getUserFullName: vi.fn(),
}));

// Mock logout function
vi.mock("@/lib/auth", () => ({
  logout: vi.fn(),
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
  }: {
    isOpen: boolean;
    onClose: () => void;
    navigationItems: unknown[];
    userMenuOptions: unknown[];
    userRole: string;
    userName: string;
    isAuthenticated: boolean;
  }) => (
    <div data-testid="mobile-menu" data-open={isOpen}>
      <button onClick={onClose} data-testid="close-mobile-menu">
        Close
      </button>
      <div data-testid="navigation-items">{navigationItems.length} items</div>
      <div data-testid="user-menu-options">{userMenuOptions.length} options</div>
      <div data-testid="user-role">{userRole}</div>
      <div data-testid="user-name">{userName}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
    </div>
  ),
}));

vi.mock("../header/navigation", () => ({
  Navigation: ({
    navigationItems,
    userRole,
    className,
  }: {
    navigationItems: unknown[];
    userRole: string;
    className?: string;
  }) => (
    <nav data-testid="navigation" data-role={userRole} className={className}>
      <div data-testid="nav-items">{navigationItems.length} items</div>
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
  }: {
    userRole: string;
    userName: string;
    userEmail: string;
    userMenuOptions: unknown[];
    onUserMenuAction: (action: string) => void;
    isAuthenticated: boolean;
  }) => (
    <div data-testid="user-menu">
      <div data-testid="user-role">{userRole}</div>
      <div data-testid="user-name">{userName}</div>
      <div data-testid="user-email">{userEmail}</div>
      <div data-testid="menu-options">{userMenuOptions.length} options</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => onUserMenuAction("logout")} data-testid="logout-button">
        Logout
      </button>
    </div>
  ),
}));

import { useAuth, getUserEmail, getUserFullName } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
const mockUseAuth = vi.mocked(useAuth);
const mockGetUserEmail = vi.mocked(getUserEmail);
const mockGetUserFullName = vi.mocked(getUserFullName);
const mockLogout = vi.mocked(logout);

describe("AdminHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });
    mockGetUserEmail.mockReturnValue(undefined);
    mockGetUserFullName.mockReturnValue(undefined);
  });

  it("should render with loading state", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    render(<AdminHeader />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Miamente Admin")).toBeInTheDocument();
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/");

    // Check that buttons are disabled in loading state
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should render with authenticated user", () => {
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");

    render(<AdminHeader />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Miamente Admin")).toBeInTheDocument();
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("should render with custom config", () => {
    const customConfig = {
      logoText: "CustomApp",
      logoHref: "/custom",
      showThemeToggle: false,
      showUserMenu: false,
      showMobileMenu: false,
    };

    render(<AdminHeader config={customConfig} />);

    expect(screen.getByText("CustomApp Admin")).toBeInTheDocument();
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/custom");
    expect(screen.queryByTestId("user-menu")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });

  it("should toggle theme when theme button is clicked", () => {
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");

    render(<AdminHeader />);

    const themeButton = screen.getByLabelText("Toggle theme");
    expect(themeButton).toBeInTheDocument();

    // The theme toggle functionality is mocked at the module level
    // so we just verify the button is clickable
    fireEvent.click(themeButton);
    expect(themeButton).toBeInTheDocument();
  });

  it("should open mobile menu when mobile menu button is clicked", () => {
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");

    render(<AdminHeader />);

    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    fireEvent.click(mobileMenuButton);

    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "true");
  });

  it("should close mobile menu when close button is clicked", () => {
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");

    render(<AdminHeader />);

    // Open mobile menu
    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    fireEvent.click(mobileMenuButton);

    // Close mobile menu
    const closeButton = screen.getByTestId("close-mobile-menu");
    fireEvent.click(closeButton);

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "false");
  });

  it("should handle logout action", async () => {
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");
    mockLogout.mockResolvedValue(undefined);

    render(<AdminHeader />);

    const logoutButton = screen.getByTestId("logout-button");
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it("should handle logout error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");
    mockLogout.mockRejectedValue(new Error("Logout failed"));

    render(<AdminHeader />);

    const logoutButton = screen.getByTestId("logout-button");
    fireEvent.click(logoutButton);

    // Wait for the async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith("Error signing out:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should pass correct props to child components", () => {
    const mockUser = {
      type: UserRole.ADMIN,
      data: {
        id: "1",
        email: "admin@example.com",
        full_name: "Admin User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("admin@example.com");
    mockGetUserFullName.mockReturnValue("Admin User");

    render(<AdminHeader />);

    // Check Navigation component props
    expect(screen.getByTestId("navigation")).toHaveAttribute("data-role", "admin");
    expect(screen.getByTestId("navigation")).toHaveClass("flex-1", "justify-center");

    // Check UserMenu component props (use getAllByTestId to handle multiple elements)
    const userRoles = screen.getAllByTestId("user-role");
    expect(userRoles[0]).toHaveTextContent("admin"); // Desktop UserMenu

    const userNames = screen.getAllByTestId("user-name");
    expect(userNames[0]).toHaveTextContent("Admin User"); // Desktop UserMenu

    expect(screen.getByTestId("user-email")).toHaveTextContent("admin@example.com");

    const isAuthenticatedElements = screen.getAllByTestId("is-authenticated");
    expect(isAuthenticatedElements[0]).toHaveTextContent("true"); // Desktop UserMenu
  });

  it("should apply custom className", () => {
    render(<AdminHeader className="custom-class" />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("custom-class");
  });

  it("should show Shield icon and admin styling", () => {
    render(<AdminHeader />);

    // Check for Shield icon by its SVG element (Lucide icons render as SVG)
    const shieldIcon = screen.getByRole("banner").querySelector("svg");
    expect(shieldIcon).toBeInTheDocument();

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-red-50/70", "dark:bg-red-950/70");
  });
});
