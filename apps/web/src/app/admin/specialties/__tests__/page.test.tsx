import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminSpecialties from '../page';

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>{children}</h3>
  ),
}));

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: string;
  variant?: string;
}

vi.mock('@/components/ui/button', () => ({
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

vi.mock('@/components/ui/input', () => ({
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

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

interface MockDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: MockDialogProps) => (
    <div data-testid="dialog" data-open={open} data-on-open-change={onOpenChange}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label data-testid="label" htmlFor={htmlFor}>{children}</label>
  ),
}));

interface MockTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  id?: string;
}

vi.mock('@/components/ui/textarea', () => ({
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
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Stethoscope: () => <div data-testid="stethoscope-icon">Stethoscope</div>,
}));

describe('AdminSpecialties', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('should render the page title and description', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Gestión de Especialidades')).toBeInTheDocument();
      expect(screen.getByText('Administrar especialidades médicas y terapéuticas')).toBeInTheDocument();
    });
  });

  it('should render the add specialty button', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      const addButtons = screen.getAllByText('Agregar Especialidad');
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it('should load and display specialties', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Psicología Clínica')).toBeInTheDocument();
      expect(screen.getByText('Psiquiatría')).toBeInTheDocument();
      expect(screen.getByText('Terapia Cognitivo-Conductual')).toBeInTheDocument();
    });
  });

  it('should display specialty details correctly', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Tratamiento de trastornos mentales y emocionales')).toBeInTheDocument();
      expect(screen.getByText('Profesionales: 12')).toBeInTheDocument();
      expect(screen.getByText('Profesionales: 8')).toBeInTheDocument();
    });
  });

  it('should filter specialties by search term', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Psicología Clínica')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o descripción...');
    fireEvent.change(searchInput, { target: { value: 'Psicología' } });

    expect(screen.getByText('Psicología Clínica')).toBeInTheDocument();
    expect(screen.queryByText('Psiquiatría')).not.toBeInTheDocument();
  });

  it('should display correct status badges', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Activa');
      const inactiveBadges = screen.getAllByText('Inactiva');
      
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(inactiveBadges.length).toBeGreaterThan(0);
    });
  });

  it('should handle create specialty button click', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      const addButtons = screen.getAllByText('Agregar Especialidad');
      expect(addButtons.length).toBeGreaterThan(0);
    });

    const createButton = screen.getAllByText('Agregar Especialidad')[0]; // Get the button, not the dialog title
    fireEvent.click(createButton);

    await waitFor(() => {
      const addButtons = screen.getAllByText('Agregar Especialidad');
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it('should show empty state when no specialties match search', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Psicología Clínica')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o descripción...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    await waitFor(() => {
      expect(screen.getByText('No hay especialidades que coincidan con la búsqueda')).toBeInTheDocument();
    });
  });

  it('should display professional counts', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Profesionales: 12')).toBeInTheDocument();
      expect(screen.getByText('Profesionales: 8')).toBeInTheDocument();
      expect(screen.getByText('Profesionales: 5')).toBeInTheDocument();
    });
  });

  it('should show creation dates', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      expect(screen.getByText('Creada: 1/15/2024')).toBeInTheDocument();
      expect(screen.getByText('Creada: 1/16/2024')).toBeInTheDocument();
      expect(screen.getByText('Creada: 1/17/2024')).toBeInTheDocument();
    });
  });

  it('should render action buttons for each specialty', async () => {
    render(<AdminSpecialties />);

    await waitFor(() => {
      const editButtons = screen.getAllByTestId('edit-icon');
      const trashButtons = screen.getAllByTestId('trash-icon');
      
      expect(editButtons.length).toBeGreaterThan(0);
      expect(trashButtons.length).toBeGreaterThan(0);
    });
  });
});
