import React from "react";
import { render, screen } from "@testing-library/react";
import { WorkExperienceEditor } from "../work-experience-editor";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock React Hook Form
const mockUseFormContext = vi.fn();
const mockUseFieldArray = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => mockUseFormContext(),
  useFieldArray: () => mockUseFieldArray(),
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("WorkExperienceEditor", () => {
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
    render(<WorkExperienceEditor />);

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });

  it("should render with disabled prop", () => {
    render(<WorkExperienceEditor disabled={true} />);

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });

  it("should render the collapsible component", () => {
    render(<WorkExperienceEditor />);

    // Check that the collapsible is rendered (closed by default)
    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
    // The collapsible content is hidden by default
  });

  it("should render with form context", () => {
    render(<WorkExperienceEditor />);

    // The component should render without throwing form context errors
    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });

  it("should accept disabled prop correctly", () => {
    const { rerender } = render(<WorkExperienceEditor />);

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();

    // Re-render with disabled prop
    rerender(<WorkExperienceEditor disabled={true} />);

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
  });
});
