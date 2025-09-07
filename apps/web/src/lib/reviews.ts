import { apiClient } from "./api";

export interface Review {
  appointmentId: string;
  userId: string;
  proId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
}

/**
 * Create a review for an appointment
 */
export async function createReview(
  userId: string,
  proId: string,
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
      appointment_id: reviewData.appointmentId,
      user_id: userId,
      professional_id: proId,
      rating: reviewData.rating,
      comment: reviewData.comment || "",
    });

    return {
      success: true,
      reviewId: response.id,
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
    return response.map((review: Record<string, unknown>) => ({
      id: review.id,
      appointmentId: review.appointment_id,
      userId: review.user_id,
      proId: review.professional_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(review.created_at),
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
    return response.map((review: Record<string, unknown>) => ({
      id: review.id,
      appointmentId: review.appointment_id,
      userId: review.user_id,
      proId: review.professional_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(review.created_at),
    }));
  } catch (error) {
    console.error("Error getting user reviews:", error);
    return [];
  }
}

/**
 * Check if user has already reviewed an appointment
 */
export async function hasUserReviewedAppointment(
  userId: string,
  appointmentId: string,
): Promise<boolean> {
  try {
    const response = await apiClient.get(`/reviews/check/${appointmentId}/${userId}`);
    return response.hasReviewed || false;
  } catch (error) {
    console.error("Error checking if user reviewed appointment:", error);
    return false;
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
      average: response.average || 0,
      count: response.count || 0,
    };
  } catch (error) {
    console.error("Error getting professional average rating:", error);
    return { average: 0, count: 0 };
  }
}
