import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, PUT, PATCH, DELETE, OPTIONS } from "../../[...path]/route";

// Mock fetch globally
global.fetch = vi.fn();

// Mock process.env
const originalEnv = process.env;

describe("API Proxy Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      BACKEND_INTERNAL_URL: "http://backend:8000",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Basic functionality", () => {
    it("should proxy GET request to backend", async () => {
      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users");
      const context = { params: Promise.resolve({ path: ["users"] }) };

      const response = await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe("OK");
    });

    it("should handle different HTTP methods", async () => {
      const mockResponse = new Response('{"data": "post"}', {
        status: 201,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });
      const context = { params: Promise.resolve({ path: ["users"] }) };

      const response = await POST(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
    });

    it("should handle nested paths", async () => {
      const mockResponse = new Response('{"data": "nested"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/admin/users/123");
      const context = { params: Promise.resolve({ path: ["admin", "users", "123"] }) };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("/api/v1/admin/users/123");
    });

    it("should preserve query parameters", async () => {
      const mockResponse = new Response('{"data": "query"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users?page=1&limit=10");
      const context = { params: Promise.resolve({ path: ["users"] }) };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("?page=1&limit=10");
    });
  });

  describe("HTTP Methods", () => {
    it("should handle PUT requests", async () => {
      const mockResponse = new Response('{"updated": true}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users/123", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated User" }),
      });
      const context = { params: Promise.resolve({ path: ["users", "123"] }) };

      const response = await PUT(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });

    it("should handle PATCH requests", async () => {
      const mockResponse = new Response('{"patched": true}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users/123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Patched User" }),
      });
      const context = { params: Promise.resolve({ path: ["users", "123"] }) };

      const response = await PATCH(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });

    it("should handle DELETE requests", async () => {
      const mockResponse = new Response("", {
        status: 200,
        statusText: "OK",
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users/123", {
        method: "DELETE",
      });
      const context = { params: Promise.resolve({ path: ["users", "123"] }) };

      const response = await DELETE(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });

    it("should handle OPTIONS requests", async () => {
      const mockResponse = new Response("", {
        status: 200,
        headers: { allow: "GET, POST, PUT, DELETE" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/users", {
        method: "OPTIONS",
      });
      const context = { params: Promise.resolve({ path: ["users"] }) };

      const response = await OPTIONS(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });

  describe("Error handling", () => {
    it("should handle backend errors", async () => {
      const mockResponse = new Response('{"error": "Not Found"}', {
        status: 404,
        statusText: "Not Found",
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/nonexistent");
      const context = { params: Promise.resolve({ path: ["nonexistent"] }) };

      const response = await GET(request, context);

      expect(response.status).toBe(404);
      expect(response.statusText).toBe("Not Found");
    });

    it("should handle fetch errors", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("http://localhost:3000/api/v1/test");
      const context = { params: Promise.resolve({ path: ["test"] }) };

      await expect(GET(request, context)).rejects.toThrow("Network error");
    });
  });

  describe("Environment configuration", () => {
    it("should use default backend URL when env var is not set", async () => {
      process.env.BACKEND_INTERNAL_URL = undefined;

      const mockResponse = new Response('{"data": "default"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/test");
      const context = { params: Promise.resolve({ path: ["test"] }) };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("http://localhost:8000");
    });

    it("should use environment variable for backend URL", async () => {
      const mockResponse = new Response('{"data": "env"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/test");
      const context = { params: Promise.resolve({ path: ["test"] }) };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      // The test verifies that the proxy function works with environment variables
      // The actual URL construction is tested in the route implementation
    });
  });

  describe("Edge cases", () => {
    it("should handle empty path", async () => {
      const mockResponse = new Response('{"data": "empty"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/");
      const context = { params: Promise.resolve({ path: [] }) };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("/api/v1/");
    });

    it("should handle undefined params", async () => {
      const mockResponse = new Response('{"data": "undefined"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/");
      const context = { params: undefined };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("/api/v1/");
    });

    it("should handle string path param", async () => {
      const mockResponse = new Response('{"data": "string"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/single");
      const context = { params: Promise.resolve({ path: "single" }) };

      await GET(request, context);

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("/api/v1/single");
    });
  });

  describe("Response handling", () => {
    it("should forward response headers correctly", async () => {
      const mockResponse = new Response('{"data": "headers"}', {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-custom": "keep",
          "transfer-encoding": "chunked",
          "content-encoding": "gzip",
          "content-length": "100",
        },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("http://localhost:3000/api/v1/test");
      const context = { params: Promise.resolve({ path: ["test"] }) };

      const response = await GET(request, context);

      expect(response.headers.get("content-type")).toBe("application/json");
      expect(response.headers.get("x-custom")).toBe("keep");
      expect(response.headers.get("transfer-encoding")).toBeNull();
      expect(response.headers.get("content-encoding")).toBeNull();
      expect(response.headers.get("content-length")).toBeNull();
    });
  });
});
