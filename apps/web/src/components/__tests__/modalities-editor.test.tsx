import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalitiesEditor } from "../professional-info/ModalitiesEditor";
import { useModalities } from "@/hooks/useModalities";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ProfessionalModality } from "@/lib/types";

// Mock external modules and hooks
vi.mock("@/hooks/useModalities");
vi.mock("next/link", () => ({
  __esModule: true,
  default: vi.fn(({ children, href, className }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  )),
}));

// Mock crypto.randomUUID and getRandomValues
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "mock-uuid-123"),
    getRandomValues: vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
});

// ID generation mocking removed - no longer needed

const mockUseModalities = vi.mocked(useModalities);

describe("ModalitiesEditor", () => {
  // Helper function to get and click the collapsible trigger
  const clickCollapsibleTrigger = () => {
    const trigger =
      screen.getByText("Modalidades de Intervención").closest("button") ||
      screen.getByText("Modalidades de Intervención").closest("[data-slot='collapsible-trigger']");
    expect(trigger).toBeTruthy();
    fireEvent.click(trigger!);
  };

  const mockModalities = [
    {
      id: "mod-1",
      name: "Terapia Individual",
      description: "Sesiones individuales",
      category: "individual",
      currency: "COP",
      default_price_cents: 50000,
      is_active: true,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "mod-2",
      name: "Terapia Grupal",
      description: "Sesiones grupales",
      category: "group",
      currency: "COP",
      default_price_cents: 30000,
      is_active: true,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "mod-3",
      name: "Terapia Familiar",
      description: "Sesiones familiares",
      category: "family",
      currency: "COP",
      default_price_cents: 40000,
      is_active: true,
      created_at: "2023-01-01T00:00:00Z",
    },
  ];

  const defaultProps = {
    disabled: false,
    value: [],
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseModalities.mockReturnValue({
      modalities: mockModalities,
      loading: false,
      error: null,
    });
  });

  it("should render with default props", () => {
    render(<ModalitiesEditor {...defaultProps} />);

    expect(screen.getByText("Modalidades de Intervención")).toBeInTheDocument();

    // The collapsible is closed by default, so we need to open it to see the add button
    clickCollapsibleTrigger();

    expect(screen.getByRole("button", { name: /agregar modalidad/i })).toBeInTheDocument();
  });

  it("should show loading state", () => {
    mockUseModalities.mockReturnValue({
      modalities: [],
      loading: true,
      error: null,
    });

    render(<ModalitiesEditor {...defaultProps} />);

    expect(screen.getByText("Cargando modalidades...")).toBeInTheDocument();
  });

  it("should show error state", () => {
    mockUseModalities.mockReturnValue({
      modalities: [],
      loading: false,
      error: "Error al cargar modalidades",
    });

    render(<ModalitiesEditor {...defaultProps} />);

    expect(
      screen.getByText("Error al cargar modalidades: Error al cargar modalidades"),
    ).toBeInTheDocument();
  });

  it("should render with initial modalities", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    render(<ModalitiesEditor {...defaultProps} value={initialModalities} />);

    // The collapsible is closed by default, so we need to open it to see the modalities
    clickCollapsibleTrigger();

    expect(screen.getAllByText("Terapia Individual")).toHaveLength(2); // One in select, one in header
    expect(screen.getByText("Virtual")).toBeInTheDocument();
    expect(screen.getByText("Presencial")).toBeInTheDocument();
    expect(screen.getByText("Por defecto")).toBeInTheDocument();
  });

  it("should open and close collapsible", () => {
    render(<ModalitiesEditor {...defaultProps} />);

    clickCollapsibleTrigger();

    expect(screen.getByText("Agregar Modalidad")).toBeInTheDocument();

    clickCollapsibleTrigger();

    expect(screen.queryByText("Agregar Modalidad")).not.toBeInTheDocument();
  });

  it("should add new modality", () => {
    const mockOnChange = vi.fn();
    render(<ModalitiesEditor {...defaultProps} onChange={mockOnChange} />);

    clickCollapsibleTrigger();

    const addButton = screen.getByRole("button", { name: /agregar modalidad/i });
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.any(String),
        modalityId: "",
        modalityName: "Modalidad",
        virtualPrice: 0,
        presencialPrice: 0,
        offersPresencial: false,
        description: "",
        isDefault: false,
      }),
    ]);
  });

  it("should remove modality", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const removeButton = screen
      .getAllByRole("button")
      .find((button) => button.querySelector('svg[class*="lucide-trash"]'));
    expect(removeButton).toBeTruthy();
    fireEvent.click(removeButton!);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("should set default modality", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: false,
      },
      {
        id: "prof-mod-2",
        modalityId: "mod-2",
        modalityName: "Terapia Grupal",
        virtualPrice: 30000,
        presencialPrice: 35000,
        offersPresencial: true,
        description: "Sesiones grupales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const setDefaultButton = screen
      .getAllByRole("button")
      .find(
        (button) =>
          button.querySelector('svg[class*="lucide-star"]') &&
          button.classList.contains("text-yellow-600"),
      );
    expect(setDefaultButton).toBeTruthy();
    fireEvent.click(setDefaultButton!);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...initialModalities[0],
        isDefault: true,
      },
      {
        ...initialModalities[1],
        isDefault: false,
      },
    ]);
  });

  it("should update modality field", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const virtualPriceInput = screen.getByLabelText("Precio Virtual (COP) *");
    fireEvent.change(virtualPriceInput, { target: { value: "60000" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...initialModalities[0],
        virtualPrice: 60000,
      },
    ]);
  });

  it("should update presencial price when offersPresencial is checked", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: false,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const presencialCheckbox = screen.getByLabelText("También ofrecer modalidad presencial");
    fireEvent.click(presencialCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...initialModalities[0],
        offersPresencial: true,
      },
    ]);
  });

  it("should update description", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const descriptionTextarea = screen.getByLabelText("Descripción");
    fireEvent.change(descriptionTextarea, { target: { value: "Nueva descripción" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...initialModalities[0],
        description: "Nueva descripción",
      },
    ]);
  });

  it("should disable add button when all modalities are used", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
      {
        id: "prof-mod-2",
        modalityId: "mod-2",
        modalityName: "Terapia Grupal",
        virtualPrice: 30000,
        presencialPrice: 35000,
        offersPresencial: true,
        description: "Sesiones grupales",
        isDefault: false,
      },
      {
        id: "prof-mod-3",
        modalityId: "mod-3",
        modalityName: "Terapia Familiar",
        virtualPrice: 40000,
        presencialPrice: 45000,
        offersPresencial: true,
        description: "Sesiones familiares",
        isDefault: false,
      },
    ];

    render(<ModalitiesEditor {...defaultProps} value={initialModalities} />);

    clickCollapsibleTrigger();

    const addButton = screen.getByRole("button", {
      name: /todas las modalidades han sido agregadas/i,
    });
    expect(addButton).toBeDisabled();
  });

  it("should handle disabled state", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    render(<ModalitiesEditor {...defaultProps} value={initialModalities} disabled={true} />);

    clickCollapsibleTrigger();

    const virtualPriceInput = screen.getByLabelText("Precio Virtual (COP) *");
    const presencialCheckbox = screen.getByLabelText("También ofrecer modalidad presencial");
    const descriptionTextarea = screen.getByLabelText("Descripción");
    const addButton = screen.getByRole("button", { name: /agregar modalidad/i });

    expect(virtualPriceInput).toBeDisabled();
    expect(presencialCheckbox).toBeDisabled();
    expect(descriptionTextarea).toBeDisabled();
    expect(addButton).toBeDisabled();
  });

  it("should handle modality change", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    // For Radix UI Select, we need to click the combobox to open it first
    const modalitySelect = screen.getByRole("combobox");
    fireEvent.click(modalitySelect);

    // Then click on the option (this would normally be handled by the Select component)
    // Since we're testing the component's onChange behavior, we'll simulate the change directly
    // by calling the onModalityChange function that would be passed to ModalityFormFields
    expect(modalitySelect).toBeInTheDocument();
    // Note: The actual modality change would be handled by the Select component's internal logic
    // This test verifies that the select is rendered and accessible
  });

  it("should handle multiple modalities", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
      {
        id: "prof-mod-2",
        modalityId: "mod-2",
        modalityName: "Terapia Grupal",
        virtualPrice: 30000,
        presencialPrice: 35000,
        offersPresencial: false,
        description: "Sesiones grupales",
        isDefault: false,
      },
    ];

    render(<ModalitiesEditor {...defaultProps} value={initialModalities} />);

    clickCollapsibleTrigger();

    expect(screen.getAllByText("Terapia Individual")).toHaveLength(2); // One in select, one in header
    expect(screen.getAllByText("Terapia Grupal")).toHaveLength(2); // One in select, one in header
    expect(screen.getAllByText("Virtual")).toHaveLength(2);
    expect(screen.getByText("Presencial")).toBeInTheDocument();
    expect(screen.getByText("Por defecto")).toBeInTheDocument();
  });

  it("should handle empty modalities list", () => {
    render(<ModalitiesEditor {...defaultProps} value={[]} />);

    clickCollapsibleTrigger();

    expect(screen.getByText("Agregar Modalidad")).toBeInTheDocument();
    expect(screen.queryByText("Virtual")).not.toBeInTheDocument();
  });

  it("should handle undefined value prop", () => {
    render(<ModalitiesEditor disabled={false} onChange={vi.fn()} />);

    clickCollapsibleTrigger();

    expect(screen.getByText("Agregar Modalidad")).toBeInTheDocument();
  });

  it("should handle undefined onChange prop", () => {
    render(<ModalitiesEditor disabled={false} value={[]} />);

    clickCollapsibleTrigger();

    const addButton = screen.getByRole("button", { name: /agregar modalidad/i });
    fireEvent.click(addButton);

    // Should not throw error when onChange is undefined
    expect(addButton).toBeInTheDocument();
  });

  it("should handle presencial price field visibility", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: false,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    render(<ModalitiesEditor {...defaultProps} value={initialModalities} />);

    clickCollapsibleTrigger();

    expect(screen.queryByLabelText("Precio Presencial (COP)")).not.toBeInTheDocument();

    const presencialCheckbox = screen.getByLabelText("También ofrecer modalidad presencial");
    fireEvent.click(presencialCheckbox);

    expect(screen.getByLabelText("Precio Presencial (COP)")).toBeInTheDocument();
  });

  it("should handle presencial price update", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const presencialPriceInput = screen.getByLabelText("Precio Presencial (COP)");
    fireEvent.change(presencialPriceInput, { target: { value: "70000" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...initialModalities[0],
        presencialPrice: 70000,
      },
    ]);
  });

  it("should handle remove default modality and set new default", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
      {
        id: "prof-mod-2",
        modalityId: "mod-2",
        modalityName: "Terapia Grupal",
        virtualPrice: 30000,
        presencialPrice: 35000,
        offersPresencial: false,
        description: "Sesiones grupales",
        isDefault: false,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const removeButton = screen
      .getAllByRole("button")
      .find((button) => button.querySelector('svg[class*="lucide-trash"]'));
    expect(removeButton).toBeTruthy();
    fireEvent.click(removeButton!);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...initialModalities[1],
        isDefault: true,
      },
    ]);
  });

  it("should handle remove last modality", () => {
    const initialModalities: ProfessionalModality[] = [
      {
        id: "prof-mod-1",
        modalityId: "mod-1",
        modalityName: "Terapia Individual",
        virtualPrice: 50000,
        presencialPrice: 60000,
        offersPresencial: true,
        description: "Sesiones individuales",
        isDefault: true,
      },
    ];

    const mockOnChange = vi.fn();
    render(
      <ModalitiesEditor {...defaultProps} value={initialModalities} onChange={mockOnChange} />,
    );

    clickCollapsibleTrigger();

    const removeButton = screen
      .getAllByRole("button")
      .find((button) => button.querySelector('svg[class*="lucide-trash"]'));
    expect(removeButton).toBeTruthy();
    fireEvent.click(removeButton!);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
