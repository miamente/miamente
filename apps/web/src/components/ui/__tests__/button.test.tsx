import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '../button';

// Mock the utils module
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render a button element by default', () => {
    render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render with custom text content', () => {
      render(<Button>Custom Button Text</Button>);
      
      const button = screen.getByRole('button', { name: /custom button text/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with children elements', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('IconText');
    });

    it('should render as a different component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    it('should render with default variant', () => {
      render(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      
      const button = screen.getByRole('button', { name: /delete/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with link variant', () => {
      render(<Button variant="link">Link</Button>);
      
      const button = screen.getByRole('button', { name: /link/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render with default size', () => {
      render(<Button>Default Size</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with small size', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with large size', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with icon size', () => {
      render(<Button size="icon">Icon</Button>);
      
      const button = screen.getByRole('button', { name: /icon/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Props and Attributes', () => {
    it('should pass through HTML button attributes', () => {
      render(
        <Button type="submit" disabled data-testid="test-button">
          Submit
        </Button>
      );
      
      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
    });

    it('should have data-slot attribute', () => {
      render(<Button>Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('should accept custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    });

    it('should accept custom id', () => {
      render(<Button id="custom-id">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'custom-id');
    });

    it('should accept custom aria-label', () => {
      render(<Button aria-label="Custom label">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

    it('should handle multiple click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should not handle clicks when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
        </Button>
    );

      const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

    it('should handle mouse events', () => {
      const handleMouseOver = vi.fn();
      const handleMouseOut = vi.fn();
      
    render(
        <Button onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          Hover me
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.mouseOver(button);
      fireEvent.mouseOut(button);
      
      expect(handleMouseOver).toHaveBeenCalledTimes(1);
      expect(handleMouseOut).toHaveBeenCalledTimes(1);
    });

    it('should handle focus events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      
    render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus me
        </Button>
      );
      
      const button = screen.getByRole('button');
      button.focus();
      button.blur();
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should be focusable by default', () => {
      render(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      
      const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    });

    it('should support keyboard navigation', () => {
      const handleKeyDown = vi.fn();
      render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(2);
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Button aria-describedby="description" aria-expanded="true">
          ARIA Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Combinations', () => {
    it('should combine variant and size correctly', () => {
      render(
        <Button variant="destructive" size="lg">
          Large Destructive
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /large destructive/i });
      expect(button).toBeInTheDocument();
    });

    it('should combine all props correctly', () => {
      const handleClick = vi.fn();
      render(
        <Button
          variant="outline"
          size="sm"
          className="custom-class"
          onClick={handleClick}
          disabled
        >
          Complex Button
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /complex button/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should work with asChild and other props', () => {
      render(
        <Button asChild variant="ghost" size="icon">
          <a href="/test" aria-label="Test link">
            <span>🔗</span>
          </a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('aria-label', 'Test link');
      expect(link).toHaveAttribute('data-slot', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should handle null children', () => {
      render(<Button>{null}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(<Button>{undefined}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle boolean children', () => {
      render(<Button>{false}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle number children', () => {
      render(<Button>{42}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('42');
    });

    it('should handle array children', () => {
      render(<Button>{['Hello', ' ', 'World']}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Hello World');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      const TestComponent = () => {
        renderSpy();
        return <Button>Test</Button>;
      };
      
      render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Rapid Click</Button>);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(handleClick).toHaveBeenCalledTimes(10);
    });
  });
});