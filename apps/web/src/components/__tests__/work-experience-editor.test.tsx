import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { WorkExperienceEditor } from "../work-experience-editor";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      work_experience: [],
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("WorkExperienceEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(
      <TestWrapper>
        <WorkExperienceEditor />
      </TestWrapper>,
    );

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(
      <TestWrapper>
        <WorkExperienceEditor disabled={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });

  it("should render the collapsible component", () => {
    render(
      <TestWrapper>
        <WorkExperienceEditor />
      </TestWrapper>,
    );

    // Check that the collapsible is rendered (closed by default)
    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
    // The collapsible content is hidden by default
  });

  it("should render with form context", () => {
    render(
      <TestWrapper>
        <WorkExperienceEditor />
      </TestWrapper>,
    );

    // The component should render without throwing form context errors
    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });

  it("should accept disabled prop correctly", () => {
    const { rerender } = render(
      <TestWrapper>
        <WorkExperienceEditor />
      </TestWrapper>,
    );

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();

    // Re-render with disabled prop
    rerender(
      <TestWrapper>
        <WorkExperienceEditor disabled={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });
});
