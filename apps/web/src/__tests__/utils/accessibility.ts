import { axe, toHaveNoViolations } from "jest-axe";
import { RenderResult } from "@testing-library/react";
import "@testing-library/jest-dom";

// Extend Jest matchers for accessibility
expect.extend(toHaveNoViolations);

/**
 * Utility function to test accessibility violations using axe-core
 * @param renderResult - The result from render() function
 * @param options - Optional axe configuration
 */
export const testAccessibility = async (
  renderResult: RenderResult,
  options?: Record<string, unknown>,
) => {
  const { container } = renderResult;
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Common accessibility test cases that can be reused across components
 */
export const commonAccessibilityTests = {
  /**
   * Test that a component has proper focus management
   */
  focusManagement: async (renderResult: RenderResult) => {
    const { container } = renderResult;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    // Ensure focusable elements are keyboard accessible
    focusableElements.forEach((element) => {
      expect(element).not.toHaveAttribute("tabindex", "-1");
    });

    await testAccessibility(renderResult);
  },

  /**
   * Test that form elements have proper labels and descriptions
   */
  formAccessibility: async (renderResult: RenderResult) => {
    const { container } = renderResult;
    const inputs = container.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      const hasLabel =
        input.hasAttribute("aria-label") ||
        input.hasAttribute("aria-labelledby") ||
        container.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
        console.warn(`Input element without proper label:`, input);
      }
    });

    await testAccessibility(renderResult);
  },

  /**
   * Test that interactive elements have proper ARIA attributes
   */
  interactiveElements: async (renderResult: RenderResult) => {
    const { container } = renderResult;
    const buttons = container.querySelectorAll("button");

    buttons.forEach((button) => {
      // Buttons should have accessible text content or aria-label
      const hasAccessibleName =
        button.textContent?.trim() ||
        button.hasAttribute("aria-label") ||
        button.hasAttribute("aria-labelledby");

      if (!hasAccessibleName) {
        console.warn(`Button without accessible name:`, button);
      }
    });

    await testAccessibility(renderResult);
  },

  /**
   * Test that images have proper alt text
   */
  imageAccessibility: async (renderResult: RenderResult) => {
    const { container } = renderResult;
    const images = container.querySelectorAll("img");

    images.forEach((img) => {
      // Images should have alt attribute (can be empty for decorative images)
      expect(img).toHaveAttribute("alt");
    });

    await testAccessibility(renderResult);
  },
};

/**
 * Accessibility configuration for testing specific rules
 */
export const accessibilityConfig = {
  // Test only color contrast
  colorContrast: {
    rules: {
      "color-contrast": { enabled: true },
    },
  },

  // Test keyboard navigation
  keyboard: {
    rules: {
      keyboard: { enabled: true },
      "focus-order-semantics": { enabled: true },
    },
  },

  // Test ARIA usage
  aria: {
    rules: {
      "aria-valid-attr": { enabled: true },
      "aria-valid-attr-value": { enabled: true },
      "aria-roles": { enabled: true },
    },
  },
};
