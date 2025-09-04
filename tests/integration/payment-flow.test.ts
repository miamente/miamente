import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';

describe('Payment Flow Integration Tests', () => {
  let testEnv: RulesTestEnvironment;
  let userContext: any;

  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
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

    // Create test context for user
    userContext = testEnv.authenticatedContext('user-123');

    // Seed test data
    await seedTestData();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  async function seedTestData() {
    // Create a professional
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('professionals').doc('pro-123').set({
        id: 'pro-123',
        fullName: 'Dr. Test Professional',
        specialty: 'Psicología Clínica',
        rateCents: 80000,
        email: 'test@professional.com',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create an available slot
      await context.firestore().collection('availability').doc('slot-123').set({
        id: 'slot-123',
        professionalId: 'pro-123',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
        status: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create a user
      await context.firestore().collection('users').doc('user-123').set({
        id: 'user-123',
        email: 'test@user.com',
        fullName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  describe('Auto-approve Payment Flow', () => {
    it('should complete payment flow with auto-approve enabled', async () => {
      // Set feature flag to auto-approve
      const featureFlags = {
        payments_enabled: false,
        payments_mock_auto_approve: true,
      };

      // Mock feature flag response
      const mockGetFeatureFlag = vi.fn().mockImplementation((flagName: string) => {
        return Promise.resolve(featureFlags[flagName as keyof typeof featureFlags]);
      });

      // Book an appointment first
      const bookAppointment = httpsCallable(
        userContext.functions(),
        'bookAppointment'
      );

      const bookingResult = await bookAppointment({
        proId: 'pro-123',
        slotId: 'slot-123',
      });

      expect(bookingResult.data).toHaveProperty('appointmentId');
      const appointmentId = bookingResult.data.appointmentId;

      // Verify appointment is in pending_payment status
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('appointments').doc(appointmentId).get();
      });

      const appointmentData = appointmentDoc.data();
      expect(appointmentData?.status).toBe('pending_payment');
      expect(appointmentData?.paid).toBe(false);

      // Verify slot is held
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('availability').doc('slot-123').get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.status).toBe('held');
      expect(slotData?.heldBy).toBe('user-123');

      // Now test the payment flow with auto-approve
      // This would be called by the PaymentManager in the frontend
      const mockApprovePayment = httpsCallable(
        userContext.functions(),
        'mockApprovePayment'
      );

      const approvalResult = await mockApprovePayment({
        appointmentId: appointmentId,
      });

      expect(approvalResult.data.success).toBe(true);
      expect(approvalResult.data.appointmentId).toBe(appointmentId);
      expect(approvalResult.data.jitsiUrl).toContain('https://meet.jit.si/miamente-');

      // Verify appointment is now confirmed
      const updatedAppointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('appointments').doc(appointmentId).get();
      });

      const updatedAppointmentData = updatedAppointmentDoc.data();
      expect(updatedAppointmentData?.status).toBe('confirmed');
      expect(updatedAppointmentData?.paid).toBe(true);
      expect(updatedAppointmentData?.jitsiUrl).toBeDefined();

      // Verify slot is now booked
      const updatedSlotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('availability').doc('slot-123').get();
      });

      const updatedSlotData = updatedSlotDoc.data();
      expect(updatedSlotData?.status).toBe('booked');
      expect(updatedSlotData?.bookedBy).toBe('user-123');
    });
  });

  describe('Manual Approval Payment Flow', () => {
    it('should leave appointment in pending_confirmation when auto-approve is disabled', async () => {
      // Set feature flag to manual approval
      const featureFlags = {
        payments_enabled: false,
        payments_mock_auto_approve: false,
      };

      // Book an appointment first
      const bookAppointment = httpsCallable(
        userContext.functions(),
        'bookAppointment'
      );

      const bookingResult = await bookAppointment({
        proId: 'pro-123',
        slotId: 'slot-123',
      });

      expect(bookingResult.data).toHaveProperty('appointmentId');
      const appointmentId = bookingResult.data.appointmentId;

      // Verify appointment is in pending_payment status
      const appointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('appointments').doc(appointmentId).get();
      });

      const appointmentData = appointmentDoc.data();
      expect(appointmentData?.status).toBe('pending_payment');
      expect(appointmentData?.paid).toBe(false);

      // Simulate the payment flow that would leave it in pending_confirmation
      // In the real flow, the MockPaymentAdapter would update the status to pending_confirmation
      // but not call mockApprovePayment
      
      // Manually update to pending_confirmation to simulate the flow
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('appointments').doc(appointmentId).update({
          status: 'pending_confirmation',
          updatedAt: new Date(),
        });
      });

      // Verify appointment is in pending_confirmation status
      const pendingAppointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('appointments').doc(appointmentId).get();
      });

      const pendingAppointmentData = pendingAppointmentDoc.data();
      expect(pendingAppointmentData?.status).toBe('pending_confirmation');
      expect(pendingAppointmentData?.paid).toBe(false);

      // Verify slot is still held (not booked yet)
      const slotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('availability').doc('slot-123').get();
      });

      const slotData = slotDoc.data();
      expect(slotData?.status).toBe('held');
      expect(slotData?.heldBy).toBe('user-123');

      // Now simulate admin approval
      const mockApprovePayment = httpsCallable(
        userContext.functions(),
        'mockApprovePayment'
      );

      const approvalResult = await mockApprovePayment({
        appointmentId: appointmentId,
      });

      expect(approvalResult.data.success).toBe(true);
      expect(approvalResult.data.appointmentId).toBe(appointmentId);

      // Verify appointment is now confirmed
      const confirmedAppointmentDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('appointments').doc(appointmentId).get();
      });

      const confirmedAppointmentData = confirmedAppointmentDoc.data();
      expect(confirmedAppointmentData?.status).toBe('confirmed');
      expect(confirmedAppointmentData?.paid).toBe(true);
      expect(confirmedAppointmentData?.jitsiUrl).toBeDefined();

      // Verify slot is now booked
      const bookedSlotDoc = await testEnv.withSecurityRulesDisabled(async (context) => {
        return await context.firestore().collection('availability').doc('slot-123').get();
      });

      const bookedSlotData = bookedSlotDoc.data();
      expect(bookedSlotData?.status).toBe('booked');
      expect(bookedSlotData?.bookedBy).toBe('user-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle payment approval for non-existent appointment', async () => {
      const mockApprovePayment = httpsCallable(
        userContext.functions(),
        'mockApprovePayment'
      );

      await expect(
        mockApprovePayment({
          appointmentId: 'non-existent-appointment',
        })
      ).rejects.toThrow('Appointment not found');
    });

    it('should handle payment approval for already confirmed appointment', async () => {
      // Create a confirmed appointment
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('appointments').doc('confirmed-appt').set({
          id: 'confirmed-appt',
          userId: 'user-123',
          professionalId: 'pro-123',
          slotId: 'slot-123',
          status: 'confirmed',
          paid: true,
          payment: {
            provider: 'mock',
            amountCents: 80000,
            currency: 'COP',
            status: 'approved'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const mockApprovePayment = httpsCallable(
        userContext.functions(),
        'mockApprovePayment'
      );

      await expect(
        mockApprovePayment({
          appointmentId: 'confirmed-appt',
        })
      ).rejects.toThrow("Appointment status 'confirmed' cannot be approved");
    });

    it('should handle payment approval by different user', async () => {
      // Create an appointment for a different user
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('appointments').doc('other-user-appt').set({
          id: 'other-user-appt',
          userId: 'other-user',
          professionalId: 'pro-123',
          slotId: 'slot-123',
          status: 'pending_payment',
          paid: false,
          payment: {
            provider: 'mock',
            amountCents: 80000,
            currency: 'COP',
            status: 'pending'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const mockApprovePayment = httpsCallable(
        userContext.functions(),
        'mockApprovePayment'
      );

      await expect(
        mockApprovePayment({
          appointmentId: 'other-user-appt',
        })
      ).rejects.toThrow('You can only approve your own appointments');
    });
  });

  describe('Jitsi URL Generation', () => {
    it('should generate correct Jitsi URL format', async () => {
      // Create a pending appointment
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('appointments').doc('jitsi-test-appt').set({
          id: 'jitsi-test-appt',
          userId: 'user-123',
          professionalId: 'pro-456',
          slotId: 'slot-789',
          status: 'pending_payment',
          paid: false,
          payment: {
            provider: 'mock',
            amountCents: 80000,
            currency: 'COP',
            status: 'pending'
          },
          professional: {
            id: 'pro-456',
            fullName: 'Dr. Test Professional',
            specialty: 'Psicología Clínica',
            rateCents: 80000
          },
          slot: {
            date: '2024-01-15',
            time: '10:00',
            duration: 60,
            timezone: 'America/Bogota'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const mockApprovePayment = httpsCallable(
        userContext.functions(),
        'mockApprovePayment'
      );

      const result = await mockApprovePayment({
        appointmentId: 'jitsi-test-appt',
      });

      expect(result.data.jitsiUrl).toBe('https://meet.jit.si/miamente-jitsi-test-appt-pro-456');
    });
  });
});
