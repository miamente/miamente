import React from "react";
import { render, screen } from "@testing-library/react";
import { CertificationsEditor } from "../certifications-editor";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock React Hook Form
const mockUseFormContext = vi.fn();
const mockUseFieldArray = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => mockUseFormContext(),
  useFieldArray: () => mockUseFieldArray(),
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("CertificationsEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: null,
      isLoading: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
    });

    mockUseFormContext.mockReturnValue({
      control: {},
      watch: vi.fn(),
      setValue: vi.fn(),
      formState: { errors: {} },
    });

    mockUseFieldArray.mockReturnValue({
      fields: [],
      append: vi.fn(),
      remove: vi.fn(),
    });
  });

  it("should render with default props", () => {
    render(<CertificationsEditor />);

    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(<CertificationsEditor disabled={true} />);

    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });

  it("should render the collapsible component", () => {
    render(<CertificationsEditor />);

    // Check that the collapsible is rendered (closed by default)
    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
    // The collapsible content is hidden by default, so we can't test for "Agregar Certificación" text
  });

  it("should render with authentication context", () => {
    render(<CertificationsEditor />);

    expect(mockUseAuth).toHaveBeenCalled();
  });

  it("should render with form context", () => {
    render(<CertificationsEditor />);

    // The component should render without throwing form context errors
    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });
});
