import {
  collection,
  doc,
  setDoc,
  getDocs,
  query as fsQuery,
  where,
  orderBy,
  limit as fsLimit,
} from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";

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
  const firestore = getFirebaseFirestore();
  const reviewsRef = collection(firestore, "reviews");

  try {
    // Check if user already has a review for this appointment
    const existingReviewQuery = fsQuery(
      reviewsRef,
      where("appointmentId", "==", reviewData.appointmentId),
      where("userId", "==", userId),
      fsLimit(1),
    );

    const existingReviews = await getDocs(existingReviewQuery);
    if (!existingReviews.empty) {
      return {
        success: false,
        error: "Ya has calificado esta sesión",
      };
    }

    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return {
        success: false,
        error: "La calificación debe estar entre 1 y 5",
      };
    }

    // Create the review
    const reviewRef = doc(reviewsRef);
    const review: Review = {
      appointmentId: reviewData.appointmentId,
      userId,
      proId,
      rating: reviewData.rating,
      comment: reviewData.comment || "",
      createdAt: new Date(),
    };

    await setDoc(reviewRef, {
      ...review,
      createdAt: review.createdAt,
    });

    return {
      success: true,
      reviewId: reviewRef.id,
    };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      error: "Error al crear la calificación",
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
  const firestore = getFirebaseFirestore();
  const reviewsRef = collection(firestore, "reviews");

  try {
    const q = fsQuery(
      reviewsRef,
      where("proId", "==", proId),
      orderBy("createdAt", "desc"),
      fsLimit(limit),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        appointmentId: data.appointmentId,
        userId: data.userId,
        proId: data.proId,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt.toDate(),
      };
    });
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
  const firestore = getFirebaseFirestore();
  const reviewsRef = collection(firestore, "reviews");

  try {
    const q = fsQuery(
      reviewsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      fsLimit(limit),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        appointmentId: data.appointmentId,
        userId: data.userId,
        proId: data.proId,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt.toDate(),
      };
    });
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
  const firestore = getFirebaseFirestore();
  const reviewsRef = collection(firestore, "reviews");

  try {
    const q = fsQuery(
      reviewsRef,
      where("appointmentId", "==", appointmentId),
      where("userId", "==", userId),
      fsLimit(1),
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
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
  const reviews = await getProfessionalReviews(proId, 1000); // Get all reviews

  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = totalRating / reviews.length;

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal place
    count: reviews.length,
  };
}
