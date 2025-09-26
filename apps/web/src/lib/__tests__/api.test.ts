import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ApiClient } from "../api";

// Test password - use environment variable or fallback for test data
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || "password123";

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
      "/api/v1/test",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it("should make POST request with data", async () => {
    const mockData = { email: "test@example.com", password: TEST_PASSWORD };
    const mockResponse = { success: true };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiClient.post("/login", mockData);

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/login",
      expect.objectContaining({
        method: "POST",
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
    const credentials = { email: "test@example.com", password: TEST_PASSWORD };
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
      "/api/v1/auth/me",
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

  // Additional comprehensive tests for better coverage
  describe("HTTP Methods", () => {
    it("should make PUT request", async () => {
      const mockData = { name: "Updated Name" };
      const mockResponse = { success: true };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.put("/users/1", mockData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(mockData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should make PATCH request", async () => {
      const mockData = { email: "new@example.com" };
      const mockResponse = { success: true };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.patch("/users/1", mockData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(mockData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should make DELETE request", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await apiClient.delete("/users/1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("Authentication Methods", () => {
    it("should login professional and store token", async () => {
      const credentials = { email: "prof@example.com", password: TEST_PASSWORD };
      const mockResponse = {
        professional: { id: "1", email: "prof@example.com" },
        access_token: "prof-token",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.loginProfessional(credentials);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login/professional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(credentials),
        }),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "prof-token");
      expect(result).toEqual(mockResponse);
    });

    it("should register user", async () => {
      const userData = {
        email: "new@example.com",
        password: TEST_PASSWORD,
        full_name: "New User",
      };
      const mockResponse = { id: "1", email: "new@example.com" };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.registerUser(userData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register/user"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(userData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should register professional", async () => {
      const professionalData = {
        email: "newprof@example.com",
        password: TEST_PASSWORD,
        full_name: "New Professional",
        specialty: "Psychology",
        rate_cents: 10000,
      };
      const mockResponse = { id: "1", email: "newprof@example.com" };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.registerProfessional(professionalData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register/professional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(professionalData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("User Methods", () => {
    it("should get user by id", async () => {
      const mockUser = { id: "1", email: "user@example.com" };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const result = await apiClient.getUser("1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockUser);
    });

    it("should update user", async () => {
      const updateData = { full_name: "Updated Name" };
      const mockResponse = { id: "1", full_name: "Updated Name" };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.updateUser("1", updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should delete user", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await apiClient.deleteUser("1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("Professional Methods", () => {
    it("should get professional by id", async () => {
      const mockProfessional = { id: "1", email: "prof@example.com" };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfessional),
      } as Response);

      const result = await apiClient.getProfessional("1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/professionals/1"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockProfessional);
    });

    it("should get professionals with parameters", async () => {
      const mockResponse = [{ id: "1", email: "test@example.com", full_name: "Test Professional" }];
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.getProfessionals({
        skip: 0,
        limit: 10,
        specialty: "Psychology",
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/professionals?limit=10&specialty=Psychology"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get professionals without parameters", async () => {
      const mockResponse = [{ id: "1", email: "test@example.com", full_name: "Test Professional" }];
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.getProfessionals();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/professionals"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should update professional", async () => {
      const updateData = { bio: "Updated bio" };
      const mockResponse = { id: "1", bio: "Updated bio" };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.updateProfessional("1", updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/professionals/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should delete professional", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await apiClient.deleteProfessional("1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/professionals/1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle error responses without JSON", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as Response);

      await expect(apiClient.get("/test")).rejects.toThrow("HTTP 500: Internal Server Error");
    });

    it("should handle no token scenario", () => {
      localStorageMock.getItem.mockReturnValue(null);
      const newApiClient = new ApiClient();

      // Test that it doesn't crash when no token is present
      expect(newApiClient).toBeDefined();
    });

    it("should handle server-side environment (no window)", () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side environment
      delete global.window;

      const serverApiClient = new ApiClient();
      serverApiClient.setToken("test-token");
      serverApiClient.clearToken();

      // Restore window
      global.window = originalWindow;

      expect(serverApiClient).toBeDefined();
    });
  });

  describe("Token Management", () => {
    it("should refresh token from localStorage on getCurrentUser", async () => {
      localStorageMock.getItem.mockReturnValue("updated-token");
      const mockUser = { id: "1", email: "test@example.com" };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      await apiClient.getCurrentUser();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("access_token");
      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer updated-token",
          }),
        }),
      );
    });
  });
});
