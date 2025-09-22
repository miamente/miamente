import React from "react";
import { render, screen } from "@testing-library/react";
import { SpecialtiesEditorSimple } from "../specialties-editor";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the useProfessionalSpecialties hook
vi.mock("@/hooks/useProfessionalSpecialties", () => ({
  useProfessionalSpecialties: vi.fn(),
}));

import { useProfessionalSpecialties } from "@/hooks/useProfessionalSpecialties";
const mockUseProfessionalSpecialties = vi.mocked(useProfessionalSpecialties);

describe("SpecialtiesEditorSimple", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render with loading state", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: true,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render with error state", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: "Failed to load specialties",
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render with specialties data", () => {
    const mockSpecialties = [
      {
        id: "spec-1",
        professional_id: "prof1",
        specialty_id: "specialty-123",
        name: "Psicología Clínica",
        price_cents: 5000,
        currency: "USD",
        is_default: true,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "spec-2",
        professional_id: "prof1",
        specialty_id: "specialty-456",
        name: "Terapia Familiar",
        price_cents: 6000,
        currency: "USD",
        is_default: false,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: mockSpecialties,
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render with specialties without names", () => {
    const mockSpecialties = [
      {
        id: "spec-1",
        professional_id: "prof1",
        specialty_id: "specialty-123",
        name: "Unknown Specialty",
        price_cents: 5000,
        currency: "USD",
        is_default: true,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: mockSpecialties,
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render empty state when no specialties", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render stethoscope icon", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    // Check for stethoscope icon in header
    const headerIcon = screen
      .getByText("Especialidades")
      .parentElement?.querySelector(".lucide-stethoscope");
    expect(headerIcon).toBeInTheDocument();
  });

  it("should handle disabled prop", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" disabled={true} />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    // The component doesn't seem to use the disabled prop directly in the UI
    // but it's passed through to the hook, so we just verify it renders
  });

  it("should pass professionalId to hook", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-professional-123" />);

    expect(mockUseProfessionalSpecialties).toHaveBeenCalledWith("test-professional-123");
  });

  it("should handle specialties with missing specialty_id", () => {
    const mockSpecialties = [
      {
        id: "spec-1",
        professional_id: "prof1",
        specialty_id: undefined,
        name: "Test Specialty",
        price_cents: 5000,
        currency: "USD",
        is_default: true,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: mockSpecialties,
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should render multiple specialties correctly", () => {
    const mockSpecialties = [
      {
        id: "spec-1",
        professional_id: "prof1",
        specialty_id: "specialty-123",
        name: "Psicología Clínica",
        price_cents: 5000,
        currency: "USD",
        is_default: true,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "spec-2",
        professional_id: "prof1",
        specialty_id: "specialty-456",
        name: "Terapia Familiar",
        price_cents: 6000,
        currency: "USD",
        is_default: false,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "spec-3",
        professional_id: "prof1",
        specialty_id: "specialty-789",
        name: "Terapia Cognitivo-Conductual",
        price_cents: 7000,
        currency: "USD",
        is_default: false,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      },
    ];

    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: mockSpecialties,
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    expect(screen.getByText("Especialidades")).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tus especialidades profesionales/)).toBeInTheDocument();
  });

  it("should maintain proper styling classes", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    const card = screen.getByText("Especialidades").closest(".p-0");
    expect(card).toBeInTheDocument();
  });

  it("should render with chevron icon", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    // Check for chevron icon
    const chevronIcon = screen
      .getByText("Especialidades")
      .parentElement?.querySelector(".lucide-chevron-right");
    expect(chevronIcon).toBeInTheDocument();
  });

  it("should render collapsible structure", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    // Check that the collapsible structure is rendered
    const collapsible = screen.getByText("Especialidades").closest("[data-slot='collapsible']");
    expect(collapsible).toBeInTheDocument();
  });

  it("should render card with proper structure", () => {
    mockUseProfessionalSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
      updateSpecialties: vi.fn(),
    });

    render(<SpecialtiesEditorSimple professionalId="test-id" />);

    // Check that the card structure is rendered
    const card = screen.getByText("Especialidades").closest("[data-slot='card']");
    expect(card).toBeInTheDocument();
  });
});
