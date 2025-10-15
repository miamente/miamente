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

  it("should login and store token", async () => {
    const email = "test@example.com";
    const password = TEST_PASSWORD;
    const mockResponse = {
      account: { id: "1", email: "test@example.com" },
      access_token: "new-token",
      role: "user",
      profile: {},
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiClient.login(email, password);

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
    const mockResponse = {
      account: { id: "1", email: "test@example.com", full_name: "Test User" },
      role: "user",
      profile: {},
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiClient.getCurrentUser();

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/accounts/me",
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
    it("should register user", async () => {
      const userData = {
        email: "new@example.com",
        password: TEST_PASSWORD,
        full_name: "New User",
        phone_country_code: "+57",
        phone_number: "3001234567",
        date_of_birth: "1990-01-01",
        emergency_contact_name: "Emergency Contact",
        emergency_contact_relationship: "Parent",
        emergency_contact_phone: "+573009876543",
      };
      const mockResponse = {
        account: { id: "1", email: "new@example.com" },
        access_token: "new-token",
        role: "user",
        profile: {},
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.registerUser(userData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/register/user"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(userData),
        }),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "new-token");
      expect(result).toEqual(mockResponse);
    });

    it("should register professional", async () => {
      const professionalData = {
        email: "newprof@example.com",
        password: TEST_PASSWORD,
        full_name: "New Professional",
        phone_country_code: "+57",
        phone_number: "3001234567",
        date_of_birth: "1985-01-01",
        emergency_contact_name: "Emergency Contact",
        emergency_contact_relationship: "Spouse",
        emergency_contact_phone: "+573009876543",
        license_number: "PSY-12345",
        years_experience: 5,
        rate_cents: 10000,
        currency: "USD",
        short_description: "Professional description",
        languages: ["Spanish", "English"],
        timezone: "America/Bogota",
      };
      const mockResponse = {
        account: { id: "1", email: "newprof@example.com" },
        access_token: "prof-token",
        role: "professional",
        profile: {},
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.registerProfessional(professionalData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/register/professional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(professionalData),
        }),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "prof-token");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Account Methods", () => {
    it("should get account by id", async () => {
      const mockResponse = {
        account: { id: "1", email: "user@example.com" },
        role: "user",
        profile: {},
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.getAccountById("1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/1"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should update account", async () => {
      const updateData = { full_name: "Updated Name" };
      const mockResponse = {
        account: { id: "1", full_name: "Updated Name" },
        role: "user",
        profile: {},
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.updateAccount("1", updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should delete account", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await apiClient.deleteAccount("1");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("should toggle account status", async () => {
      const mockResponse = {
        account: { id: "1", is_active: false },
        role: "user",
        profile: {},
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.toggleAccountStatus("1", false);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/1/status"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ is_active: false }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get all accounts (admin)", async () => {
      const mockResponse = {
        items: [{ id: "1", email: "user@example.com" }],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiClient.getAllAccountsAdmin();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/admin/all"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
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
