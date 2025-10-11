import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AdminSpecialties from "../specialties/page";
import { apiClient } from "@/lib/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getAllSpecialtiesAdmin: vi.fn(),
    createSpecialty: vi.fn(),
    updateSpecialty: vi.fn(),
    deleteSpecialty: vi.fn(),
  },
}));

// Mock the components
interface MockSearchCardProps { title: string; onSearch: () => void; onClearSearch: () => void }
vi.mock("@/components/admin/SearchCard", () => ({
  SearchCard: ({ title, onSearch, onClearSearch }: MockSearchCardProps) => (
    <div data-testid="search-card">
      <h3>{title}</h3>
      <button onClick={onSearch} data-testid="search-button">Buscar</button>
      <button onClick={onClearSearch} data-testid="clear-button">Limpiar</button>
    </div>
  ),
}));

interface MockSearchResultsInfoProps { appliedSearch: string; totalItems: number }
vi.mock("@/components/admin/SearchResultsInfo", () => ({
  SearchResultsInfo: ({ appliedSearch, totalItems }: MockSearchResultsInfoProps) => (
    <div data-testid="search-results-info">
      {appliedSearch && <span>Results: {totalItems}</span>}
    </div>
  ),
}));

interface MockEntityFormDialogProps { isOpen: boolean; onSubmit: () => void }
vi.mock("@/components/admin/EntityFormDialog", () => ({
  EntityFormDialog: ({ isOpen, onSubmit }: MockEntityFormDialogProps) => (
    isOpen ? (
      <div data-testid="entity-form-dialog">
        <button onClick={onSubmit} data-testid="submit-form">Submit</button>
      </div>
    ) : null
  ),
}));

interface MockDeleteDialogProps { isOpen: boolean; onConfirm: () => void }
vi.mock("@/components/admin/DeleteConfirmDialog", () => ({
  DeleteConfirmDialog: ({ isOpen, onConfirm }: MockDeleteDialogProps) => (
    isOpen ? (
      <div data-testid="delete-dialog">
        <button onClick={onConfirm} data-testid="confirm-delete">Confirm Delete</button>
      </div>
    ) : null
  ),
}));

interface MockToggleDialogProps { isOpen: boolean; onConfirm: () => void }
vi.mock("@/components/admin/ToggleStatusDialog", () => ({
  ToggleStatusDialog: ({ isOpen, onConfirm }: MockToggleDialogProps) => (
    isOpen ? (
      <div data-testid="toggle-dialog">
        <button onClick={onConfirm} data-testid="confirm-toggle">Confirm Toggle</button>
      </div>
    ) : null
  ),
}));

const mockSpecialties = [
  {
    id: "1",
    name: "Psicología Clínica",
    description: "Especialidad en psicología clínica",
    is_active: true,
    professional_count: 5,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Terapia Familiar",
    description: "Especialidad en terapia familiar",
    is_active: false,
    professional_count: 3,
    created_at: "2024-01-02T00:00:00Z",
  },
];

describe("AdminSpecialties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getAllSpecialtiesAdmin).mockResolvedValue({
      items: mockSpecialties as unknown as import("@/lib/types").Specialty[],
      total: 2,
      page: 1,
      page_size: 10,
      total_pages: 1,
    });
  });

  it("renders the page title and header", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("Gestión de Especialidades")).toBeInTheDocument();
      expect(screen.getByText("Administrar especialidades médicas y terapéuticas")).toBeInTheDocument();
    });
  });

  it("renders search components", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByTestId("search-card")).toBeInTheDocument();
      expect(screen.getByTestId("search-results-info")).toBeInTheDocument();
    });
  });

  it("displays specialties in table", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("Psicología Clínica")).toBeInTheDocument();
      expect(screen.getByText("Terapia Familiar")).toBeInTheDocument();
      expect(screen.getByText("Especialidad en psicología clínica")).toBeInTheDocument();
      expect(screen.getByText("Especialidad en terapia familiar")).toBeInTheDocument();
    });
  });

  it("shows active status correctly", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("Activa")).toBeInTheDocument();
      expect(screen.getByText("Inactiva")).toBeInTheDocument();
    });
  });

  it("shows professional count", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("shows action buttons for each specialty", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: "" });
      const toggleButtons = screen.getAllByRole("button", { name: "" });
      const deleteButtons = screen.getAllByRole("button", { name: "" });
      expect(editButtons.length).toBeGreaterThan(0);
      expect(toggleButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it("handles search functionality", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByTestId("search-card")).toBeInTheDocument();
    });
    
    const searchButton = screen.getByTestId("search-button");
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(apiClient.getAllSpecialtiesAdmin).toHaveBeenCalled();
    });
  });

  it("handles clear search functionality", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByTestId("search-card")).toBeInTheDocument();
    });
    
    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(apiClient.getAllSpecialtiesAdmin).toHaveBeenCalled();
    });
  });

  it("shows loading state", () => {
    vi.mocked(apiClient.getAllSpecialtiesAdmin).mockImplementation(() => new Promise(() => {}));
    
    render(<AdminSpecialties />);
    
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("shows error message when API fails", async () => {
    vi.mocked(apiClient.getAllSpecialtiesAdmin).mockRejectedValue(new Error("API Error"));
    
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("Error al cargar las especialidades")).toBeInTheDocument();
    });
  });

  it("shows no results message when no specialties", async () => {
    vi.mocked(apiClient.getAllSpecialtiesAdmin).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0,
    });
    
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("No hay especialidades registradas")).toBeInTheDocument();
    });
  });

  it("shows add specialty button", async () => {
    render(<AdminSpecialties />);
    
    await waitFor(() => {
      expect(screen.getByText("Agregar Especialidad")).toBeInTheDocument();
    });
  });
});
