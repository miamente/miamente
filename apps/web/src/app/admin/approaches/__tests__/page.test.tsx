import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminTherapeuticApproaches from "../page";

// Mock API client to return deterministic data
const mockGetAllTherapeuticApproachesAdmin = vi.hoisted(() => vi.fn());
const mockCreateTherapeuticApproach = vi.hoisted(() => vi.fn());
const mockUpdateTherapeuticApproach = vi.hoisted(() => vi.fn());
const mockDeleteTherapeuticApproach = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", () => ({
  apiClient: {
    getAllTherapeuticApproachesAdmin: mockGetAllTherapeuticApproachesAdmin,
    createTherapeuticApproach: mockCreateTherapeuticApproach,
    updateTherapeuticApproach: mockUpdateTherapeuticApproach,
    deleteTherapeuticApproach: mockDeleteTherapeuticApproach,
  },
}));

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
  disabled?: boolean;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, size, variant, disabled }: MockButtonProps) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={className}
      data-size={size}
      data-variant={variant}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, onKeyDown, placeholder, className, id }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; placeholder?: string; className?: string; id?: string }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      id={id}
    />
  ),
}));

interface MockDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: MockDialogProps) => (
    <div data-testid="dialog" data-open={open}>
      {open && (
        <div>
          <div data-testid="dialog-backdrop" onClick={() => onOpenChange?.(false)} />
          {children}
        </div>
      )}
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
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label data-testid="label" htmlFor={htmlFor} className={className}>
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

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Brain: () => <div data-testid="brain-icon">Brain</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-icon">EyeOff</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}));

// Mock Pagination component
vi.mock("@/components/ui/pagination", () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: { currentPage?: number; totalPages?: number; onPageChange?: (page: number) => void }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange?.(currentPage! - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button onClick={() => onPageChange?.(currentPage! + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  ),
}));

describe("AdminTherapeuticApproaches", () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);
    
    // Reset all mock functions
    vi.clearAllMocks();
    
    // Set up default mock responses
    mockGetAllTherapeuticApproachesAdmin.mockResolvedValue({
      items: [
        {
          id: "1",
          name: "Terapia Cognitivo-Conductual",
          description: "Enfoque terapéutico que se centra en identificar y cambiar patrones de pensamiento negativos",
          is_active: true,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          professional_count: 25,
        },
        {
          id: "2",
          name: "EMDR",
          description: "Desensibilización y reprocesamiento por movimientos oculares para el tratamiento del trauma",
          is_active: true,
          created_at: "2024-01-16T09:15:00Z",
          updated_at: "2024-01-16T09:15:00Z",
          professional_count: 12,
        },
      ],
      total: 2,
      page: 1,
      page_size: 10,
      total_pages: 1,
    });
  });

  it("renders the page title and description", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    expect(screen.getByText("Gestión de Enfoques Terapéuticos")).toBeInTheDocument();
    expect(screen.getByText("Administrar enfoques y metodologías terapéuticas")).toBeInTheDocument();
  });

  it("renders the add button", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    const addButton = screen.getByText("Agregar Enfoque");
    expect(addButton).toBeInTheDocument();
  });

  it("loads and displays therapeutic approaches", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(mockGetAllTherapeuticApproachesAdmin).toHaveBeenCalledWith(1, 10, "");
    });

    expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    expect(screen.getByText("EMDR")).toBeInTheDocument();
    expect(screen.getByText("Enfoque terapéutico que se centra en identificar y cambiar patrones de pensamiento negativos")).toBeInTheDocument();
  });

  it("opens create dialog when add button is clicked", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    const addButton = screen.getByText("Agregar Enfoque");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Agregar Enfoque Terapéutico")).toBeInTheDocument();
    });
  });

  it("opens edit dialog when edit button is clicked", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTestId("edit-icon");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar Enfoque Terapéutico")).toBeInTheDocument();
    });

    expect(screen.getByText("Editar Enfoque Terapéutico")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog when delete button is clicked", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId("trash-icon");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
    });

    expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
    expect(screen.getByText('"Terapia Cognitivo-Conductual"')).toBeInTheDocument();
  });

  it("opens toggle confirmation dialog when toggle button is clicked", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByTestId("eye-icon");
    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Desactivar Enfoque Terapéutico")).toBeInTheDocument();
    });

    expect(screen.getByText("Desactivar Enfoque Terapéutico")).toBeInTheDocument();
    expect(screen.getByText('"Terapia Cognitivo-Conductual"')).toBeInTheDocument();
  });

  it("performs search when search button is clicked", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o descripción...");
    fireEvent.change(searchInput, { target: { value: "Cognitivo" } });

    const searchButton = screen.getByText("Buscar");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockGetAllTherapeuticApproachesAdmin).toHaveBeenCalledWith(1, 10, "Cognitivo");
    });
  });

  it("performs search when Enter key is pressed", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o descripción...");
    fireEvent.change(searchInput, { target: { value: "EMDR" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(mockGetAllTherapeuticApproachesAdmin).toHaveBeenCalledWith(1, 10, "EMDR");
    });
  });

  it("clears search when clear button is clicked", async () => {
    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nombre o descripción...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    const searchButton = screen.getByText("Buscar");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockGetAllTherapeuticApproachesAdmin).toHaveBeenCalledWith(1, 10, "test");
    });

    // Find the clear button in the search results banner (the one that appears after search)
    const clearButtons = screen.getAllByText("Limpiar");
    const clearButton = clearButtons[1]; // The second one is in the search results banner
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockGetAllTherapeuticApproachesAdmin).toHaveBeenCalledWith(1, 10, "");
    });
  });

  it("creates a new therapeutic approach", async () => {
    mockCreateTherapeuticApproach.mockResolvedValue({
      id: "3",
      name: "New Approach",
      description: "New description",
      is_active: true,
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
      professional_count: 0,
    });

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    const addButton = screen.getByText("Agregar Enfoque");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Agregar Enfoque Terapéutico")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Nombre del enfoque terapéutico");
    const descriptionInput = screen.getByPlaceholderText("Descripción del enfoque terapéutico");

    fireEvent.change(nameInput, { target: { value: "New Approach" } });
    fireEvent.change(descriptionInput, { target: { value: "New description" } });

    const createButton = screen.getByText("Crear");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateTherapeuticApproach).toHaveBeenCalledWith({
        name: "New Approach",
        description: "New description",
      });
    });
  });

  it("updates an existing therapeutic approach", async () => {
    mockUpdateTherapeuticApproach.mockResolvedValue({
      id: "1",
      name: "Updated Approach",
      description: "Updated description",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T10:00:00Z",
      professional_count: 25,
    });

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTestId("edit-icon");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar Enfoque Terapéutico")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Nombre del enfoque terapéutico");
    fireEvent.change(nameInput, { target: { value: "Updated Approach" } });

    const updateButton = screen.getByText("Actualizar");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateTherapeuticApproach).toHaveBeenCalledWith("1", {
        name: "Updated Approach",
        description: "Enfoque terapéutico que se centra en identificar y cambiar patrones de pensamiento negativos",
      });
    });
  });

  it("deletes a therapeutic approach", async () => {
    mockDeleteTherapeuticApproach.mockResolvedValue(undefined);

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId("trash-icon");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByText("Eliminar");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteTherapeuticApproach).toHaveBeenCalledWith("1");
    });
  });

  it("toggles therapeutic approach status", async () => {
    mockUpdateTherapeuticApproach.mockResolvedValue({
      id: "1",
      name: "Terapia Cognitivo-Conductual",
      description: "Enfoque terapéutico que se centra en identificar y cambiar patrones de pensamiento negativos",
      is_active: false,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T10:00:00Z",
      professional_count: 25,
    });

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByTestId("eye-icon");
    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Desactivar Enfoque Terapéutico")).toBeInTheDocument();
    });

    const confirmToggleButton = screen.getByText("Desactivar");
    fireEvent.click(confirmToggleButton);

    await waitFor(() => {
      expect(mockUpdateTherapeuticApproach).toHaveBeenCalledWith("1", {
        is_active: false,
      });
    });
  });

  it("displays loading state", () => {
    mockGetAllTherapeuticApproachesAdmin.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminTherapeuticApproaches />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("displays error state", async () => {
    mockGetAllTherapeuticApproachesAdmin.mockRejectedValue(new Error("API Error"));

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("Error al cargar los enfoques terapéuticos")).toBeInTheDocument();
    });
  });

  it("displays empty state when no approaches match search", async () => {
    mockGetAllTherapeuticApproachesAdmin.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0,
    });

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByText("No hay enfoques terapéuticos registrados")).toBeInTheDocument();
    });
  });

  it("displays pagination when there are multiple pages", async () => {
    mockGetAllTherapeuticApproachesAdmin.mockResolvedValue({
      items: [
        {
          id: "1",
          name: "Test Approach",
          description: "Test description",
          is_active: true,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          professional_count: 5,
        },
      ],
      total: 25,
      page: 1,
      page_size: 10,
      total_pages: 3,
    });

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("handles pagination changes", async () => {
    mockGetAllTherapeuticApproachesAdmin.mockResolvedValue({
      items: [],
      total: 25,
      page: 2,
      page_size: 10,
      total_pages: 3,
    });

    await act(async () => {
      render(<AdminTherapeuticApproaches />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockGetAllTherapeuticApproachesAdmin).toHaveBeenCalledWith(2, 10, "");
    });
  });
});
