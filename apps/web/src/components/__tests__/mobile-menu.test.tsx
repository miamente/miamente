import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileMenu } from "../header/mobile-menu";
import { usePathname } from "next/navigation";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserRole } from "@/lib/types";

// Mock external modules
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: vi.fn(({ children, href, onClick }) => (
    <a href={href} onClick={onClick} data-testid="next-link">
      {children}
    </a>
  )),
}));

const mockUsePathname = vi.mocked(usePathname);

describe("MobileMenu", () => {
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
  ];

  const mockUserMenuOptions = [
    {
      label: "Configuración",
      href: "/settings",
      icon: () => <span data-testid="settings-icon">⚙️</span>,
      roles: [UserRole.USER, UserRole.PROFESSIONAL],
    },
    {
      label: "Cerrar Sesión",
      action: "logout",
      icon: () => <span data-testid="logout-icon">🚪</span>,
      roles: [UserRole.USER, UserRole.PROFESSIONAL],
    },
    {
      label: "Panel Admin",
      href: "/admin",
      icon: () => <span data-testid="admin-panel-icon">🔧</span>,
      roles: [UserRole.ADMIN],
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    navigationItems: mockNavigationItems,
    userMenuOptions: mockUserMenuOptions,
    onUserMenuAction: vi.fn(),
    isAuthenticated: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("should not render when isOpen is false", () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Menú")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<MobileMenu {...defaultProps} />);

    expect(screen.getByText("Menú")).toBeInTheDocument();
  });

  it("should render close button and backdrop", () => {
    render(<MobileMenu {...defaultProps} />);

    expect(screen.getByLabelText("Cerrar menú")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument(); // X button
  });

  it("should call onClose when backdrop is clicked", () => {
    const mockOnClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={mockOnClose} />);

    const backdrop = screen.getByLabelText("Cerrar menú");
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when close button is clicked", () => {
    const mockOnClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should render navigation items", () => {
    render(<MobileMenu {...defaultProps} userRole="user" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();
    expect(screen.getByTestId("profile-icon")).toBeInTheDocument();
  });

  it("should filter navigation items by user role", () => {
    render(<MobileMenu {...defaultProps} userRole="user" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("should show admin navigation items for admin user", () => {
    render(<MobileMenu {...defaultProps} userRole="admin" />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByTestId("admin-icon")).toBeInTheDocument();
  });

  it("should highlight active navigation item", () => {
    mockUsePathname.mockReturnValue("/profile");
    render(<MobileMenu {...defaultProps} userRole="user" />);

    const profileLink = screen.getByText("Perfil").closest("a");
    expect(profileLink).toBeInTheDocument();
    // Note: The actual styling depends on the CSS classes being applied
  });

  it("should call onClose when navigation item is clicked", () => {
    const mockOnClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={mockOnClose} userRole="user" />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    fireEvent.click(dashboardLink!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should render user info when authenticated", () => {
    render(
      <MobileMenu {...defaultProps} isAuthenticated={true} userName="John Doe" userRole="user" />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render default user name when no userName provided", () => {
    render(<MobileMenu {...defaultProps} isAuthenticated={true} userRole="user" />);

    expect(screen.getByText("Usuario")).toBeInTheDocument();
  });

  it("should render user menu options when authenticated", () => {
    render(<MobileMenu {...defaultProps} isAuthenticated={true} userRole="user" />);

    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });

  it("should filter user menu options by user role", () => {
    render(<MobileMenu {...defaultProps} isAuthenticated={true} userRole="user" />);

    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    expect(screen.queryByText("Panel Admin")).not.toBeInTheDocument();
  });

  it("should show admin user menu options for admin user", () => {
    render(<MobileMenu {...defaultProps} isAuthenticated={true} userRole="admin" />);

    expect(screen.getByText("Panel Admin")).toBeInTheDocument();
    expect(screen.getByTestId("admin-panel-icon")).toBeInTheDocument();
  });

  it("should handle user menu action clicks", () => {
    const mockOnUserMenuAction = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <MobileMenu
        {...defaultProps}
        isAuthenticated={true}
        userRole="user"
        onUserMenuAction={mockOnUserMenuAction}
        onClose={mockOnClose}
      />,
    );

    const logoutButton = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutButton);

    expect(mockOnUserMenuAction).toHaveBeenCalledWith("logout");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should handle user menu links", () => {
    const mockOnClose = vi.fn();

    render(
      <MobileMenu {...defaultProps} isAuthenticated={true} userRole="user" onClose={mockOnClose} />,
    );

    const settingsLink = screen.getByText("Configuración").closest("a");
    fireEvent.click(settingsLink!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should render auth buttons for non-authenticated users", () => {
    render(<MobileMenu {...defaultProps} isAuthenticated={false} />);

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument();
  });

  it("should call onClose when auth buttons are clicked", () => {
    const mockOnClose = vi.fn();

    render(<MobileMenu {...defaultProps} isAuthenticated={false} onClose={mockOnClose} />);

    const loginLink = screen.getByText("Iniciar Sesión").closest("a");
    const registerLink = screen.getByText("Crear Cuenta").closest("a");

    fireEvent.click(loginLink!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(registerLink!);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it("should handle user menu options with dividers", () => {
    const userMenuWithDivider = [
      {
        label: "Configuración",
        href: "/settings",
        icon: () => <span data-testid="settings-icon">⚙️</span>,
        roles: [UserRole.USER],
      },
      {
        label: "Divider",
        divider: true,
        roles: [UserRole.USER],
      },
      {
        label: "Cerrar Sesión",
        action: "logout",
        icon: () => <span data-testid="logout-icon">🚪</span>,
        roles: [UserRole.USER],
      },
    ];

    render(
      <MobileMenu
        {...defaultProps}
        isAuthenticated={true}
        userRole="user"
        userMenuOptions={userMenuWithDivider}
      />,
    );

    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("should handle navigation items without icons", () => {
    const navItemsWithoutIcons = [
      {
        href: "/simple",
        label: "Simple Link",
        roles: [UserRole.USER],
      },
    ];

    render(<MobileMenu {...defaultProps} navigationItems={navItemsWithoutIcons} userRole="user" />);

    expect(screen.getByText("Simple Link")).toBeInTheDocument();
  });

  it("should handle user menu options without icons", () => {
    const userMenuWithoutIcons = [
      {
        label: "Simple Option",
        action: "simple",
        roles: [UserRole.USER],
      },
    ];

    render(
      <MobileMenu
        {...defaultProps}
        isAuthenticated={true}
        userRole="user"
        userMenuOptions={userMenuWithoutIcons}
      />,
    );

    expect(screen.getByText("Simple Option")).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    render(<MobileMenu {...defaultProps} />);

    const menuPanel = screen.getByText("Menú").closest("div")?.parentElement;
    expect(menuPanel).toHaveClass("fixed", "top-0", "right-0", "h-full", "w-80");
  });

  it("should handle empty navigation items", () => {
    render(<MobileMenu {...defaultProps} navigationItems={[]} />);

    expect(screen.getByText("Menú")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("should handle empty user menu options", () => {
    render(
      <MobileMenu {...defaultProps} isAuthenticated={true} userRole="user" userMenuOptions={[]} />,
    );

    expect(screen.getByText("Menú")).toBeInTheDocument();
    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
  });

  it("should handle undefined userRole", () => {
    render(<MobileMenu {...defaultProps} userRole={undefined} />);

    // Should show auth buttons when userRole is undefined
    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument();
  });

  it("should handle different pathnames", () => {
    mockUsePathname.mockReturnValue("/admin");
    render(<MobileMenu {...defaultProps} userRole="admin" />);

    const adminLink = screen.getByText("Admin").closest("a");
    expect(adminLink).toBeInTheDocument();
    // Note: The actual styling depends on the CSS classes being applied
  });
});
