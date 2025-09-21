import React from "react";
import { render, screen } from "@testing-library/react";
import { AcademicExperienceEditor } from "../academic-experience-editor";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock React Hook Form
const mockUseFormContext = vi.fn();
const mockUseFieldArray = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => mockUseFormContext(),
  useFieldArray: () => mockUseFieldArray(),
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("AcademicExperienceEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
    render(<AcademicExperienceEditor />);

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(<AcademicExperienceEditor disabled={true} />);

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });

  it("should render the collapsible component", () => {
    render(<AcademicExperienceEditor />);

    // Check that the collapsible is rendered (closed by default)
    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    // The collapsible content is hidden by default
  });

  it("should render with form context", () => {
    render(<AcademicExperienceEditor />);

    // The component should render without throwing form context errors
    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });

  it("should accept disabled prop correctly", () => {
    const { rerender } = render(<AcademicExperienceEditor disabled={false} />);

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();

    // Re-render with disabled prop
    rerender(<AcademicExperienceEditor disabled={true} />);

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
  });
});
