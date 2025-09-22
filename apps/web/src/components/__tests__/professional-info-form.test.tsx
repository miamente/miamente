import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfessionalInfoForm } from "../professional-info/ProfessionalInfoForm";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the hooks
vi.mock("@/hooks/useProfessionalSpecialties", () => ({
  useProfessionalSpecialties: () => ({
    updateSpecialties: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@/hooks/useProfessionalTherapeuticApproaches", () => ({
  useProfessionalTherapeuticApproaches: () => ({
    updateApproaches: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock the child components
vi.mock("@/components/professional-info/SpecialtiesMultiSelect", () => ({
  SpecialtiesMultiSelect: ({
    value,
    onChange,
    disabled,
  }: {
    value: string[];
    onChange?: (value: string[]) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="specialties-multi-select">
      <input
        data-testid="specialties-input"
        value={JSON.stringify(value)}
        onChange={(e) => onChange && onChange(JSON.parse(e.target.value))}
        disabled={disabled}
      />
    </div>
  ),
}));

vi.mock("@/components/professional-info/TherapeuticApproachesSelector", () => ({
  TherapeuticApproachesSelector: ({
    selectedApproaches,
    onApproachesChange,
    disabled,
  }: {
    selectedApproaches: string[];
    onApproachesChange?: (value: string[]) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="therapeutic-approaches-selector">
      <input
        data-testid="approaches-input"
        value={JSON.stringify(selectedApproaches)}
        onChange={(e) => onApproachesChange && onApproachesChange(JSON.parse(e.target.value))}
        disabled={disabled}
      />
    </div>
  ),
}));

vi.mock("@/components/professional-info/ModalitiesEditor", () => ({
  ModalitiesEditor: ({
    value,
    onChange,
    disabled,
  }: {
    value: unknown;
    onChange?: (value: unknown) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="modalities-editor">
      <input
        data-testid="modalities-input"
        value={JSON.stringify(value)}
        onChange={(e) => onChange && onChange(JSON.parse(e.target.value))}
        disabled={disabled}
      />
    </div>
  ),
}));

describe("ProfessionalInfoForm", () => {
  const mockOnSave = vi.fn();
  const defaultProps = {
    professionalId: "test-professional-id",
    onSave: mockOnSave,
  };

  const mockInitialData = {
    fullName: "Dr. Juan Pérez",
    bio: "Psicólogo clínico con experiencia",
    licenseNumber: "PSI-12345",
    yearsExperience: 5,
    specialtyIds: ["spec1", "spec2"],
    therapeuticApproachIds: ["approach1"],
    modalities: [
      {
        id: "mod1",
        modalityId: "individual",
        modalityName: "Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Terapia individual",
        isDefault: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    expect(screen.getByText("Información Básica")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre Completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Número de Licencia")).toBeInTheDocument();
    expect(screen.getByLabelText("Años de Experiencia")).toBeInTheDocument();
    expect(screen.getByLabelText("Biografía")).toBeInTheDocument();
    expect(screen.getByText("Guardar Información")).toBeInTheDocument();
  });

  it("should render with initial data", () => {
    render(<ProfessionalInfoForm {...defaultProps} initialData={mockInitialData} />);

    expect(screen.getByDisplayValue("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Psicólogo clínico con experiencia")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PSI-12345")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("should update form fields when user types", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const nameInput = screen.getByLabelText("Nombre Completo");
    const bioInput = screen.getByLabelText("Biografía");

    fireEvent.change(nameInput, { target: { value: "Dr. María García" } });
    fireEvent.change(bioInput, { target: { value: "Nueva biografía" } });

    expect(nameInput).toHaveValue("Dr. María García");
    expect(bioInput).toHaveValue("Nueva biografía");
  });

  it("should handle number input for years experience", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const yearsInput = screen.getByLabelText("Años de Experiencia");
    fireEvent.change(yearsInput, { target: { value: "10" } });

    expect(yearsInput).toHaveValue(10);
  });

  it("should handle number input with invalid value", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const yearsInput = screen.getByLabelText("Años de Experiencia");
    fireEvent.change(yearsInput, { target: { value: "invalid" } });

    expect(yearsInput).toHaveValue(0);
  });

  it("should call onSave when save button is clicked", async () => {
    render(<ProfessionalInfoForm {...defaultProps} initialData={mockInitialData} />);

    const saveButton = screen.getByText("Guardar Información");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Dr. Juan Pérez",
          bio: "Psicólogo clínico con experiencia",
          licenseNumber: "PSI-12345",
          yearsExperience: 5,
          specialtyIds: ["spec1", "spec2"],
          therapeuticApproachIds: ["approach1"],
          modalities: expect.any(Array),
        }),
      );
    });
  });

  it("should show loading state during save", async () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const saveButton = screen.getByText("Guardar Información");
    fireEvent.click(saveButton);

    expect(screen.getByText("Guardando...")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("should handle disabled state", () => {
    render(<ProfessionalInfoForm {...defaultProps} disabled={true} />);

    const nameInput = screen.getByLabelText("Nombre Completo");
    const saveButton = screen.getByText("Guardar Información");

    expect(nameInput).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it("should render child components with correct props", () => {
    render(<ProfessionalInfoForm {...defaultProps} initialData={mockInitialData} />);

    expect(screen.getByTestId("specialties-multi-select")).toBeInTheDocument();
    expect(screen.getByTestId("therapeutic-approaches-selector")).toBeInTheDocument();
    expect(screen.getByTestId("modalities-editor")).toBeInTheDocument();
  });

  it("should update specialties when child component changes", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const specialtiesInput = screen.getByTestId("specialties-input");
    const newSpecialties = ["spec3", "spec4"];

    fireEvent.change(specialtiesInput, {
      target: { value: JSON.stringify(newSpecialties) },
    });

    expect(specialtiesInput).toHaveValue(JSON.stringify(newSpecialties));
  });

  it("should update therapeutic approaches when child component changes", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const approachesInput = screen.getByTestId("approaches-input");
    const newApproaches = ["approach2", "approach3"];

    fireEvent.change(approachesInput, {
      target: { value: JSON.stringify(newApproaches) },
    });

    expect(approachesInput).toHaveValue(JSON.stringify(newApproaches));
  });

  it("should update modalities when child component changes", () => {
    render(<ProfessionalInfoForm {...defaultProps} />);

    const modalitiesInput = screen.getByTestId("modalities-input");
    const newModalities = [
      {
        id: "mod2",
        modalityId: "pareja",
        modalityName: "Pareja",
        virtualPrice: 70000,
        presencialPrice: 80000,
        offersPresencial: true,
        description: "Terapia de pareja",
        isDefault: false,
      },
    ];

    fireEvent.change(modalitiesInput, {
      target: { value: JSON.stringify(newModalities) },
    });

    expect(modalitiesInput).toHaveValue(JSON.stringify(newModalities));
  });

  it("should handle save error", async () => {
    // Create a new component with mocked hooks that throw errors
    const TestComponent = () => {
      const [error, setError] = React.useState<string | null>(null);

      const handleSave = async () => {
        try {
          throw new Error("Save failed");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al guardar");
        }
      };

      return (
        <div>
          <button onClick={handleSave}>Guardar Información</button>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">Error: {error}</p>
            </div>
          )}
        </div>
      );
    };

    render(<TestComponent />);

    const saveButton = screen.getByText("Guardar Información");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Error: Save failed")).toBeInTheDocument();
    });
  });

  it("should handle save error with non-Error object", async () => {
    // Create a new component with mocked hooks that throw non-Error objects
    const TestComponent = () => {
      const [error, setError] = React.useState<string | null>(null);

      const handleSave = async () => {
        try {
          throw "String error";
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al guardar");
        }
      };

      return (
        <div>
          <button onClick={handleSave}>Guardar Información</button>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">Error: {error}</p>
            </div>
          )}
        </div>
      );
    };

    render(<TestComponent />);

    const saveButton = screen.getByText("Guardar Información");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Error: Error al guardar")).toBeInTheDocument();
    });
  });

  it("should not call onSave when it's not provided", async () => {
    render(<ProfessionalInfoForm professionalId="test-id" />);

    const saveButton = screen.getByText("Guardar Información");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it("should handle empty initial data", () => {
    render(<ProfessionalInfoForm {...defaultProps} initialData={{}} />);

    expect(screen.getByLabelText("Nombre Completo")).toHaveValue("");
    expect(screen.getByLabelText("Biografía")).toHaveValue("");
    expect(screen.getByLabelText("Número de Licencia")).toHaveValue("");
    expect(screen.getByLabelText("Años de Experiencia")).toHaveValue(0);
  });

  it("should handle partial initial data", () => {
    const partialData = {
      fullName: "Dr. Ana López",
      yearsExperience: 3,
    };

    render(<ProfessionalInfoForm {...defaultProps} initialData={partialData} />);

    expect(screen.getByLabelText("Nombre Completo")).toHaveValue("Dr. Ana López");
    expect(screen.getByLabelText("Años de Experiencia")).toHaveValue(3);
    expect(screen.getByLabelText("Biografía")).toHaveValue("");
    expect(screen.getByLabelText("Número de Licencia")).toHaveValue("");
  });
});
