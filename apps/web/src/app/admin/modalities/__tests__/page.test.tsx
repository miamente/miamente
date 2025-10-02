import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminModalities from "../page";

// Mock API client to return deterministic data
vi.mock("@/lib/api", () => {
  return {
    apiClient: {
      getAllModalitiesAdmin: vi.fn().mockResolvedValue([
        {
          id: "m1",
          name: "Consulta Individual",
          description: "Sesión individual de terapia o consulta médica",
          category: "Consulta",
          currency: "COP",
          default_price_cents: 8000000,
          is_active: true,
          created_at: new Date("2024-01-15").toISOString(),
          professional_count: 15,
        },
        {
          id: "m2",
          name: "Terapia de Pareja",
          description: "Sesión terapéutica para parejas",
          category: "Terapia",
          currency: "COP",
          default_price_cents: 10000000,
          is_active: false,
          created_at: new Date("2024-01-16").toISOString(),
          professional_count: 8,
        },
        {
          id: "m3",
          name: "Grupo de Apoyo",
          description: "Sesión grupal de apoyo emocional",
          category: "Grupo",
          currency: "COP",
          default_price_cents: 12000000,
          is_active: true,
          created_at: new Date("2024-01-17").toISOString(),
          professional_count: 3,
        },
      ]),
      // other methods not used in these tests
    },
  };
});

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: string;
  variant?: string;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, size, variant }: MockButtonProps) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={className}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

interface MockInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  id?: string;
}

vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, className, type, id }: MockInputProps) => (
    <input
      data-testid="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      type={type}
      id={id}
    />
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

interface MockDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: MockDialogProps) => (
    <div data-testid="dialog" data-open={open} data-on-open-change={onOpenChange}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label data-testid="label" htmlFor={htmlFor}>
      {children}
    </label>
  ),
}));

interface MockTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  id?: string;
}

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ placeholder, value, onChange, rows, id }: MockTextareaProps) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      id={id}
    />
  ),
}));

interface MockCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
}

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, id }: MockCheckboxProps) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      id={id}
    />
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  DollarSign: () => <div data-testid="dollar-icon">Dollar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
}));

describe("AdminModalities", () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  it("should render the page title and description", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Modalidades")).toBeInTheDocument();
      expect(screen.getByText("Administrar modalidades de consulta y precios")).toBeInTheDocument();
    });
  });

  it("should render the add modality button", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getAllByText("Agregar Modalidad").length).toBeGreaterThan(0);
    });
  });

  it("should load and display modalities", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getByText("Consulta Individual")).toBeInTheDocument();
      expect(screen.getByText("Terapia de Pareja")).toBeInTheDocument();
      expect(screen.getByText("Grupo de Apoyo")).toBeInTheDocument();
    });
  });

  it("should display modality details correctly", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(
        screen.getByText("Sesión individual de terapia o consulta médica"),
      ).toBeInTheDocument();
      // currency formatting is locale-dependent; verified in a dedicated test
    });
  });

  it("should filter modalities by search term", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getByText("Consulta Individual")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o descripción...");
    fireEvent.change(searchInput, { target: { value: "Individual" } });

    expect(screen.getByText("Consulta Individual")).toBeInTheDocument();
    expect(screen.queryByText("Terapia de Pareja")).not.toBeInTheDocument();
  });

  it("should display correct status badges", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getAllByText("Activa").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Inactiva").length).toBeGreaterThan(0);
    });
  });

  it("should handle create modality button click", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getAllByText("Agregar Modalidad").length).toBeGreaterThan(0);
    });

    const createButton = screen.getAllByText("Agregar Modalidad")[0]; // Get the first one (button)
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getAllByText("Agregar Modalidad").length).toBeGreaterThan(0);
    });
  });

  it("should show empty state when no modalities match search", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getByText("Consulta Individual")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o descripción...");
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    await waitFor(() => {
      expect(
        screen.getByText("No hay modalidades que coincidan con la búsqueda"),
      ).toBeInTheDocument();
    });
  });

  it("should format prices correctly", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getByText(/80\.000/)).toBeInTheDocument();
      expect(screen.getByText(/100\.000/)).toBeInTheDocument();
      expect(screen.getByText(/120\.000/)).toBeInTheDocument();
    });
  });

  it("should display professional counts", async () => {
    render(<AdminModalities />);

    await waitFor(() => {
      expect(screen.getByText("Profesionales: 15")).toBeInTheDocument();
      expect(screen.getByText("Profesionales: 8")).toBeInTheDocument();
      expect(screen.getByText("Profesionales: 3")).toBeInTheDocument();
    });
  });
});
