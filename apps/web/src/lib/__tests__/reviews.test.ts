import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../api", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import {
  createReview,
  getProfessionalReviews,
  getUserReviews,
  getProfessionalAverageRating,
  type CreateReviewRequest,
} from "../reviews";
import { apiClient } from "../api";

describe("reviews", () => {
  const mockReviewData: CreateReviewRequest = {
    professional_id: "pro-1",
    rating: 5,
    comment: "Excellent service!",
  };

  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createReview", () => {
    it("should create a review successfully", async () => {
      mockApiClient.post.mockResolvedValue({ id: "review-1" });

      const result = await createReview("user-1", "pro-1", mockReviewData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/reviews", {
        professional_id: "pro-1",
        rating: 5,
        comment: "Excellent service!",
      });
      expect(result).toEqual({
        success: true,
        reviewId: "review-1",
      });
    });

    it("should create a review without comment", async () => {
      const reviewDataWithoutComment = { ...mockReviewData, comment: undefined };
      mockApiClient.post.mockResolvedValue({ id: "review-1" });

      const result = await createReview("user-1", "pro-1", reviewDataWithoutComment);

      expect(mockApiClient.post).toHaveBeenCalledWith("/reviews", {
        professional_id: "pro-1",
        rating: 5,
        comment: "",
      });
      expect(result.success).toBe(true);
    });

    it("should validate rating range", async () => {
      const invalidRatingData = { ...mockReviewData, rating: 6 };

      const result = await createReview("user-1", "pro-1", invalidRatingData);

      expect(result).toEqual({
        success: false,
        error: "La calificación debe estar entre 1 y 5",
      });
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it("should validate minimum rating", async () => {
      const invalidRatingData = { ...mockReviewData, rating: 0 };

      const result = await createReview("user-1", "pro-1", invalidRatingData);

      expect(result).toEqual({
        success: false,
        error: "La calificación debe estar entre 1 y 5",
      });
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it("should handle already reviewed error", async () => {
      const error = new Error("User has already reviewed this professional");
      mockApiClient.post.mockRejectedValue(error);

      const result = await createReview("user-1", "pro-1", mockReviewData);

      expect(result).toEqual({
        success: false,
        error: "Ya has calificado esta sesión",
      });
      expect(console.error).toHaveBeenCalledWith("Error creating review:", error);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.post.mockRejectedValue(error);

      const result = await createReview("user-1", "pro-1", mockReviewData);

      expect(result).toEqual({
        success: false,
        error: "API Error",
      });
      expect(console.error).toHaveBeenCalledWith("Error creating review:", error);
    });

    it("should handle non-Error exceptions", async () => {
      mockApiClient.post.mockRejectedValue("String error");

      const result = await createReview("user-1", "pro-1", mockReviewData);

      expect(result).toEqual({
        success: false,
        error: "Error al crear la calificación",
      });
      expect(console.error).toHaveBeenCalledWith("Error creating review:", "String error");
    });
  });

  describe("getProfessionalReviews", () => {
    it("should get professional reviews successfully", async () => {
      const mockApiResponse = [
        {
          id: "review-1",
          user_id: "user-1",
          professional_id: "pro-1",
          rating: 5,
          comment: "Excellent service!",
          created_at: "2024-01-15T10:00:00Z",
        },
      ];
      mockApiClient.get.mockResolvedValue(mockApiResponse);

      const result = await getProfessionalReviews("pro-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/reviews/professional/pro-1?limit=50");
      expect(result).toEqual([
        {
          id: "review-1",
          userId: "user-1",
          proId: "pro-1",
          rating: 5,
          comment: "Excellent service!",
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
      ]);
    });

    it("should get professional reviews with custom limit", async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getProfessionalReviews("pro-1", 10);

      expect(mockApiClient.get).toHaveBeenCalledWith("/reviews/professional/pro-1?limit=10");
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      const result = await getProfessionalReviews("pro-1");

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith("Error getting professional reviews:", error);
    });

    it("should handle empty response", async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await getProfessionalReviews("pro-1");

      expect(result).toEqual([]);
    });
  });

  describe("getUserReviews", () => {
    it("should get user reviews successfully", async () => {
      const mockApiResponse = [
        {
          id: "review-1",
          user_id: "user-1",
          professional_id: "pro-1",
          rating: 5,
          comment: "Excellent service!",
          created_at: "2024-01-15T10:00:00Z",
        },
      ];
      mockApiClient.get.mockResolvedValue(mockApiResponse);

      const result = await getUserReviews("user-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/reviews/user/user-1?limit=50");
      expect(result).toEqual([
        {
          id: "review-1",
          userId: "user-1",
          proId: "pro-1",
          rating: 5,
          comment: "Excellent service!",
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
      ]);
    });

    it("should get user reviews with custom limit", async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getUserReviews("user-1", 20);

      expect(mockApiClient.get).toHaveBeenCalledWith("/reviews/user/user-1?limit=20");
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      const result = await getUserReviews("user-1");

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith("Error getting user reviews:", error);
    });
  });

  describe("getProfessionalAverageRating", () => {
    it("should get average rating successfully", async () => {
      mockApiClient.get.mockResolvedValue({ average: 4.5, count: 10 });

      const result = await getProfessionalAverageRating("pro-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/reviews/professional/pro-1/stats");
      expect(result).toEqual({ average: 4.5, count: 10 });
    });

    it("should handle missing average and count fields", async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await getProfessionalAverageRating("pro-1");

      expect(result).toEqual({ average: 0, count: 0 });
    });

    it("should handle partial response", async () => {
      mockApiClient.get.mockResolvedValue({ average: 4.5 });

      const result = await getProfessionalAverageRating("pro-1");

      expect(result).toEqual({ average: 4.5, count: 0 });
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("API Error");
      mockApiClient.get.mockRejectedValue(error);

      const result = await getProfessionalAverageRating("pro-1");

      expect(result).toEqual({ average: 0, count: 0 });
      expect(console.error).toHaveBeenCalledWith(
        "Error getting professional average rating:",
        error,
      );
    });
  });

  describe("error handling", () => {
    it("should handle different types of errors in createReview", async () => {
      const errors = [
        new Error("Network error"),
        new Error("Server error"),
        "String error",
        { message: "Object error" },
        null,
        undefined,
      ];

      for (const error of errors) {
        mockApiClient.post.mockRejectedValue(error);
        const result = await createReview("user-1", "pro-1", mockReviewData);

        if (error instanceof Error && error.message?.includes("already reviewed")) {
          expect(result.error).toBe("Ya has calificado esta sesión");
        } else {
          expect(result.success).toBe(false);
        }
      }
    });

    it("should log errors to console", async () => {
      const error = new Error("Test error");
      mockApiClient.post.mockRejectedValue(error);

      await createReview("user-1", "pro-1", mockReviewData);

      expect(console.error).toHaveBeenCalledWith("Error creating review:", error);
    });
  });
});
