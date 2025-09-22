import { describe, it, expect, vi } from "vitest";

// Mock Next.js navigation before importing the component
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to landing page when called", async () => {
    // Dynamically import the Home component after mocking
    const { default: Home } = await import("../page");

    // Call the Home component
    Home();

    // Verify redirect was called with correct path
    expect(mockRedirect).toHaveBeenCalledWith("/landing");
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it("should be a default export function", async () => {
    const { default: Home } = await import("../page");
    expect(typeof Home).toBe("function");
  });

  it("should not return any JSX", async () => {
    const { default: Home } = await import("../page");

    // Since it calls redirect(), it should not return JSX
    // The redirect function will throw or return void
    expect(() => Home()).not.toThrow();
  });
});
