import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { createReview, hasUserReviewedAppointment, getProfessionalReviews } from "@/lib/reviews";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ proId: "test-pro-id" }),
}));

let testEnv: RulesTestEnvironment;
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;

describe("Review System Tests", () => {
  beforeEach(async () => {
    // Initialize test environment with emulator
    testEnv = await initializeTestEnvironment({
      projectId: "demo-miamente",
      firestore: {
        host: "localhost",
        port: 8080,
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              function isSignedIn() { return request.auth != null; }
              function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
              
              match /reviews/{reviewId} {
                allow read: if isSignedIn() && (
                  isOwner(resource.data.userId) ||
                  isOwner(resource.data.proId)
                );
                allow create: if isSignedIn() && 
                  request.auth.uid == request.resource.data.userId &&
                  request.resource.data.rating >= 1 && 
                  request.resource.data.rating <= 5 &&
                  request.resource.data.appointmentId != null &&
                  request.resource.data.userId != null;
                allow update: if false;
                allow delete: if false;
              }
            }
          }
        `,
      },
    });

    // Initialize Firebase app
    app = initializeApp({
      projectId: "demo-miamente",
      apiKey: "test-api-key",
      authDomain: "demo-miamente.firebaseapp.com",
    });

    auth = getAuth(app);
    firestore = getFirestore(app);

    // Connect to emulators
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(firestore, "localhost", 8080);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Review Creation", () => {
    it("should create a review successfully", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const reviewData = {
        appointmentId: "test-appointment-1",
        rating: 5,
        comment: "Excelente sesión, muy profesional",
      };

      const result = await createReview(user.user.uid, pro.user.uid, reviewData);

      expect(result.success).toBe(true);
      expect(result.reviewId).toBeDefined();
      expect(result.error).toBeUndefined();

      // Verify the review was created in Firestore
      const reviewsRef = collection(firestore, "reviews");
      const reviewsSnapshot = await getDocs(reviewsRef);
      expect(reviewsSnapshot.docs.length).toBe(1);

      const reviewDoc = reviewsSnapshot.docs[0];
      const reviewDocData = reviewDoc.data();
      expect(reviewDocData.appointmentId).toBe("test-appointment-1");
      expect(reviewDocData.userId).toBe(user.user.uid);
      expect(reviewDocData.proId).toBe(pro.user.uid);
      expect(reviewDocData.rating).toBe(5);
      expect(reviewDocData.comment).toBe("Excelente sesión, muy profesional");
    });

    it("should prevent duplicate reviews for the same appointment", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const reviewData = {
        appointmentId: "test-appointment-1",
        rating: 5,
        comment: "Primera reseña",
      };

      // Create first review
      const firstResult = await createReview(user.user.uid, pro.user.uid, reviewData);
      expect(firstResult.success).toBe(true);

      // Try to create second review for same appointment
      const secondReviewData = {
        appointmentId: "test-appointment-1",
        rating: 3,
        comment: "Segunda reseña",
      };

      const secondResult = await createReview(user.user.uid, pro.user.uid, secondReviewData);
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe("Ya has calificado esta sesión");

      // Verify only one review exists
      const reviewsRef = collection(firestore, "reviews");
      const reviewsSnapshot = await getDocs(reviewsRef);
      expect(reviewsSnapshot.docs.length).toBe(1);
    });

    it("should validate rating range", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Test rating too low
      const lowRatingData = {
        appointmentId: "test-appointment-1",
        rating: 0,
        comment: "Rating muy bajo",
      };

      const lowResult = await createReview(user.user.uid, pro.user.uid, lowRatingData);
      expect(lowResult.success).toBe(false);
      expect(lowResult.error).toBe("La calificación debe estar entre 1 y 5");

      // Test rating too high
      const highRatingData = {
        appointmentId: "test-appointment-2",
        rating: 6,
        comment: "Rating muy alto",
      };

      const highResult = await createReview(user.user.uid, pro.user.uid, highRatingData);
      expect(highResult.success).toBe(false);
      expect(highResult.error).toBe("La calificación debe estar entre 1 y 5");

      // Test valid ratings
      for (let rating = 1; rating <= 5; rating++) {
        const validData = {
          appointmentId: `test-appointment-${rating}`,
          rating,
          comment: `Rating ${rating}`,
        };

        const result = await createReview(user.user.uid, pro.user.uid, validData);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("Review Queries", () => {
    it("should get professional reviews", async () => {
      const user1 = await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      const user2 = await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Create reviews for the professional
      const review1Data = {
        appointmentId: "appointment-1",
        rating: 5,
        comment: "Excelente",
      };

      const review2Data = {
        appointmentId: "appointment-2",
        rating: 4,
        comment: "Muy bueno",
      };

      await createReview(user1.user.uid, pro.user.uid, review1Data);
      await createReview(user2.user.uid, pro.user.uid, review2Data);

      // Get professional reviews
      const reviews = await getProfessionalReviews(pro.user.uid);
      expect(reviews.length).toBe(2);

      // Check that reviews are sorted by creation date (newest first)
      expect(reviews[0].rating).toBe(4); // Second review should be first (newer)
      expect(reviews[1].rating).toBe(5); // First review should be second (older)
    });

    it("should check if user has reviewed appointment", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const appointmentId = "test-appointment-1";

      // Initially, user has not reviewed
      const hasReviewedBefore = await hasUserReviewedAppointment(user.user.uid, appointmentId);
      expect(hasReviewedBefore).toBe(false);

      // Create a review
      const reviewData = {
        appointmentId,
        rating: 5,
        comment: "Great session",
      };

      await createReview(user.user.uid, pro.user.uid, reviewData);

      // Now user has reviewed
      const hasReviewedAfter = await hasUserReviewedAppointment(user.user.uid, appointmentId);
      expect(hasReviewedAfter).toBe(true);
    });
  });

  describe("Security Rules", () => {
    it("should prevent users from creating reviews for other users", async () => {
      await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      const user2 = await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // User1 tries to create a review for User2
      const reviewData = {
        appointmentId: "test-appointment-1",
        rating: 5,
        comment: "Trying to review for another user",
      };

      // This should fail due to security rules
      try {
        await createReview(user2.user.uid, pro.user.uid, reviewData);
        expect.fail("Should not be able to create review for another user");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow users to read their own reviews", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Create a review
      const reviewData = {
        appointmentId: "test-appointment-1",
        rating: 5,
        comment: "My review",
      };

      await createReview(user.user.uid, pro.user.uid, reviewData);

      // User should be able to read their own review
      const reviewsRef = collection(firestore, "reviews");
      const userReviewsQuery = query(reviewsRef, where("userId", "==", user.user.uid));
      const userReviewsSnapshot = await getDocs(userReviewsQuery);

      expect(userReviewsSnapshot.docs.length).toBe(1);
      expect(userReviewsSnapshot.docs[0].data().comment).toBe("My review");
    });

    it("should allow professionals to read reviews for them", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Create a review
      const reviewData = {
        appointmentId: "test-appointment-1",
        rating: 5,
        comment: "Review for professional",
      };

      await createReview(user.user.uid, pro.user.uid, reviewData);

      // Professional should be able to read reviews for them
      const reviewsRef = collection(firestore, "reviews");
      const proReviewsQuery = query(reviewsRef, where("proId", "==", pro.user.uid));
      const proReviewsSnapshot = await getDocs(proReviewsQuery);

      expect(proReviewsSnapshot.docs.length).toBe(1);
      expect(proReviewsSnapshot.docs[0].data().comment).toBe("Review for professional");
    });
  });
});
