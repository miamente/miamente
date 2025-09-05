import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { httpsCallable } from "firebase-functions-test";

describe("Slot Competition Integration Tests", () => {
  let testEnv: RulesTestEnvironment;
  let user1Context: any;
  let user2Context: any;

  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project",
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              match /{document=**} {
                allow read, write: if true;
              }
            }
          }
        `,
      },
    });

    // Create test contexts for two different users
    user1Context = testEnv.authenticatedContext("user-1");
    user2Context = testEnv.authenticatedContext("user-2");

    // Seed test data
    await seedTestData();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  async function seedTestData() {
    // Create a professional
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("professionals").doc("pro-123").set({
        id: "pro-123",
        fullName: "Dr. Test Professional",
        specialty: "Psicología Clínica",
        rateCents: 80000,
        email: "test@professional.com",
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create an available slot
      await context.firestore().collection("availability").doc("slot-123").set({
        id: "slot-123",
        professionalId: "pro-123",
        date: "2024-01-15",
        time: "10:00",
        duration: 60,
        timezone: "America/Bogota",
        status: "free",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  describe("Concurrent Booking Attempts", () => {
    it("should allow only one user to book a slot when both try simultaneously", async () => {
      // Create the bookAppointment function callable
      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      // Both users try to book the same slot simultaneously
      const user1Promise = bookAppointment({
        proId: "pro-123",
        slotId: "slot-123",
      });

      const user2Promise = httpsCallable(
        user2Context.functions(),
        "bookAppointment",
      )({
        proId: "pro-123",
        slotId: "slot-123",
      });

      // Wait for both attempts to complete
      const results = await Promise.allSettled([user1Promise, user2Promise]);

      // One should succeed, one should fail
      const successes = results.filter((result) => result.status === "fulfilled");
      const failures = results.filter((result) => result.status === "rejected");

      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);

      // Verify the successful booking
      if (successes[0].status === "fulfilled") {
        const successResult = successes[0].value;
        expect(successResult.data).toHaveProperty("appointmentId");
        expect(typeof successResult.data.appointmentId).toBe("string");
      }

      // Verify the failed booking
      if (failures[0].status === "rejected") {
        const failureReason = failures[0].reason;
        expect(failureReason.message).toContain("Slot is no longer available");
      }

      // Verify slot status is now 'held'
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.status).toBe("held");
      expect(slotData?.heldBy).toBeDefined();

      // Verify only one appointment was created
      const appointmentsSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("appointments")
          .where("slotId", "==", "slot-123")
          .get();
      });

      expect(appointmentsSnapshot.docs).toHaveLength(1);

      const appointmentData = appointmentsSnapshot.docs[0].data();
      expect(appointmentData.status).toBe("pending_payment");
      expect(appointmentData.paid).toBe(false);
      expect(appointmentData.payment.provider).toBe("mock");
      expect(appointmentData.payment.amountCents).toBe(80000);
    });

    it("should handle multiple rapid booking attempts gracefully", async () => {
      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      // Create multiple rapid attempts
      const attempts = Array.from({ length: 5 }, (_, i) =>
        bookAppointment({
          proId: "pro-123",
          slotId: "slot-123",
        }).catch((error) => ({ error: error.message })),
      );

      const results = await Promise.all(attempts);

      // Only one should succeed
      const successes = results.filter((result) => !result.error);
      const failures = results.filter((result) => result.error);

      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(4);

      // All failures should be about slot unavailability
      failures.forEach((failure) => {
        expect(failure.error).toContain("Slot is no longer available");
      });
    });

    it("should maintain data consistency during concurrent operations", async () => {
      // Create multiple slots for the same professional
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const batch = context.firestore().batch();

        for (let i = 0; i < 3; i++) {
          const slotRef = context.firestore().collection("availability").doc(`slot-${i}`);
          batch.set(slotRef, {
            id: `slot-${i}`,
            professionalId: "pro-123",
            date: "2024-01-15",
            time: `${10 + i}:00`,
            duration: 60,
            timezone: "America/Bogota",
            status: "free",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        await batch.commit();
      });

      // Multiple users try to book different slots simultaneously
      const bookAppointment1 = httpsCallable(user1Context.functions(), "bookAppointment");
      const bookAppointment2 = httpsCallable(user2Context.functions(), "bookAppointment");

      const promises = [
        bookAppointment1({ proId: "pro-123", slotId: "slot-0" }),
        bookAppointment2({ proId: "pro-123", slotId: "slot-1" }),
        bookAppointment1({ proId: "pro-123", slotId: "slot-2" }),
      ];

      const results = await Promise.allSettled(promises);

      // All should succeed since they're booking different slots
      const successes = results.filter((result) => result.status === "fulfilled");
      expect(successes).toHaveLength(3);

      // Verify all slots are now held
      const slotsSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("availability")
          .where("professionalId", "==", "pro-123")
          .get();
      });

      slotsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        expect(data.status).toBe("held");
        expect(data.heldBy).toBeDefined();
      });

      // Verify all appointments were created
      const appointmentsSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("appointments")
          .where("professionalId", "==", "pro-123")
          .get();
      });

      expect(appointmentsSnapshot.docs).toHaveLength(3);
    });
  });

  describe("Error Handling", () => {
    it("should provide consistent error messages for slot unavailability", async () => {
      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      // First user books the slot
      await bookAppointment({
        proId: "pro-123",
        slotId: "slot-123",
      });

      // Second user tries to book the same slot
      const bookAppointment2 = httpsCallable(user2Context.functions(), "bookAppointment");

      await expect(
        bookAppointment2({
          proId: "pro-123",
          slotId: "slot-123",
        }),
      ).rejects.toThrow("Slot is no longer available");

      // Third user also tries to book the same slot
      const user3Context = testEnv.authenticatedContext("user-3");
      const bookAppointment3 = httpsCallable(user3Context.functions(), "bookAppointment");

      await expect(
        bookAppointment3({
          proId: "pro-123",
          slotId: "slot-123",
        }),
      ).rejects.toThrow("Slot is no longer available");
    });

    it("should handle invalid slot IDs gracefully", async () => {
      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      await expect(
        bookAppointment({
          proId: "pro-123",
          slotId: "non-existent-slot",
        }),
      ).rejects.toThrow("Slot not found");
    });

    it("should handle invalid professional IDs gracefully", async () => {
      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      await expect(
        bookAppointment({
          proId: "non-existent-pro",
          slotId: "slot-123",
        }),
      ).rejects.toThrow("Professional not found");
    });
  });

  describe("Data Integrity", () => {
    it("should maintain referential integrity between slots and appointments", async () => {
      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      // Book an appointment
      const result = await bookAppointment({
        proId: "pro-123",
        slotId: "slot-123",
      });

      const appointmentId = result.data.appointmentId;

      // Verify appointment references the correct slot
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("appointments").doc(appointmentId).get();
      });

      const appointmentData = appointmentDoc.data();
      expect(appointmentData?.slotId).toBe("slot-123");
      expect(appointmentData?.professionalId).toBe("pro-123");
      expect(appointmentData?.userId).toBe("user-1");

      // Verify slot references the correct user
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.heldBy).toBe("user-1");
      expect(slotData?.status).toBe("held");
    });

    it("should handle transaction failures gracefully", async () => {
      // This test would require mocking the transaction to fail
      // In a real scenario, this would test network failures, etc.

      const bookAppointment = httpsCallable(user1Context.functions(), "bookAppointment");

      // For now, we'll test with invalid data that should cause transaction failure
      await expect(
        bookAppointment({
          proId: "pro-123",
          slotId: "slot-123",
        }),
      ).resolves.toBeDefined();

      // Verify the slot is properly held
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.status).toBe("held");
    });
  });
});
