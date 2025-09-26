import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminLoginPage from "../page";

// Mock the LoginForm component
vi.mock("@/components/login-form", () => ({
  LoginForm: ({ isAdminLogin, redirectPath }: { isAdminLogin: boolean; redirectPath: string }) => (
    <div data-testid="login-form">
      Admin Login Form - isAdminLogin: {isAdminLogin.toString()} - redirectPath: {redirectPath}
    </div>
  ),
}));

describe("AdminLoginPage", () => {
  it("should render the admin login form with correct props", () => {
    render(<AdminLoginPage />);

    const loginForm = screen.getByTestId("login-form");
    expect(loginForm).toBeInTheDocument();
    expect(loginForm).toHaveTextContent("isAdminLogin: true");
    expect(loginForm).toHaveTextContent("redirectPath: /admin");
  });

  it("should render the admin login form component", () => {
    render(<AdminLoginPage />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
