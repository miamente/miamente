import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AdminDashboard from '../page';

// Mock the UI components
interface MockButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: string;
  onClick?: () => void;
}

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, variant, onClick }: MockButtonProps) => (
    <button 
      data-testid="button" 
      className={className}
      data-variant={variant}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

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

// Mock the useAuthGuard hook
vi.mock('@/hooks/useAuthGuard', () => ({
  useAuthGuard: vi.fn(),
}));

// Mock UserRole
vi.mock('@/lib/types', () => ({
  UserRole: {
    ADMIN: 'admin',
  },
}));

describe('AdminDashboard', () => {
  const mockUseAuthGuard = vi.mocked(useAuthGuard);
  
  beforeEach(() => {
    mockUseAuthGuard.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthorized: false,
    });
  });

  it('should render loading state when isLoading is true', () => {
    mockUseAuthGuard.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthorized: false,
    });

    render(<AdminDashboard />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should render the admin dashboard when not loading', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Administrador')).toBeInTheDocument();
      expect(screen.getByText('Bienvenido al panel de administración')).toBeInTheDocument();
    });
  });

  it('should render all main sections', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Citas y Pagos')).toBeInTheDocument();
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
  });

  it('should render user management buttons', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ver Todos los Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Verificar Profesionales')).toBeInTheDocument();
      expect(screen.getByText('Gestionar Roles')).toBeInTheDocument();
    });
  });

  it('should render appointments and payments buttons', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ver Todas las Citas')).toBeInTheDocument();
      expect(screen.getByText('Gestionar Pagos')).toBeInTheDocument();
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });
  });

  it('should render configuration buttons', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Configuración')).toBeInTheDocument();
      expect(screen.getByText('Logs del Sistema')).toBeInTheDocument();
      expect(screen.getByText('Backup')).toBeInTheDocument();
    });
  });

  it('should render all buttons with outline variant', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      const outlineButtons = buttons.filter(button => 
        button.getAttribute('data-variant') === 'outline'
      );
      
      expect(outlineButtons.length).toBeGreaterThan(0);
    });
  });

  it('should render cards with proper structure', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('card');
      const cardHeaders = screen.getAllByTestId('card-header');
      const cardContents = screen.getAllByTestId('card-content');
      
      expect(cards.length).toBe(3); // Usuarios, Citas y Pagos, Configuración
      expect(cardHeaders.length).toBe(3);
      expect(cardContents.length).toBe(3);
    });
  });

  it('should call useAuthGuard with correct parameters', () => {
    render(<AdminDashboard />);

    expect(mockUseAuthGuard).toHaveBeenCalledWith({
      requiredRole: 'admin',
    });
  });
});
