import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpecialtiesMultiSelect } from '../SpecialtiesMultiSelect';
import { useSpecialties } from '@/hooks/useSpecialties';

// Mock the hooks
vi.mock('@/hooks/useSpecialties', () => ({
  useSpecialties: vi.fn(),
}));

// Mock the sub-components
vi.mock('../specialties-multi-select', () => ({
  useSpecialtySelection: vi.fn(() => ({
    handleAdd: vi.fn(),
    handleRemove: vi.fn(),
  })),
  useSpecialtyData: vi.fn(() => ({
    selectedSpecialties: [],
    availableSpecialties: [],
  })),
  LoadingState: ({ label }: { label: string }) => (
    <div data-testid="loading-state">Loading {label}</div>
  ),
  ErrorState: ({ label, error }: { label: string; error: string }) => (
    <div data-testid="error-state">Error in {label}: {error}</div>
  ),
  SelectedSpecialtiesList: ({ specialties, onRemove }: { specialties?: Array<{ id: string; name: string }>; onRemove: (id: string) => void }) => (
    <div data-testid="selected-specialties-list">
      {(specialties || []).map((specialty) => (
        <div key={specialty.id} data-testid={`selected-specialty-${specialty.id}`}>
          {specialty.name}
          <button onClick={() => onRemove(specialty.id)}>Remove</button>
        </div>
      ))}
    </div>
  ),
  SpecialtySelector: ({ specialties, onAdd, disabled }: { specialties?: Array<{ id: string; name: string }>; onAdd: (value: string) => void; disabled?: boolean }) => (
    <div data-testid="specialty-selector">
      <select 
        data-testid="specialty-select"
        onChange={(e) => onAdd(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select specialty</option>
        {(specialties || []).map((specialty) => (
          <option key={specialty.id} value={specialty.id}>
            {specialty.name}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label data-testid="label" htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  HelpCircle: () => <div data-testid="help-circle-icon">HelpCircle</div>,
}));

describe('SpecialtiesMultiSelect', () => {
  const mockUseSpecialties = vi.mocked(useSpecialties);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when loading is true', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: true,
      error: null,
    });

    render(<SpecialtiesMultiSelect />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading Especialidades')).toBeInTheDocument();
  });

  it('should render error state when error exists', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: 'Failed to load specialties',
    });

    render(<SpecialtiesMultiSelect />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Error in Especialidades: Failed to load specialties')).toBeInTheDocument();
  });

  it('should render the main component when not loading and no error', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
    });

    render(<SpecialtiesMultiSelect />);

    expect(screen.getByTestId('selected-specialties-list')).toBeInTheDocument();
    expect(screen.getByTestId('specialty-selector')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
    });

    render(<SpecialtiesMultiSelect label="Custom Label" />);

    expect(screen.getByTestId('label')).toHaveTextContent('Custom Label');
  });

  it('should render help tooltip when provided', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
    });

    render(
      <SpecialtiesMultiSelect 
        label="Especialidades"
        aria-describedby="help-text"
      />
    );

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
  });

  it('should pass disabled prop to specialty selector', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
    });

    render(<SpecialtiesMultiSelect disabled={true} />);

    const select = screen.getByTestId('specialty-select');
    expect(select).toBeDisabled();
  });

  it('should render with default props', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
    });

    render(<SpecialtiesMultiSelect />);

    expect(screen.getByTestId('label')).toHaveTextContent('Especialidades');
    expect(screen.getByTestId('specialty-selector')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    mockUseSpecialties.mockReturnValue({
      specialties: [],
      loading: false,
      error: null,
    });

    render(
      <SpecialtiesMultiSelect 
        aria-label="Custom aria label"
        aria-describedby="description-id"
      />
    );

    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveAttribute('aria-label', 'Custom aria label');
    expect(fieldset).toHaveAttribute('aria-describedby', 'description-id');
  });
});
