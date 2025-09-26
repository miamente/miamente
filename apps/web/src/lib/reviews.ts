import { apiClient } from "./api";

export interface Review {
  userId: string;
  proId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface CreateReviewRequest {
  professional_id: string;
  rating: number;
  comment?: string;
}

/**
 * Create a review for a professional
 */
export async function createReview(
  _userId: string,
  _proId: string,
  reviewData: CreateReviewRequest,
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  try {
    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return {
        success: false,
        error: "La calificación debe estar entre 1 y 5",
      };
    }

    // Create the review using FastAPI
    const response = await apiClient.post("/reviews", {
      professional_id: reviewData.professional_id,
      rating: reviewData.rating,
      comment: reviewData.comment || "",
    });

    return {
      success: true,
      reviewId: (response as { id: string }).id,
    };
  } catch (error: unknown) {
    console.error("Error creating review:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message?.includes("already reviewed")) {
      return {
        success: false,
        error: "Ya has calificado esta sesión",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la calificación",
    };
  }
}

/**
 * Get reviews for a professional
 */
export async function getProfessionalReviews(
  proId: string,
  limit: number = 50,
): Promise<Array<Review & { id: string }>> {
  try {
    const response = await apiClient.get(`/reviews/professional/${proId}?limit=${limit}`);
    return (response as Array<Record<string, unknown>>).map((review: Record<string, unknown>) => ({
      id: review.id as string,
      userId: review.user_id as string,
      proId: review.professional_id as string,
      rating: review.rating as number,
      comment: review.comment as string,
      createdAt: new Date((review as { created_at: string }).created_at),
    }));
  } catch (error) {
    console.error("Error getting professional reviews:", error);
    return [];
  }
}

/**
 * Get reviews by a user
 */
export async function getUserReviews(
  userId: string,
  limit: number = 50,
): Promise<Array<Review & { id: string }>> {
  try {
    const response = await apiClient.get(`/reviews/user/${userId}?limit=${limit}`);
    return (response as Array<Record<string, unknown>>).map((review: Record<string, unknown>) => ({
      id: review.id as string,
      userId: review.user_id as string,
      proId: review.professional_id as string,
      rating: review.rating as number,
      comment: review.comment as string,
      createdAt: new Date((review as { created_at: string }).created_at),
    }));
  } catch (error) {
    console.error("Error getting user reviews:", error);
    return [];
  }
}

/**
 * Get average rating for a professional
 */
export async function getProfessionalAverageRating(proId: string): Promise<{
  average: number;
  count: number;
}> {
  try {
    const response = await apiClient.get(`/reviews/professional/${proId}/stats`);
    return {
      average: (response as { average?: number }).average || 0,
      count: (response as { count?: number }).count || 0,
    };
  } catch (error) {
    console.error("Error getting professional average rating:", error);
    return { average: 0, count: 0 };
  }
}
