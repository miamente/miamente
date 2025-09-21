import { describe, it, expect, vi } from "vitest";
import { middleware, config } from "../middleware";

// Mock Next.js server
vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ status: 200, type: "next" })),
  },
}));

describe("middleware", () => {
  it("should return NextResponse.next()", () => {
    const result = middleware();

    expect(result).toBeDefined();
    expect(result).toEqual({ status: 200, type: "next" });
  });

  it("should have correct matcher configuration", () => {
    expect(config.matcher).toEqual(["/((?!_next|.*\\..*).*)"]);
  });

  it("should export both middleware function and config", () => {
    expect(typeof middleware).toBe("function");
    expect(typeof config).toBe("object");
    expect(config).toHaveProperty("matcher");
  });
});
