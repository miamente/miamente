import { describe, it, expect, vi } from "vitest";
import { middleware, config } from "../middleware";
import type { NextRequest } from "next/server.js";

// Mock Next.js server
vi.mock("next/server.js", () => ({
  NextResponse: {
    next: vi.fn(() => ({ status: 200, type: "next" })),
    redirect: vi.fn(() => ({ status: 302, type: "redirect" })),
  },
}));

describe("middleware", () => {
  it("should return NextResponse.next() for non-admin subdomain", () => {
    const mockRequest = {
      nextUrl: { pathname: "/" },
      headers: { get: vi.fn(() => "example.com") },
    } as unknown as NextRequest;

    const result = middleware(mockRequest);

    expect(result).toBeDefined();
    expect(result).toEqual({ status: 200, type: "next" });
  });

  it("should have correct matcher configuration", () => {
    expect(config.matcher).toEqual(["/((?!api|_next/static|_next/image|favicon.ico).*)"]);
  });

  it("should export both middleware function and config", () => {
    expect(typeof middleware).toBe("function");
    expect(typeof config).toBe("object");
    expect(config).toHaveProperty("matcher");
  });
});
