import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getProfessionalProfile,
  updateProfessionalProfileById,
  getMyProfessionalProfile,
  updateProfessionalProfile,
  createProfessionalProfile,
  queryProfessionals,
  getUserProfile,
  updateUserProfile,
} from "../profiles";
import { apiClient } from "../api";

// Mock the API client
vi.mock("../api", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    getAccountById: vi.fn(),
    updateAccount: vi.fn(),
    getCurrentUser: vi.fn(),
    getAllAccountsAdmin: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe("profiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProfessional = {
    id: "prof-123",
    full_name: "Dr. John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    bio: "Experienced therapist with 10 years of practice",
    license_number: "LIC123456",
    years_experience: 10,
    specialties: ["Anxiety", "Depression"],
    therapeutic_approaches: ["CBT", "Psychodynamic"],
    modalities: [
      {
        id: "mod-1",
        modalityId: "virtual",
        modalityName: "Virtual",
        virtualPrice: 50000,
        presencialPrice: 0,
        offersPresencial: false,
        description: "Online therapy sessions",
        isDefault: true,
      },
    ],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  const mockUser = {
    id: "user-123",
    full_name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567890",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfessionalProfile", () => {
    it("should get professional profile successfully", async () => {
      // Mock AccountWithProfile response
      mockApiClient.getAccountById.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: mockProfessional.email,
          full_name: mockProfessional.full_name,
          phone: mockProfessional.phone,
          is_active: true,
          is_verified: true,
          created_at: mockProfessional.created_at,
          updated_at: mockProfessional.updated_at,
          role_name: "professional",
        },
        role: "professional",
        profile: {
          account_id: "prof-123",
          license_number: mockProfessional.license_number,
          years_experience: mockProfessional.years_experience,
          rate_cents: 50000,
          currency: "COP",
          short_description: mockProfessional.bio,
          timezone: "America/Bogota",
        },
      });

      const result = await getProfessionalProfile("prof-123");

      expect(mockApiClient.getAccountById).toHaveBeenCalledWith("prof-123");
      expect(result.id).toBe("prof-123");
      expect(result.full_name).toBe(mockProfessional.full_name);
    });

    it("should handle API errors", async () => {
      mockApiClient.getAccountById.mockRejectedValue(new Error("Professional not found"));

      await expect(getProfessionalProfile("prof-123")).rejects.toThrow("Professional not found");
    });
  });

  describe("updateProfessionalProfileById", () => {
    it("should update professional profile successfully", async () => {
      const updateData = {
        full_name: "Dr. John Smith",
        bio: "Updated bio",
        years_experience: 12,
      };

      // Mock updateAccount
      mockApiClient.updateAccount.mockResolvedValue({
        account: {
          id: "prof-123",
          full_name: "Dr. John Smith",
          role_name: "professional",
        },
        role: "professional",
        profile: {},
      });
      
      // Mock getProfessionalProfile (called after update)
      mockApiClient.getAccountById.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: "john@example.com",
          full_name: "Dr. John Smith",
          phone: "+1234567890",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
          role_name: "professional",
        },
        role: "professional",
        profile: {
          account_id: "prof-123",
          years_experience: 12,
          rate_cents: 50000,
          currency: "COP",
          short_description: "Updated bio",
          timezone: "America/Bogota",
        },
      });

      const result = await updateProfessionalProfileById("prof-123", updateData);

      expect(mockApiClient.updateAccount).toHaveBeenCalled();
      expect(result.full_name).toBe("Dr. John Smith");
    });

    it("should handle API errors", async () => {
      mockApiClient.updateAccount.mockRejectedValue(new Error("Update failed"));

      await expect(
        updateProfessionalProfileById("prof-123", { full_name: "New Name" }),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("getMyProfessionalProfile", () => {
    it("should get my professional profile successfully", async () => {
      // Mock getCurrentUser
      mockApiClient.getCurrentUser.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: mockProfessional.email,
          full_name: mockProfessional.full_name,
          phone: mockProfessional.phone,
          is_active: true,
          is_verified: true,
          created_at: mockProfessional.created_at,
          role_name: "professional",
        },
        role: "professional",
        profile: {
          account_id: "prof-123",
          years_experience: 10,
          rate_cents: 50000,
          currency: "COP",
          short_description: mockProfessional.bio,
          timezone: "America/Bogota",
        },
      });
      
      // Mock getAccountById
      mockApiClient.getAccountById.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: mockProfessional.email,
          full_name: mockProfessional.full_name,
          phone: mockProfessional.phone,
          is_active: true,
          is_verified: true,
          created_at: mockProfessional.created_at,
          role_name: "professional",
        },
        role: "professional",
        profile: {
          account_id: "prof-123",
          years_experience: 10,
          rate_cents: 50000,
          currency: "COP",
          short_description: mockProfessional.bio,
          timezone: "America/Bogota",
        },
      });

      const result = await getMyProfessionalProfile();

      expect(mockApiClient.getCurrentUser).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe("prof-123");
    });

    it("should return null on error", async () => {
      mockApiClient.getCurrentUser.mockRejectedValue(new Error("Profile not found"));

      const result = await getMyProfessionalProfile();

      expect(result).toBe(null);
    });
  });

  describe("updateProfessionalProfile", () => {
    it("should update professional profile successfully", async () => {
      const updateData = {
        full_name: "Dr. John Smith",
        bio: "Updated bio",
        specialty_ids: ["spec-1", "spec-2"],
      };

      // Mock getCurrentUser
      mockApiClient.getCurrentUser.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: "test@example.com",
          full_name: "Dr. Test",
          phone: "+1234567890",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
          role_name: "professional",
        },
        role: "professional",
        profile: {},
      });
      
      // Mock updateAccount
      mockApiClient.updateAccount.mockResolvedValue({
        account: {
          id: "prof-123",
          full_name: "Dr. John Smith",
          role_name: "professional",
        },
        role: "professional",
        profile: {},
      });
      
      // Mock getAccountById (for getProfessionalProfile)
      mockApiClient.getAccountById.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: "test@example.com",
          full_name: "Dr. John Smith",
          phone: "+1234567890",
          is_active: true,
          is_verified: true,
          created_at: "2023-01-01T00:00:00Z",
          role_name: "professional",
        },
        role: "professional",
        profile: {
          account_id: "prof-123",
          years_experience: 10,
          rate_cents: 50000,
          currency: "COP",
          short_description: "Updated bio",
          timezone: "America/Bogota",
        },
      });

      const result = await updateProfessionalProfile(updateData);

      expect(mockApiClient.getCurrentUser).toHaveBeenCalled();
      expect(result.full_name).toBe("Dr. John Smith");
    });

    it("should handle API errors", async () => {
      mockApiClient.getCurrentUser.mockRejectedValue(new Error("Update failed"));

      await expect(updateProfessionalProfile({ full_name: "New Name" })).rejects.toThrow(
        "Update failed",
      );
    });
  });

  describe("createProfessionalProfile", () => {
    it("should create professional profile successfully", async () => {
      const profileData = {
        full_name: "Dr. New Professional",
        bio: "New professional bio",
        license_number: "LIC789",
        years_experience: 5,
      };

      // This function is deprecated and should throw
      await expect(createProfessionalProfile(profileData)).rejects.toThrow(
        "Professional profiles are now created during registration"
      );
    });

    it("should handle API errors", async () => {
      // This function is deprecated and should throw
      await expect(createProfessionalProfile({ full_name: "New Name" })).rejects.toThrow(
        "Professional profiles are now created during registration"
      );
    });
  });

  describe("queryProfessionals", () => {
    it("should query professionals successfully without filters", async () => {
      mockApiClient.getAllAccountsAdmin.mockResolvedValue({
        items: [{
          id: "prof-123",
          role_id: "prof-role",
          email: mockProfessional.email,
          full_name: mockProfessional.full_name,
          phone: mockProfessional.phone,
          is_active: true,
          is_verified: true,
          created_at: mockProfessional.created_at,
          role_name: "professional",
        }],
        total: 1,
        page: 1,
        page_size: 100,
        total_pages: 1,
      });
      
      mockApiClient.getAccountById.mockResolvedValue({
        account: {
          id: "prof-123",
          role_id: "prof-role",
          email: mockProfessional.email,
          full_name: mockProfessional.full_name,
          phone: mockProfessional.phone,
          is_active: true,
          is_verified: true,
          created_at: mockProfessional.created_at,
          role_name: "professional",
        },
        role: "professional",
        profile: {
          account_id: "prof-123",
          years_experience: 10,
          rate_cents: 50000,
          currency: "COP",
          short_description: mockProfessional.bio,
          timezone: "America/Bogota",
        },
      });

      const result = await queryProfessionals();

      expect(mockApiClient.getAllAccountsAdmin).toHaveBeenCalled();
      expect(result.professionals).toHaveLength(1);
      expect(result.lastSnapshot).toBeNull();
    });

    it("should query professionals with filters", async () => {
      const professionals = [mockProfessional];
      const filters = {
        specialty: "Anxiety",
        location: "Virtual",
        minPrice: 40000,
      };

      mockApiClient.get.mockResolvedValue(professionals);

      const result = await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?specialty=Anxiety&location=Virtual&minPrice=40000",
      );
      expect(result).toEqual({
        professionals,
        lastSnapshot: null,
      });
    });

    it("should handle empty filters", async () => {
      const professionals = [mockProfessional];
      const filters = {
        specialty: "",
        location: null,
        minPrice: undefined,
      };

      mockApiClient.get.mockResolvedValue(professionals);

      const result = await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith("/professionals");
      expect(result).toEqual({
        professionals,
        lastSnapshot: null,
      });
    });

    it("should handle API errors gracefully", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Query failed"));

      const result = await queryProfessionals();

      expect(result).toEqual({
        professionals: [],
        lastSnapshot: null,
      });
    });

    it("should handle non-array response", async () => {
      mockApiClient.get.mockResolvedValue({ error: "Invalid response" });

      const result = await queryProfessionals();

      expect(result).toEqual({
        professionals: [],
        lastSnapshot: null,
      });
    });
  });

  describe("getUserProfile", () => {
    it("should get user profile successfully", async () => {
      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await getUserProfile("user-123");

      expect(mockApiClient.get).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(mockUser);
    });

    it("should return null on error", async () => {
      mockApiClient.get.mockRejectedValue(new Error("User not found"));

      const result = await getUserProfile("user-123");

      expect(result).toBe(null);
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        full_name: "Jane Doe",
        phone: "+9876543210",
      };

      const updatedUser = { ...mockUser, ...updateData };
      // Clear any previous mocks and set up fresh mock
      mockApiClient.put.mockClear();
      mockApiClient.put.mockResolvedValue(updatedUser);

      const result = await updateUserProfile("user-123", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/users/me", updateData);
      expect(result).toEqual(updatedUser);
    });

    it("should handle API errors", async () => {
      mockApiClient.put.mockRejectedValue(new Error("Update failed"));

      await expect(updateUserProfile("user-123", { full_name: "New Name" })).rejects.toThrow(
        "Update failed",
      );
    });
  });

  describe("error handling", () => {
    it("should handle different types of errors", async () => {
      const errors = [
        new Error("Network error"),
        new Error("Server error"),
        "String error",
        { message: "Object error" },
        null,
        undefined,
      ];

      for (const error of errors) {
        mockApiClient.get.mockRejectedValueOnce(error);

        const result = await getMyProfessionalProfile();

        expect(result).toBe(null);
      }
    });

    it("should log errors to console", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockApiClient.get.mockRejectedValue(new Error("Test error"));

      await getMyProfessionalProfile();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Get my professional profile error:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("URL parameter handling", () => {
    it("should handle special characters in query parameters", async () => {
      const filters = {
        specialty: "Anxiety & Depression",
        location: "New York, NY",
        search: "Dr. Smith's Clinic",
      };

      mockApiClient.get.mockResolvedValue([]);

      await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?specialty=Anxiety+%26+Depression&location=New+York%2C+NY&search=Dr.+Smith%27s+Clinic",
      );
    });

    it("should handle boolean and number filters", async () => {
      const filters = {
        isActive: true,
        minPrice: 50000,
        maxPrice: 100000,
        hasAvailability: false,
      };

      mockApiClient.get.mockResolvedValue([]);

      await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?isActive=true&minPrice=50000&maxPrice=100000&hasAvailability=false",
      );
    });

    it("should handle object filters safely (SonarQube blocker fix)", async () => {
      const filters = {
        complexFilter: { type: "advanced", value: 123 },
        simpleString: "test",
      };

      mockApiClient.get.mockResolvedValue([]);

      await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?complexFilter=%7B%22type%22%3A%22advanced%22%2C%22value%22%3A123%7D&simpleString=test",
      );
    });

    it("should handle array filters safely (SonarQube blocker fix)", async () => {
      const filters = {
        specialties: ["Anxiety", "Depression", { name: "Complex", id: 1 }],
        simpleArray: ["item1", "item2"],
      };

      mockApiClient.get.mockResolvedValue([]);

      await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?specialties=Anxiety%2CDepression%2C%7B%22name%22%3A%22Complex%22%2C%22id%22%3A1%7D&simpleArray=item1%2Citem2",
      );
    });

    it("should handle nested objects in arrays (SonarQube blocker fix)", async () => {
      const filters = {
        complexArray: [{ name: "Object1", nested: { value: 123 } }, "StringItem", 456],
      };

      mockApiClient.get.mockResolvedValue([]);

      await queryProfessionals(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?complexArray=%7B%22name%22%3A%22Object1%22%2C%22nested%22%3A%7B%22value%22%3A123%7D%7D%2CStringItem%2C456",
      );
    });

    it("should handle mixed filter types safely", async () => {
      const filters = {
        stringValue: "test",
        numberValue: 42,
        booleanValue: true,
        objectValue: { key: "value" },
        arrayValue: [1, 2, 3],
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
      };

      mockApiClient.get.mockResolvedValue([]);

      await queryProfessionals(filters);

      // Should only include non-null, non-undefined, non-empty values
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/professionals?stringValue=test&numberValue=42&booleanValue=true&objectValue=%7B%22key%22%3A%22value%22%7D&arrayValue=1%2C2%2C3",
      );
    });
  });
});
