import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminLoginLayout from '../layout';

describe('AdminLoginLayout', () => {
  it('should render children correctly', () => {
    render(
      <AdminLoginLayout>
        <div data-testid="test-child">Test Content</div>
      </AdminLoginLayout>
    );

    const child = screen.getByTestId('test-child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Content');
  });

  it('should render multiple children', () => {
    render(
      <AdminLoginLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </AdminLoginLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should render without children', () => {
    const { container } = render(<AdminLoginLayout>{null}</AdminLoginLayout>);
    // Should not throw any errors and container should be rendered
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});
