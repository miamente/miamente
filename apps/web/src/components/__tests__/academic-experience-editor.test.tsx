import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { AcademicExperienceEditor } from "../academic-experience-editor";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      academic_experience: [],
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("AcademicExperienceEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(
      <TestWrapper>
        <AcademicExperienceEditor />
      </TestWrapper>,
    );

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(
      <TestWrapper>
        <AcademicExperienceEditor disabled={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });

  it("should render the collapsible component", () => {
    render(
      <TestWrapper>
        <AcademicExperienceEditor />
      </TestWrapper>,
    );

    // Check that the collapsible is rendered (closed by default)
    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    // The collapsible content is hidden by default
  });

  it("should render with form context", () => {
    render(
      <TestWrapper>
        <AcademicExperienceEditor />
      </TestWrapper>,
    );

    // The component should render without throwing form context errors
    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });

  it("should accept disabled prop correctly", () => {
    const { rerender } = render(
      <TestWrapper>
        <AcademicExperienceEditor disabled={false} />
      </TestWrapper>,
    );

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();

    // Re-render with disabled prop
    rerender(
      <TestWrapper>
        <AcademicExperienceEditor disabled={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });
});
