import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AdminProfessionalsPage from "../professionals/page";
import { apiClient } from "@/lib/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getAllAccountsAdmin: vi.fn(),
    deleteAccount: vi.fn(),
    toggleAccountStatus: vi.fn(),
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

const mockProfessionals = [
  {
    id: "1",
    full_name: "Dr. Juan Pérez",
    email: "juan@example.com",
    is_active: true,
    is_verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    license_number: "LIC-123",
    years_experience: 5,
    rate_cents: 5000,
    currency: "USD",
    timezone: "America/Argentina/Buenos_Aires",
    last_login: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    full_name: "Dra. María García",
    email: "maria@example.com",
    is_active: false,
    is_verified: false,
    created_at: "2024-01-02T00:00:00Z",
    license_number: "LIC-456",
    years_experience: 8,
    rate_cents: 7500,
    currency: "USD",
    timezone: "America/Argentina/Buenos_Aires",
  },
];

describe("AdminProfessionalsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getAllAccountsAdmin).mockResolvedValue({
      items: mockProfessionals as unknown as import("@/lib/types").ProfessionalWithCountResponse[],
      total: 2,
      page: 1,
      page_size: 10,
      total_pages: 1,
    });
  });

  it("renders the page title and header", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Gestión de Profesionales")).toBeInTheDocument();
      expect(screen.getByText("Administrar profesionales registrados en la plataforma")).toBeInTheDocument();
    });
  });

  it("renders search components", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId("search-card")).toBeInTheDocument();
      expect(screen.getByTestId("search-results-info")).toBeInTheDocument();
    });
  });

  it("displays professionals in table", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("Dra. María García")).toBeInTheDocument();
      expect(screen.getByText("juan@example.com")).toBeInTheDocument();
      expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    });
  });

  it("shows active status correctly", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Activo")).toBeInTheDocument();
      expect(screen.getByText("Inactivo")).toBeInTheDocument();
    });
  });

  it("shows action buttons for each professional", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      const toggleButtons = screen.getAllByRole("button", { name: "" });
      const deleteButtons = screen.getAllByRole("button", { name: "" });
      expect(toggleButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it("handles search functionality", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId("search-card")).toBeInTheDocument();
    });
    
    const searchButton = screen.getByTestId("search-button");
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(apiClient.getAllProfessionalsAdmin).toHaveBeenCalled();
    });
  });

  it("handles clear search functionality", async () => {
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId("search-card")).toBeInTheDocument();
    });
    
    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(apiClient.getAllProfessionalsAdmin).toHaveBeenCalled();
    });
  });

  it("shows loading state", () => {
    vi.mocked(apiClient.getAllProfessionalsAdmin).mockImplementation(() => new Promise(() => {}));
    
    render(<AdminProfessionalsPage />);
    
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("shows error message when API fails", async () => {
    vi.mocked(apiClient.getAllProfessionalsAdmin).mockRejectedValue(new Error("API Error"));
    
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Error al cargar profesionales")).toBeInTheDocument();
    });
  });

  it("shows no results message when no professionals", async () => {
    vi.mocked(apiClient.getAllProfessionalsAdmin).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0,
    });
    
    render(<AdminProfessionalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("No hay profesionales registrados")).toBeInTheDocument();
    });
  });
});