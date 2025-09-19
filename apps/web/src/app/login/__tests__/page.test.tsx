import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";
import LoginPage from "../page";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  isUserVerified: vi.fn(),
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
  isUserVerified: vi.fn(),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(({ children, onClick, disabled, type = "button" }) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )),
}));

vi.mock("@/components/ui/input", () => ({
  Input: vi.fn(({ value, onChange, ...props }) => (
    <input value={value} onChange={onChange} {...props} />
  )),
}));

vi.mock("@/components/ui/card", () => ({
  Card: vi.fn(({ children, ...props }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  )),
  CardContent: vi.fn(({ children, ...props }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  )),
  CardHeader: vi.fn(({ children, ...props }) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  )),
  CardTitle: vi.fn(({ children, ...props }) => (
    <h2 data-testid="card-title" {...props}>
      {children}
    </h2>
  )),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockUseAuthContext = vi.mocked(useAuthContext);

describe("LoginPage", () => {
  const mockPush = vi.fn();
  const mockLoginUser = vi.fn();
  const mockLoginProfessional = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    mockUseAuthContext.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: mockLoginUser,
      loginProfessional: mockLoginProfessional,
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
  });

  it("should render login form", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Iniciar Sesión" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar Sesión" })).toBeInTheDocument();
  });

  it("should allow entering email and password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should call loginProfessional first, then loginUser on form submission", async () => {
    mockLoginProfessional.mockRejectedValueOnce(new Error("Not a professional"));
    mockLoginUser.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginProfessional).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
    });
  });

  it("should show error message on failed login", async () => {
    mockLoginProfessional.mockRejectedValueOnce(new Error("Professional login failed"));
    mockLoginUser.mockRejectedValueOnce(new Error("User login failed"));
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("User login failed")).toBeInTheDocument();
    });

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
    });
  });

  it("should show loading state during login", async () => {
    mockLoginProfessional.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });
    await user.click(submitButton);

    expect(screen.getByText("Iniciando sesión...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(screen.queryByText("Iniciando sesión...")).not.toBeInTheDocument();
    });
  });

  it("should show register link", () => {
    render(<LoginPage />);

    const registerLink = screen.getByText("Regístrate");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should redirect authenticated users to dashboard", () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        type: "user" as UserRole,
        data: {
          id: "user-123",
          email: "user@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
        },
      },
      isLoading: false,
      isAuthenticated: true,
      loginUser: mockLoginUser,
      loginProfessional: mockLoginProfessional,
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

    render(<LoginPage />);

    // The component should redirect when user is authenticated
    expect(mockPush).toHaveBeenCalled();
  });
});
