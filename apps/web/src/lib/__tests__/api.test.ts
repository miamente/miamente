import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ApiClient } from "../api";

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ApiClient", () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient = new ApiClient();
    localStorageMock.getItem.mockReturnValue("test-token");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with base URL", () => {
    // Test that the API client is properly initialized
    expect(apiClient).toBeDefined();
  });

  it("should handle token storage", () => {
    // Test token storage through public methods
    apiClient.setToken("new-token");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "new-token");
  });

  it("should clear token when requested", () => {
    apiClient.clearToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
  });

  it("should make GET request with authorization header", async () => {
    const mockResponse = { data: "test" };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    // Set the token in the ApiClient
    apiClient.setToken("test-token");
    const result = await apiClient.get("/test");

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/test`,
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it("should make POST request with data", async () => {
    const mockData = { email: "test@example.com", password: "password123" };
    const mockResponse = { success: true };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiClient.post("/login", mockData);

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/login`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        }),
        body: JSON.stringify(mockData),
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it("should handle API errors", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: () => Promise.resolve({ detail: "Unauthorized" }),
    } as Response);

    await expect(apiClient.get("/protected")).rejects.toThrow("Unauthorized");
  });

  it("should handle network errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    await expect(apiClient.get("/test")).rejects.toThrow("Network error");
  });

  it("should login user and store token", async () => {
    const credentials = { email: "test@example.com", password: "password123" };
    const mockResponse = {
      user: { id: "1", email: "test@example.com" },
      access_token: "new-token",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiClient.loginUser(credentials);

    expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "new-token");
    expect(result).toEqual(mockResponse);
  });

  it("should logout and clear token", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await apiClient.logout();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
  });

  it("should get current user with stored token", async () => {
    const mockUser = { id: "1", email: "test@example.com", full_name: "Test User" };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    } as Response);

    const result = await apiClient.getCurrentUser();

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/me`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toEqual(mockUser);
  });
});
