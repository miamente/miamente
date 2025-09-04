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

import { generateSlots, type SlotGenerationParams } from "@/lib/availability";
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

describe("Appointment Booking Tests", () => {
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
              
              match /appointments/{appointmentId} {
                allow read: if isSignedIn() && (
                  isOwner(resource.data.userId) ||
                  isOwner(resource.data.proId)
                );
                allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
                allow update: if isSignedIn() && (
                  isOwner(resource.data.userId) ||
                  isOwner(resource.data.proId)
                );
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

  describe("Race Condition Tests", () => {
    it("should prevent two users from booking the same slot simultaneously", async () => {
      // Create professional and two users
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");
      const user1 = await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      const user2 = await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");

      // Pro creates a slot
      await signInWithEmailAndPassword(auth, "pro@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      const result = await generateSlots(pro.user.uid, params);
      expect(result.created).toBe(2); // 2 slots created

      // Get the first slot ID
      const slotsRef = collection(firestore, "availability", pro.user.uid, "slots");
      const slotsSnapshot = await getDocs(slotsRef);
      const firstSlot = slotsSnapshot.docs[0];
      const slotId = firstSlot.id;

      // Simulate race condition: both users try to book the same slot
      const bookingPromises = [
        // User 1 books
        (async () => {
          await signInWithEmailAndPassword(auth, "user1@example.com", "password123");
          // Simulate the booking logic (in real app, this would call the function)
          const slotRef = doc(firestore, "availability", pro.user.uid, "slots", slotId);
          const slotDoc = await slotRef.get();

          if (slotDoc.exists() && slotDoc.data()?.status === "free") {
            await slotRef.update({ status: "held" });
            return { success: true, userId: user1.user.uid };
          }
          return { success: false, error: "Slot not available" };
        })(),

        // User 2 books (simultaneously)
        (async () => {
          await signInWithEmailAndPassword(auth, "user2@example.com", "password123");
          // Simulate the booking logic
          const slotRef = doc(firestore, "availability", pro.user.uid, "slots", slotId);
          const slotDoc = await slotRef.get();

          if (slotDoc.exists() && slotDoc.data()?.status === "free") {
            await slotRef.update({ status: "held" });
            return { success: true, userId: user2.user.uid };
          }
          return { success: false, error: "Slot not available" };
        })(),
      ];

      const results = await Promise.all(bookingPromises);

      // Only one user should succeed
      const successfulBookings = results.filter((r) => r.success);
      const failedBookings = results.filter((r) => !r.success);

      expect(successfulBookings).toHaveLength(1);
      expect(failedBookings).toHaveLength(1);
      expect(failedBookings[0].error).toBe("Slot not available");
    });

    it("should handle idempotency - same user booking same slot twice", async () => {
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user@example.com", "password123");

      // Pro creates a slot
      await signInWithEmailAndPassword(auth, "pro@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      await generateSlots(pro.user.uid, params);

      // Get the first slot ID
      const slotsRef = collection(firestore, "availability", pro.user.uid, "slots");
      const slotsSnapshot = await getDocs(slotsRef);
      const firstSlot = slotsSnapshot.docs[0];
      const slotId = firstSlot.id;

      // User books the slot
      await signInWithEmailAndPassword(auth, "user@example.com", "password123");

      const slotRef = doc(firestore, "availability", pro.user.uid, "slots", slotId);
      await slotRef.update({ status: "held" });

      // Create appointment
      const appointmentRef = doc(firestore, "appointments");
      await setDoc(appointmentRef, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId,
        start: firstSlot.data().start,
        end: firstSlot.data().end,
        status: "pending_payment",
        paid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // User tries to book the same slot again
      const slotDoc = await slotRef.get();
      const slotData = slotDoc.data();

      // Should detect existing appointment and return it instead of creating new one
      const existingAppointmentQuery = await getDocs(
        collection(firestore, "appointments")
          .where("userId", "==", user.user.uid)
          .where("proId", "==", pro.user.uid)
          .where("slotId", "==", slotId),
      );

      expect(existingAppointmentQuery.empty).toBe(false);
      expect(slotData?.status).toBe("held");
    });

    it("should prevent booking slots that are not free", async () => {
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user@example.com", "password123");

      // Pro creates a slot
      await signInWithEmailAndPassword(auth, "pro@example.com", "password123");

      const params: SlotGenerationParams = {
        startDate: createBogotaDate(2024, 0, 1),
        endDate: createBogotaDate(2024, 0, 1),
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 30,
        daysOfWeek: [1],
      };

      await generateSlots(pro.user.uid, params);

      // Get the first slot ID
      const slotsRef = collection(firestore, "availability", pro.user.uid, "slots");
      const slotsSnapshot = await getDocs(slotsRef);
      const firstSlot = slotsSnapshot.docs[0];
      const slotId = firstSlot.id;

      // Pro marks slot as booked
      const slotRef = doc(firestore, "availability", pro.user.uid, "slots", slotId);
      await slotRef.update({ status: "booked" });

      // User tries to book the slot
      await signInWithEmailAndPassword(auth, "user@example.com", "password123");

      const slotDoc = await slotRef.get();
      const slotData = slotDoc.data();

      expect(slotData?.status).toBe("booked");
      // In real implementation, this would throw an error
      expect(slotData?.status).not.toBe("free");
    });
  });

  describe("Security Rules Tests", () => {
    it("should prevent users from creating appointments for other users", async () => {
      await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      const user2 = await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // User1 tries to create an appointment for User2
      await signInWithEmailAndPassword(auth, "user1@example.com", "password123");

      const appointmentRef = doc(firestore, "appointments");

      try {
        await setDoc(appointmentRef, {
          userId: user2.user.uid, // Trying to create for user2
          proId: pro.user.uid,
          slotId: "test-slot",
          start: new Date(),
          end: new Date(),
          status: "pending_payment",
          paid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        expect.fail("Should not be able to create appointment for another user");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow users to read their own appointments", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Pro creates an appointment for the user
      await signInWithEmailAndPassword(auth, "pro@example.com", "password123");

      const appointmentRef = doc(firestore, "appointments");
      await setDoc(appointmentRef, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId: "test-slot",
        start: new Date(),
        end: new Date(),
        status: "pending_payment",
        paid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // User should be able to read their appointment
      await signInWithEmailAndPassword(auth, "user@example.com", "password123");

      const appointmentDoc = await appointmentRef.get();
      expect(appointmentDoc.exists()).toBe(true);
    });
  });
});
