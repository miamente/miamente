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
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe("profiles", () => {
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
      mockApiClient.get.mockResolvedValue(mockProfessional);

      const result = await getProfessionalProfile("prof-123");

      expect(mockApiClient.get).toHaveBeenCalledWith("/professionals/prof-123");
      expect(result).toEqual(mockProfessional);
    });

    it("should handle API errors", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Professional not found"));

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

      const updatedProfessional = { ...mockProfessional, ...updateData };
      mockApiClient.patch.mockResolvedValue(updatedProfessional);

      const result = await updateProfessionalProfileById("prof-123", updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith("/professionals/prof-123", updateData);
      expect(result).toEqual(updatedProfessional);
    });

    it("should handle API errors", async () => {
      mockApiClient.patch.mockRejectedValue(new Error("Update failed"));

      await expect(
        updateProfessionalProfileById("prof-123", { full_name: "New Name" }),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("getMyProfessionalProfile", () => {
    it("should get my professional profile successfully", async () => {
      mockApiClient.get.mockResolvedValue(mockProfessional);

      const result = await getMyProfessionalProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith("/professionals/me/profile");
      expect(result).toEqual(mockProfessional);
    });

    it("should return null on error", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Profile not found"));

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

      const updatedProfessional = { ...mockProfessional, ...updateData };
      mockApiClient.put.mockResolvedValue(updatedProfessional);

      const result = await updateProfessionalProfile(updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/professionals/me", updateData);
      expect(result).toEqual(updatedProfessional);
    });

    it("should handle API errors", async () => {
      mockApiClient.put.mockRejectedValue(new Error("Update failed"));

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

      const createdProfessional = { ...mockProfessional, ...profileData, id: "prof-456" };
      mockApiClient.post.mockResolvedValue(createdProfessional);

      const result = await createProfessionalProfile(profileData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/professionals", profileData);
      expect(result).toEqual(createdProfessional);
    });

    it("should handle API errors", async () => {
      mockApiClient.post.mockRejectedValue(new Error("Creation failed"));

      await expect(createProfessionalProfile({ full_name: "New Name" })).rejects.toThrow(
        "Creation failed",
      );
    });
  });

  describe("queryProfessionals", () => {
    it("should query professionals successfully without filters", async () => {
      const professionals = [mockProfessional];
      mockApiClient.get.mockResolvedValue(professionals);

      const result = await queryProfessionals();

      expect(mockApiClient.get).toHaveBeenCalledWith("/professionals");
      expect(result).toEqual({
        professionals,
        lastSnapshot: null,
      });
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

      expect(mockApiClient.get).toHaveBeenCalledWith("/users/user-123");
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
      mockApiClient.patch.mockResolvedValue(updatedUser);

      const result = await updateUserProfile("user-123", updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith("/users/user-123", updateData);
      expect(result).toEqual(updatedUser);
    });

    it("should handle API errors", async () => {
      mockApiClient.patch.mockRejectedValue(new Error("Update failed"));

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
  });
});
