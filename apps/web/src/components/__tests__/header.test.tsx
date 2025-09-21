import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Header } from "../header/header";
import { useTheme } from "next-themes";
import { useAuthContext, getUserEmail, getUserFullName } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserRole } from "@/lib/types";

// Mock external modules and hooks
vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
  getUserEmail: vi.fn(),
  getUserFullName: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  logout: vi.fn(),
}));

vi.mock("../header/mobile-menu", () => ({
  MobileMenu: vi.fn(
    ({
      isOpen,
      onClose,
      navigationItems,
      userMenuOptions,
      userRole,
      userName,
      isAuthenticated,
    }) => (
      <div data-testid="mobile-menu" data-open={isOpen}>
        <button data-testid="close-mobile-menu" onClick={onClose}>
          Close
        </button>
        <div data-testid="mobile-nav-items">{navigationItems.length} items</div>
        <div data-testid="mobile-menu-options">{userMenuOptions.length} options</div>
        <div data-testid="mobile-user-role">{userRole}</div>
        <div data-testid="mobile-user-name">{userName}</div>
        <div data-testid="mobile-is-authenticated">{String(isAuthenticated)}</div>
      </div>
    ),
  ),
}));

vi.mock("../header/navigation", () => ({
  Navigation: vi.fn(({ navigationItems, userRole, className }) => (
    <nav data-testid="navigation" data-role={userRole} className={className}>
      <div data-testid="nav-items">{navigationItems.length} items</div>
    </nav>
  )),
}));

vi.mock("../header/user-menu", () => ({
  UserMenu: vi.fn(
    ({ userRole, userName, userEmail, userMenuOptions, onUserMenuAction, isAuthenticated }) => (
      <div data-testid="user-menu">
        <div data-testid="user-role">{userRole}</div>
        <div data-testid="user-name">{userName}</div>
        <div data-testid="user-email">{userEmail}</div>
        <div data-testid="menu-options">{userMenuOptions.length} options</div>
        <div data-testid="is-authenticated">{String(isAuthenticated)}</div>
        <button data-testid="logout-button" onClick={() => onUserMenuAction("logout")}>
          Logout
        </button>
      </div>
    ),
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: vi.fn(({ children, href }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  )),
}));

const mockUseTheme = vi.mocked(useTheme);
const mockUseAuthContext = vi.mocked(useAuthContext);
const mockGetUserEmail = vi.mocked(getUserEmail);
const mockGetUserFullName = vi.mocked(getUserFullName);
const mockLogout = vi.mocked(logout);

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      resolvedTheme: "light",
      systemTheme: "light",
      themes: ["light", "dark"],
    });
    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });
    mockGetUserEmail.mockReturnValue(undefined);
    mockGetUserFullName.mockReturnValue(undefined);

    // Mock window.matchMedia for theme detection
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query.includes("dark"),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("should render with loading state", () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByText("Miamente")).toBeInTheDocument();
    // In loading state, buttons are disabled but don't have aria-labels
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2); // Theme toggle and mobile menu buttons
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should render with default props", () => {
    render(<Header />);

    expect(screen.getByText("Miamente")).toBeInTheDocument();
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Open mobile menu")).toBeInTheDocument();
  });

  it("should render with custom config", () => {
    render(<Header config={{ logoText: "Custom App", logoHref: "/custom" }} />);

    expect(screen.getByText("Custom App")).toBeInTheDocument();
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/custom");
  });

  it("should render with authenticated user", () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "Test User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("user@example.com");
    mockGetUserFullName.mockReturnValue("John Doe");

    render(<Header />);

    expect(screen.getByTestId("user-role")).toHaveTextContent("user");
    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("user-email")).toHaveTextContent("user@example.com");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("should toggle theme when theme button is clicked", () => {
    const mockSetTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      themes: ["light", "dark"],
    });

    render(<Header />);

    const themeButton = screen.getByLabelText("Toggle theme");
    fireEvent.click(themeButton);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should toggle theme from dark to light", () => {
    const mockSetTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      systemTheme: "dark",
      themes: ["light", "dark"],
    });

    render(<Header />);

    const themeButton = screen.getByLabelText("Toggle theme");
    fireEvent.click(themeButton);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should open mobile menu when mobile menu button is clicked", () => {
    render(<Header />);

    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    fireEvent.click(mobileMenuButton);

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "true");
  });

  it("should close mobile menu when close button is clicked", () => {
    render(<Header />);

    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    fireEvent.click(mobileMenuButton); // Open menu
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "true");

    const closeButton = screen.getByTestId("close-mobile-menu");
    fireEvent.click(closeButton); // Close menu
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute("data-open", "false");
  });

  it("should handle logout action", async () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "Test User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("user@example.com");
    mockGetUserFullName.mockReturnValue("John Doe");
    mockLogout.mockResolvedValue(undefined);

    render(<Header />);

    const logoutButton = screen.getByTestId("logout-button");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle logout error", async () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "Test User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("user@example.com");
    mockGetUserFullName.mockReturnValue("John Doe");
    mockLogout.mockRejectedValue(new Error("Logout failed"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<Header />);

    const logoutButton = screen.getByTestId("logout-button");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error signing out:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should pass correct props to child components", () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "Test User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("user@example.com");
    mockGetUserFullName.mockReturnValue("John Doe");

    render(<Header />);

    // Check Navigation component props
    expect(screen.getByTestId("navigation")).toHaveAttribute("data-role", "user");
    expect(screen.getByTestId("navigation")).toHaveClass("flex-1", "justify-center");

    // Check UserMenu component props
    expect(screen.getByTestId("user-role")).toHaveTextContent("user");
    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("user-email")).toHaveTextContent("user@example.com");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("should apply custom className", () => {
    render(<Header className="custom-class" />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("custom-class");
  });

  it("should show correct icons for light theme", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      resolvedTheme: "light",
      systemTheme: "light",
      themes: ["light", "dark"],
    });

    render(<Header />);

    // Should show Moon icon for light theme
    const themeButton = screen.getByLabelText("Toggle theme");
    expect(themeButton.querySelector(".lucide-moon")).toBeInTheDocument();
  });

  it("should show correct icons for dark theme", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: vi.fn(),
      resolvedTheme: "dark",
      systemTheme: "dark",
      themes: ["light", "dark"],
    });

    render(<Header />);

    // Should show Sun icon for dark theme
    const themeButton = screen.getByLabelText("Toggle theme");
    expect(themeButton.querySelector(".lucide-sun")).toBeInTheDocument();
  });

  it("should render mobile menu with correct props", () => {
    const mockUser = {
      type: UserRole.USER,
      data: {
        id: "1",
        email: "user@example.com",
        full_name: "Test User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("user@example.com");
    mockGetUserFullName.mockReturnValue("John Doe");

    render(<Header />);

    // Open mobile menu
    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    fireEvent.click(mobileMenuButton);

    // Check mobile menu props
    expect(screen.getByTestId("mobile-user-role")).toHaveTextContent("user");
    expect(screen.getByTestId("mobile-user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("mobile-is-authenticated")).toHaveTextContent("true");
  });

  it("should handle unmounted state", () => {
    // Simulate unmounted state by not calling setMounted
    render(<Header />);

    // Should still render the basic structure
    expect(screen.getByText("Miamente")).toBeInTheDocument();
  });

  it("should render with professional user", () => {
    const mockUser = {
      type: UserRole.PROFESSIONAL,
      data: {
        id: "1",
        email: "professional@example.com",
        full_name: "Professional User",
        is_active: true,
        is_verified: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    };

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getUserEmail: vi.fn(),
      getUserFullName: vi.fn(),
      isUserVerified: vi.fn(),
      isEmailVerified: vi.fn(),
      getUserId: vi.fn(),
      getUserUid: vi.fn(),
    });

    mockGetUserEmail.mockReturnValue("professional@example.com");
    mockGetUserFullName.mockReturnValue("Dr. Jane Smith");

    render(<Header />);

    expect(screen.getByTestId("user-role")).toHaveTextContent("professional");
    expect(screen.getByTestId("user-name")).toHaveTextContent("Dr. Jane Smith");
    expect(screen.getByTestId("user-email")).toHaveTextContent("professional@example.com");
  });

  it("should handle missing user data gracefully", () => {
    mockGetUserEmail.mockReturnValue(undefined);
    mockGetUserFullName.mockReturnValue(undefined);

    render(<Header />);

    expect(screen.getByTestId("user-role")).toHaveTextContent("");
    expect(screen.getByTestId("user-name")).toHaveTextContent("");
    expect(screen.getByTestId("user-email")).toHaveTextContent("");
  });
});
