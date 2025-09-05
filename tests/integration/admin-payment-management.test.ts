import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

describe("Admin Payment Management Integration Tests", () => {
  let testEnv: RulesTestEnvironment;
  let adminContext: any;
  let userContext: any;

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

    // Create test contexts
    adminContext = testEnv.authenticatedContext("admin-123");
    userContext = testEnv.authenticatedContext("user-123");

    // Seed test data
    await seedTestData();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  async function seedTestData() {
    // Create admin user
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("admin-123").set({
        id: "admin-123",
        email: "admin@miamente.com",
        fullName: "Admin User",
        role: "admin",
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create regular user
      await context.firestore().collection("users").doc("user-123").set({
        id: "user-123",
        email: "user@miamente.com",
        fullName: "Regular User",
        role: "user",
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create a professional
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

      // Create a pending appointment
      await context
        .firestore()
        .collection("appointments")
        .doc("appt-123")
        .set({
          id: "appt-123",
          userId: "user-123",
          professionalId: "pro-123",
          slotId: "slot-123",
          status: "pending_confirmation",
          paid: false,
          payment: {
            provider: "mock",
            amountCents: 80000,
            currency: "COP",
            status: "pending",
          },
          professional: {
            id: "pro-123",
            fullName: "Dr. Test Professional",
            specialty: "Psicología Clínica",
            rateCents: 80000,
          },
          slot: {
            date: "2024-01-15",
            time: "10:00",
            duration: 60,
            timezone: "America/Bogota",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // Update slot to held
      await context.firestore().collection("availability").doc("slot-123").update({
        status: "held",
        heldBy: "user-123",
        heldAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  describe("Admin Confirm Payment", () => {
    it("should allow admin to confirm payment successfully", async () => {
      const adminConfirmPayment = httpsCallable(adminContext.functions(), "adminConfirmPayment");

      const result = await adminConfirmPayment({
        appointmentId: "appt-123",
      });

      expect(result.data.success).toBe(true);
      expect(result.data.appointmentId).toBe("appt-123");
      expect(result.data.jitsiUrl).toContain("https://meet.jit.si/miamente-appt-123-pro-123");

      // Verify appointment is now confirmed
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("appointments").doc("appt-123").get();
      });

      const appointmentData = appointmentDoc.data();
      expect(appointmentData?.status).toBe("confirmed");
      expect(appointmentData?.paid).toBe(true);
      expect(appointmentData?.jitsiUrl).toBeDefined();

      // Verify slot is now booked
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.status).toBe("booked");
      expect(slotData?.bookedBy).toBe("user-123");

      // Verify event log entry
      const eventLogSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("event_log")
          .where("action", "==", "admin_confirm_payment")
          .where("appointmentId", "==", "appt-123")
          .get();
      });

      expect(eventLogSnapshot.docs).toHaveLength(1);
      const eventData = eventLogSnapshot.docs[0].data();
      expect(eventData.adminId).toBe("admin-123");
      expect(eventData.action).toBe("admin_confirm_payment");
      expect(eventData.appointmentId).toBe("appt-123");
    });

    it("should reject non-admin users from confirming payments", async () => {
      const adminConfirmPayment = httpsCallable(userContext.functions(), "adminConfirmPayment");

      await expect(
        adminConfirmPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("Only admin users can confirm payments");
    });

    it("should reject unauthenticated users", async () => {
      const unauthenticatedContext = testEnv.unauthenticatedContext();
      const adminConfirmPayment = httpsCallable(
        unauthenticatedContext.functions(),
        "adminConfirmPayment",
      );

      await expect(
        adminConfirmPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("User must be authenticated");
    });

    it("should handle non-existent appointment", async () => {
      const adminConfirmPayment = httpsCallable(adminContext.functions(), "adminConfirmPayment");

      await expect(
        adminConfirmPayment({
          appointmentId: "non-existent-appt",
        }),
      ).rejects.toThrow("Appointment not found");
    });

    it("should handle already confirmed appointment", async () => {
      // Update appointment to confirmed status
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("appointments").doc("appt-123").update({
          status: "confirmed",
          paid: true,
          updatedAt: new Date(),
        });
      });

      const adminConfirmPayment = httpsCallable(adminContext.functions(), "adminConfirmPayment");

      await expect(
        adminConfirmPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("Appointment status 'confirmed' cannot be confirmed");
    });
  });

  describe("Admin Fail Payment", () => {
    it("should allow admin to fail payment successfully", async () => {
      const adminFailPayment = httpsCallable(adminContext.functions(), "adminFailPayment");

      const result = await adminFailPayment({
        appointmentId: "appt-123",
      });

      expect(result.data.success).toBe(true);
      expect(result.data.appointmentId).toBe("appt-123");

      // Verify appointment is now failed
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("appointments").doc("appt-123").get();
      });

      const appointmentData = appointmentDoc.data();
      expect(appointmentData?.status).toBe("payment_failed");
      expect(appointmentData?.payment.status).toBe("failed");

      // Verify slot is now free
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.status).toBe("free");
      expect(slotData?.heldBy).toBeUndefined();
      expect(slotData?.bookedBy).toBeUndefined();

      // Verify event log entry
      const eventLogSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("event_log")
          .where("action", "==", "admin_fail_payment")
          .where("appointmentId", "==", "appt-123")
          .get();
      });

      expect(eventLogSnapshot.docs).toHaveLength(1);
      const eventData = eventLogSnapshot.docs[0].data();
      expect(eventData.adminId).toBe("admin-123");
      expect(eventData.action).toBe("admin_fail_payment");
      expect(eventData.appointmentId).toBe("appt-123");
    });

    it("should reject non-admin users from failing payments", async () => {
      const adminFailPayment = httpsCallable(userContext.functions(), "adminFailPayment");

      await expect(
        adminFailPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("Only admin users can fail payments");
    });

    it("should handle already confirmed appointment", async () => {
      // Update appointment to confirmed status
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("appointments").doc("appt-123").update({
          status: "confirmed",
          paid: true,
          updatedAt: new Date(),
        });
      });

      const adminFailPayment = httpsCallable(adminContext.functions(), "adminFailPayment");

      await expect(
        adminFailPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("Appointment status 'confirmed' cannot be marked as failed");
    });
  });

  describe("Admin Role Validation", () => {
    it("should accept users with role=admin", async () => {
      // Create user with role=admin
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("role-admin").set({
          id: "role-admin",
          email: "roleadmin@miamente.com",
          fullName: "Role Admin",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const roleAdminContext = testEnv.authenticatedContext("role-admin");
      const adminConfirmPayment = httpsCallable(
        roleAdminContext.functions(),
        "adminConfirmPayment",
      );

      const result = await adminConfirmPayment({
        appointmentId: "appt-123",
      });

      expect(result.data.success).toBe(true);
    });

    it("should accept users with isAdmin=true", async () => {
      // Create user with isAdmin=true
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("bool-admin").set({
          id: "bool-admin",
          email: "booladmin@miamente.com",
          fullName: "Bool Admin",
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const boolAdminContext = testEnv.authenticatedContext("bool-admin");
      const adminConfirmPayment = httpsCallable(
        boolAdminContext.functions(),
        "adminConfirmPayment",
      );

      const result = await adminConfirmPayment({
        appointmentId: "appt-123",
      });

      expect(result.data.success).toBe(true);
    });

    it("should reject users without admin privileges", async () => {
      // Create regular user
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("regular-user").set({
          id: "regular-user",
          email: "regular@miamente.com",
          fullName: "Regular User",
          role: "user",
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const regularUserContext = testEnv.authenticatedContext("regular-user");
      const adminConfirmPayment = httpsCallable(
        regularUserContext.functions(),
        "adminConfirmPayment",
      );

      await expect(
        adminConfirmPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("Only admin users can confirm payments");
    });

    it("should reject users with non-existent user document", async () => {
      const nonExistentUserContext = testEnv.authenticatedContext("non-existent-user");
      const adminConfirmPayment = httpsCallable(
        nonExistentUserContext.functions(),
        "adminConfirmPayment",
      );

      await expect(
        adminConfirmPayment({
          appointmentId: "appt-123",
        }),
      ).rejects.toThrow("Only admin users can confirm payments");
    });
  });

  describe("Event Logging", () => {
    it("should log admin confirm payment action", async () => {
      const adminConfirmPayment = httpsCallable(adminContext.functions(), "adminConfirmPayment");

      await adminConfirmPayment({
        appointmentId: "appt-123",
      });

      // Verify event log entry
      const eventLogSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("event_log")
          .where("adminId", "==", "admin-123")
          .where("action", "==", "admin_confirm_payment")
          .get();
      });

      expect(eventLogSnapshot.docs).toHaveLength(1);
      const eventData = eventLogSnapshot.docs[0].data();
      expect(eventData.adminId).toBe("admin-123");
      expect(eventData.action).toBe("admin_confirm_payment");
      expect(eventData.appointmentId).toBe("appt-123");
      expect(eventData.timestamp).toBeDefined();
    });

    it("should log admin fail payment action", async () => {
      const adminFailPayment = httpsCallable(adminContext.functions(), "adminFailPayment");

      await adminFailPayment({
        appointmentId: "appt-123",
      });

      // Verify event log entry
      const eventLogSnapshot = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context
          .firestore()
          .collection("event_log")
          .where("adminId", "==", "admin-123")
          .where("action", "==", "admin_fail_payment")
          .get();
      });

      expect(eventLogSnapshot.docs).toHaveLength(1);
      const eventData = eventLogSnapshot.docs[0].data();
      expect(eventData.adminId).toBe("admin-123");
      expect(eventData.action).toBe("admin_fail_payment");
      expect(eventData.appointmentId).toBe("appt-123");
      expect(eventData.timestamp).toBeDefined();
    });
  });

  describe("Data Consistency", () => {
    it("should maintain data consistency during payment confirmation", async () => {
      const adminConfirmPayment = httpsCallable(adminContext.functions(), "adminConfirmPayment");

      await adminConfirmPayment({
        appointmentId: "appt-123",
      });

      // Verify all related data is consistent
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("appointments").doc("appt-123").get();
      });

      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const appointmentData = appointmentDoc.data();
      const slotData = slotDoc.data();

      // Appointment should be confirmed and paid
      expect(appointmentData?.status).toBe("confirmed");
      expect(appointmentData?.paid).toBe(true);
      expect(appointmentData?.jitsiUrl).toBeDefined();

      // Slot should be booked by the correct user
      expect(slotData?.status).toBe("booked");
      expect(slotData?.bookedBy).toBe("user-123");
      expect(slotData?.heldBy).toBeUndefined();
    });

    it("should maintain data consistency during payment failure", async () => {
      const adminFailPayment = httpsCallable(adminContext.functions(), "adminFailPayment");

      await adminFailPayment({
        appointmentId: "appt-123",
      });

      // Verify all related data is consistent
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("appointments").doc("appt-123").get();
      });

      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection("availability").doc("slot-123").get();
      });

      const appointmentData = appointmentDoc.data();
      const slotData = slotDoc.data();

      // Appointment should be failed
      expect(appointmentData?.status).toBe("payment_failed");
      expect(appointmentData?.payment.status).toBe("failed");

      // Slot should be free and available
      expect(slotData?.status).toBe("free");
      expect(slotData?.heldBy).toBeUndefined();
      expect(slotData?.bookedBy).toBeUndefined();
    });
  });
});
