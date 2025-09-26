import "@testing-library/jest-dom/vitest";
import { toHaveNoViolations } from "jest-axe";
import { expect, vi } from "vitest";

expect.extend(toHaveNoViolations);

// Mock navigation API for JSDOM
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock navigation for Next.js
Object.defineProperty(window, "history", {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
  writable: true,
});

// Mock fetch for navigation
global.fetch = vi.fn();

// Mock navigation API more comprehensively
Object.defineProperty(window, "navigation", {
  value: {
    navigate: vi.fn(),
    reload: vi.fn(),
    traverseTo: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    canGoBack: true,
    canGoForward: false,
  },
  writable: true,
});

// Mock HTMLHyperlinkElementUtils
Object.defineProperty(HTMLAnchorElement.prototype, "click", {
  value: vi.fn(),
  writable: true,
});

// Mock crypto.getRandomValues for testing environment
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
  writable: true,
});

// Mock window.confirm globally
Object.defineProperty(window, "confirm", {
  value: vi.fn(() => true),
  writable: true,
});

// Mock window.alert globally
Object.defineProperty(window, "alert", {
  value: vi.fn(),
  writable: true,
});

// Suppress navigation errors
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.("Not implemented: navigation")) {
    return;
  }
  originalConsoleError(...args);
};
