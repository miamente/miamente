/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<T, void> {
    // Extend with vitest-specific matchers if needed
    toBeInTheDocument(): void;
  }
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {
    // Extend with vitest-specific matchers if needed
    toBeInTheDocument(): void;
  }
}
