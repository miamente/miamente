import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserMenu } from "../header/user-menu";
import { usePathname } from "next/navigation";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserRole } from "@/lib/types";

// Mock external modules
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: vi.fn(({ children, href, onClick, className }) => (
    <a href={href} onClick={onClick} className={className} data-testid="next-link">
      {children}
    </a>
  )),
}));

const mockUsePathname = vi.mocked(usePathname);

describe("UserMenu", () => {
  const mockUserMenuOptions = [
    {
      label: "Configuración",
      href: "/settings",
      icon: () => <span data-testid="settings-icon">⚙️</span>,
      roles: [UserRole.USER, UserRole.PROFESSIONAL],
    },
    {
      label: "Panel Admin",
      href: "/admin",
      icon: () => <span data-testid="admin-icon">🔧</span>,
      roles: [UserRole.ADMIN],
    },
    {
      label: "Cerrar Sesión",
      action: "logout",
      icon: () => <span data-testid="logout-icon">🚪</span>,
      divider: true,
      roles: [UserRole.USER, UserRole.PROFESSIONAL, UserRole.ADMIN],
    },
  ];

  const defaultProps = {
    userRole: UserRole.USER,
    userName: "Test User",
    userEmail: "test@example.com",
    userMenuOptions: mockUserMenuOptions,
    onUserMenuAction: vi.fn(),
    isAuthenticated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  it("should render with default props", () => {
    render(<UserMenu {...defaultProps} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /test user/i })).toBeInTheDocument();
  });

  it("should render authentication buttons when not authenticated", () => {
    render(<UserMenu {...defaultProps} isAuthenticated={false} />);

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument();
    const links = screen.getAllByTestId("next-link");
    expect(links[0]).toHaveAttribute("href", "/login");
    expect(links[1]).toHaveAttribute("href", "/register");
  });

  it("should render user info when authenticated", () => {
    render(<UserMenu {...defaultProps} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /test user/i })).toBeInTheDocument();
  });

  it("should show user email when no userName provided", () => {
    render(<UserMenu {...defaultProps} userName={undefined} />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /test@example.com/i })).toBeInTheDocument();
  });

  it("should show default text when no userName or userEmail provided", () => {
    render(<UserMenu {...defaultProps} userName={undefined} userEmail={undefined} />);

    expect(screen.getByText("Usuario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /usuario/i })).toBeInTheDocument();
  });

  it("should open menu when button is clicked", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("should close menu when button is clicked again", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton); // Open
    expect(screen.getByText("Configuración")).toBeInTheDocument();

    fireEvent.click(menuButton); // Close
    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
  });

  it("should close menu when clicking outside", async () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);
    expect(screen.getByText("Configuración")).toBeInTheDocument();

    // Click outside the menu
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
    });
  });

  it("should filter menu options by user role", () => {
    render(<UserMenu {...defaultProps} userRole={UserRole.USER} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    expect(screen.queryByText("Panel Admin")).not.toBeInTheDocument();
  });

  it("should show admin options for admin user", () => {
    render(<UserMenu {...defaultProps} userRole={UserRole.ADMIN} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Panel Admin")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    // Configuración should not be visible for admin as it's only for USER and PROFESSIONAL roles
    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
  });

  it("should show professional options for professional user", () => {
    render(<UserMenu {...defaultProps} userRole={UserRole.PROFESSIONAL} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    expect(screen.queryByText("Panel Admin")).not.toBeInTheDocument();
  });

  it("should handle menu option clicks with href", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    // Wait for menu to open and find the settings link
    const settingsLink = screen.getByText("Configuración");
    expect(settingsLink).toBeInTheDocument();

    // The settings link should be a next-link with href="/settings"
    const links = screen.getAllByTestId("next-link");
    expect(links[0]).toHaveAttribute("href", "/settings");
  });

  it("should handle menu option clicks with action", () => {
    const mockOnUserMenuAction = vi.fn();
    render(<UserMenu {...defaultProps} onUserMenuAction={mockOnUserMenuAction} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    const logoutButton = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutButton);

    expect(mockOnUserMenuAction).toHaveBeenCalledWith("logout");
  });

  it("should close menu after clicking option", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);
    expect(screen.getByText("Configuración")).toBeInTheDocument();

    const settingsLink = screen.getByText("Configuración");
    fireEvent.click(settingsLink);

    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
  });

  it("should highlight active menu option", () => {
    mockUsePathname.mockReturnValue("/settings");
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    const settingsLink = screen.getByText("Configuración");
    expect(settingsLink).toHaveClass("bg-accent", "text-accent-foreground");
  });

  it("should not highlight inactive menu options", () => {
    mockUsePathname.mockReturnValue("/settings");
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    const logoutButton = screen.getByText("Cerrar Sesión");
    expect(logoutButton).toHaveClass("hover:bg-accent/50");
    expect(logoutButton).not.toHaveClass("bg-accent", "text-accent-foreground");
  });

  it("should render icons for menu options", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });

  it("should render role icon correctly", () => {
    render(<UserMenu {...defaultProps} userRole={UserRole.ADMIN} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    expect(menuButton.querySelector("svg")).toHaveClass("lucide-settings");
  });

  it("should render user icon for non-admin roles", () => {
    render(<UserMenu {...defaultProps} userRole={UserRole.USER} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    expect(menuButton.querySelector("svg")).toHaveClass("lucide-user");
  });

  it("should render user icon for professional role", () => {
    render(<UserMenu {...defaultProps} userRole={UserRole.PROFESSIONAL} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    expect(menuButton.querySelector("svg")).toHaveClass("lucide-user");
  });

  it("should render user icon for undefined role", () => {
    render(<UserMenu {...defaultProps} userRole={undefined} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    expect(menuButton.querySelector("svg")).toHaveClass("lucide-user");
  });

  it("should handle menu options without icons", () => {
    const optionsWithoutIcons = [
      {
        label: "Simple Option",
        action: "simple",
        roles: [UserRole.USER],
      },
    ];

    render(<UserMenu {...defaultProps} userMenuOptions={optionsWithoutIcons} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Simple Option")).toBeInTheDocument();
    expect(screen.queryByTestId("settings-icon")).not.toBeInTheDocument();
  });

  it("should handle menu options with dividers", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    // Check that divider is rendered (it's a div with specific classes)
    const menuContainer = screen.getByText("Configuración").closest("div")?.parentElement;
    expect(menuContainer).toBeInTheDocument();
  });

  it("should handle empty menu options", () => {
    render(<UserMenu {...defaultProps} userMenuOptions={[]} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
    expect(screen.queryByText("Cerrar Sesión")).not.toBeInTheDocument();
  });

  it("should handle undefined userRole gracefully", () => {
    render(<UserMenu {...defaultProps} userRole={undefined} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    // Should only show options without roles or with empty roles
    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();
    expect(screen.queryByText("Panel Admin")).not.toBeInTheDocument();
  });

  it("should handle menu options with both href and action", () => {
    const mixedOptions = [
      {
        label: "Link Option",
        href: "/link",
        icon: () => <span data-testid="link-icon">🔗</span>,
        roles: [UserRole.USER],
      },
      {
        label: "Action Option",
        action: "action",
        icon: () => <span data-testid="action-icon">⚡</span>,
        roles: [UserRole.USER],
      },
    ];

    render(<UserMenu {...defaultProps} userMenuOptions={mixedOptions} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Link Option")).toBeInTheDocument();
    expect(screen.getByText("Action Option")).toBeInTheDocument();
    expect(screen.getByTestId("link-icon")).toBeInTheDocument();
    expect(screen.getByTestId("action-icon")).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    expect(menuButton).toHaveClass("flex", "items-center", "gap-2", "px-3");

    fireEvent.click(menuButton);

    // Find the menu panel by looking for the div with the specific classes
    const menuPanel = screen.getByText("Configuración").closest("div")?.parentElement
      ?.parentElement?.parentElement;
    expect(menuPanel).toHaveClass(
      "absolute",
      "top-full",
      "right-0",
      "mt-2",
      "w-56",
      "rounded-md",
      "border",
      "bg-white",
      "shadow-lg",
    );
  });

  it("should handle multiple clicks on menu button", () => {
    render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });

    // First click - open
    fireEvent.click(menuButton);
    expect(screen.getByText("Configuración")).toBeInTheDocument();

    // Second click - close
    fireEvent.click(menuButton);
    expect(screen.queryByText("Configuración")).not.toBeInTheDocument();

    // Third click - open again
    fireEvent.click(menuButton);
    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });

  it("should handle menu options with special characters in labels", () => {
    const specialOptions = [
      {
        label: "Opción con & caracteres especiales!",
        action: "special",
        roles: [UserRole.USER],
      },
    ];

    render(<UserMenu {...defaultProps} userMenuOptions={specialOptions} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);

    expect(screen.getByText("Opción con & caracteres especiales!")).toBeInTheDocument();
  });

  it("should handle long user names gracefully", () => {
    const longUserName = "Very Long User Name That Might Cause Layout Issues";
    render(<UserMenu {...defaultProps} userName={longUserName} />);

    expect(screen.getByText(longUserName)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(longUserName, "i") })).toBeInTheDocument();
  });

  it("should handle long user emails gracefully", () => {
    const longEmail = "very.long.email.address.that.might.cause.layout.issues@example.com";
    render(<UserMenu {...defaultProps} userName={undefined} userEmail={longEmail} />);

    expect(screen.getByText(longEmail)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(longEmail, "i") })).toBeInTheDocument();
  });

  it("should maintain menu state during re-renders", () => {
    const { rerender } = render(<UserMenu {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /test user/i });
    fireEvent.click(menuButton);
    expect(screen.getByText("Configuración")).toBeInTheDocument();

    // Re-render with same props
    rerender(<UserMenu {...defaultProps} />);
    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });
});
