import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { CertificationsEditor } from "../certifications-editor";
import { useAuth } from "@/hooks/useAuth";
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth");
const mockUseAuth = vi.mocked(useAuth);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock environment variable
const originalEnv = process.env;
beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
});

afterAll(() => {
  process.env = originalEnv;
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      certifications: [],
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

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
    localStorageMock.getItem.mockReturnValue("test-token");
  });

  it("should render with default props", () => {
    render(
      <TestWrapper>
        <CertificationsEditor />
      </TestWrapper>,
    );

    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(
      <TestWrapper>
        <CertificationsEditor disabled={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });

  it("should render the collapsible component", () => {
    render(
      <TestWrapper>
        <CertificationsEditor />
      </TestWrapper>,
    );

    // Check that the collapsible is rendered (closed by default)
    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
    // The collapsible content is hidden by default, so we can't test for "Agregar Certificación" text
  });

  it("should render with authentication context", () => {
    render(
      <TestWrapper>
        <CertificationsEditor />
      </TestWrapper>,
    );

    expect(mockUseAuth).toHaveBeenCalled();
  });

  it("should render with form context", () => {
    render(
      <TestWrapper>
        <CertificationsEditor />
      </TestWrapper>,
    );

    // The component should render without throwing form context errors
    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });
});
