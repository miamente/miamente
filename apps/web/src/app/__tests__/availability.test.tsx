import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import {
  generateSlots,
  queryAvailabilitySlots,
  type SlotGenerationParams,
} from "@/lib/availability";
import { createBogotaDate } from "@/lib/timezone";

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

describe("Availability System Tests", () => {
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
              
              match /availability/{proId}/slots/{slotId} {
                allow read: if isSignedIn() && (
                  isOwner(proId) || 
                  (resource.data.status == "free")
                );
                allow create, update, delete: if isSignedIn() && isOwner(proId);
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

  describe("Slot Generation", () => {
    it("should generate slots without overlaps", async () => {
      const user = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1), // January 1, 2024
        endDate: createBogotaDate(2024, 0, 1), // Same day
        startTime: "09:00",
        endTime: "12:00",
        durationMinutes: 30,
        daysOfWeek: [1], // Monday
      };

      const result = await generateSlots(user.user.uid, params);
      expect(result.created).toBe(6); // 3 hours / 30 minutes = 6 slots
      expect(result.skipped).toBe(0); // No overlaps on first generation

      // Try to generate overlapping slots
      const overlappingParams: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "10:00", // Overlaps with existing slots
        endTime: "11:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      const overlapResult = await generateSlots(user.user.uid, overlappingParams);
      expect(overlapResult.created).toBe(0); // No slots created due to overlaps
      expect(overlapResult.skipped).toBe(2); // 2 overlapping slots skipped
    });

    it("should generate slots for multiple days", async () => {
      const user = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1), // Monday
        endDate: createBogotaDate(2024, 0, 3), // Wednesday
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1, 2, 3], // Monday, Tuesday, Wednesday
      };

      const result = await generateSlots(user.user.uid, params);
      expect(result.created).toBe(6); // 3 days × 2 slots per day = 6 slots
      expect(result.skipped).toBe(0);
    });

    it("should respect days of week filter", async () => {
      const user = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1), // Monday
        endDate: createBogotaDate(2024, 0, 3), // Wednesday
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1], // Only Monday
      };

      const result = await generateSlots(user.user.uid, params);
      expect(result.created).toBe(2); // Only Monday slots
      expect(result.skipped).toBe(0);
    });
  });

  describe("Slot Querying", () => {
    it("should query slots by date range", async () => {
      const user = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Generate some slots
      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 2),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1, 2],
      };

      await generateSlots(user.user.uid, params);

      // Query slots for a specific date range
      const startDate = createBogotaDate(2024, 0, 1);
      const endDate = createBogotaDate(2024, 0, 1);

      const result = await queryAvailabilitySlots({
        proId: user.user.uid,
        startDate,
        endDate,
        status: "free",
      });

      expect(result.slots.length).toBe(2); // 2 slots on Monday
      expect(result.slots.every((slot) => slot.status === "free")).toBe(true);
    });

    it("should query slots by status", async () => {
      const user = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Generate slots
      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      await generateSlots(user.user.uid, params);

      // Manually set one slot to booked status
      const slotsRef = collection(firestore, "availability", user.user.uid, "slots");
      const slotsSnapshot = await getDocs(slotsRef);
      const firstSlot = slotsSnapshot.docs[0];

      await setDoc(
        doc(firestore, "availability", user.user.uid, "slots", firstSlot.id),
        {
          ...firstSlot.data(),
          status: "booked",
          updatedAt: new Date(),
        },
        { merge: true },
      );

      // Query only free slots
      const freeResult = await queryAvailabilitySlots({
        proId: user.user.uid,
        status: "free",
      });

      // Query only booked slots
      const bookedResult = await queryAvailabilitySlots({
        proId: user.user.uid,
        status: "booked",
      });

      expect(freeResult.slots.length).toBe(1); // 1 free slot
      expect(bookedResult.slots.length).toBe(1); // 1 booked slot
    });
  });

  describe("Security Rules", () => {
    it("should prevent users from creating slots for other professionals", async () => {
      const pro1 = await createUserWithEmailAndPassword(auth, "pro1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");

      // Sign in as user1 and try to create slots for pro1
      await signInWithEmailAndPassword(auth, "user1@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      // This should fail due to security rules
      try {
        await generateSlots(pro1.user.uid, params);
        expect.fail("Should not be able to create slots for another professional");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow users to read free slots but not private ones", async () => {
      const pro1 = await createUserWithEmailAndPassword(auth, "pro1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");

      // Pro1 creates some slots
      await signInWithEmailAndPassword(auth, "pro1@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      await generateSlots(pro1.user.uid, params);

      // Set one slot to booked (private)
      const slotsRef = collection(firestore, "availability", pro1.user.uid, "slots");
      const slotsSnapshot = await getDocs(slotsRef);
      const firstSlot = slotsSnapshot.docs[0];

      await setDoc(
        doc(firestore, "availability", pro1.user.uid, "slots", firstSlot.id),
        {
          ...firstSlot.data(),
          status: "booked",
          updatedAt: new Date(),
        },
        { merge: true },
      );

      // Sign in as user1 and try to query slots
      await signInWithEmailAndPassword(auth, "user1@example.com", "password123");

      const result = await queryAvailabilitySlots({
        proId: pro1.user.uid,
        status: "free",
      });

      // Should only see free slots, not booked ones
      expect(result.slots.length).toBe(1); // Only the free slot
      expect(result.slots.every((slot) => slot.status === "free")).toBe(true);
    });
  });
});
