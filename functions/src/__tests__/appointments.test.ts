import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { httpsCallable } from 'firebase-functions-test';
import { bookAppointment } from '../appointments';

// Mock Firebase Admin
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    runTransaction: vi.fn(),
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
    })),
  })),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
  })),
}));

describe('Appointment Booking', () => {
  let testEnv: RulesTestEnvironment;
  let mockDb: any;
  let mockTransaction: any;

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

    // Mock database and transaction
    mockDb = {
      runTransaction: vi.fn(),
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          set: vi.fn(),
          update: vi.fn(),
        })),
      })),
    };

    mockTransaction = {
      get: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
    };

    mockDb.runTransaction.mockImplementation(async (callback: any) => {
      return await callback(mockTransaction);
    });
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('bookAppointment', () => {
    it('should successfully book an appointment when slot is available', async () => {
      // Mock data
      const mockSlotData = {
        professionalId: 'pro-123',
        status: 'free',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockProData = {
        fullName: 'Dr. Test Professional',
        specialty: 'Psicología Clínica',
        rateCents: 80000,
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      const mockProDoc = {
        exists: true,
        data: () => mockProData,
      };

      // Mock transaction behavior
      mockTransaction.get
        .mockResolvedValueOnce(mockSlotDoc) // Slot document
        .mockResolvedValueOnce(mockProDoc); // Professional document

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute the function
      const result = await bookAppointmentCallable(mockRequest);

      // Verify the result
      expect(result.data).toHaveProperty('appointmentId');
      expect(typeof result.data.appointmentId).toBe('string');

      // Verify transaction was called
      expect(mockDb.runTransaction).toHaveBeenCalledTimes(1);
    });

    it('should fail when slot is not available (already booked)', async () => {
      // Mock data for already booked slot
      const mockSlotData = {
        professionalId: 'pro-123',
        status: 'held', // Already held
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockSlotDoc);

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'Slot is no longer available'
      );
    });

    it('should fail when slot does not exist', async () => {
      // Mock non-existent slot
      const mockSlotDoc = {
        exists: false,
        data: () => null,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockSlotDoc);

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'non-existent-slot',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'Slot not found'
      );
    });

    it('should fail when professional does not exist', async () => {
      // Mock slot data
      const mockSlotData = {
        professionalId: 'pro-123',
        status: 'free',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      // Mock non-existent professional
      const mockProDoc = {
        exists: false,
        data: () => null,
      };

      // Mock transaction behavior
      mockTransaction.get
        .mockResolvedValueOnce(mockSlotDoc) // Slot document
        .mockResolvedValueOnce(mockProDoc); // Professional document

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'Professional not found'
      );
    });

    it('should fail when user is not authenticated', async () => {
      // Mock request without authentication
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: null,
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'User must be authenticated'
      );
    });

    it('should fail when required parameters are missing', async () => {
      // Mock request with missing parameters
      const mockRequest = {
        data: {
          proId: 'pro-123',
          // slotId missing
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'proId and slotId are required'
      );
    });
  });

  describe('Slot Competition Scenarios', () => {
    it('should handle concurrent booking attempts for the same slot', async () => {
      // Mock data
      const mockSlotData = {
        professionalId: 'pro-123',
        status: 'free',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockProData = {
        fullName: 'Dr. Test Professional',
        specialty: 'Psicología Clínica',
        rateCents: 80000,
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      const mockProDoc = {
        exists: true,
        data: () => mockProData,
      };

      // Mock transaction behavior for first user
      mockTransaction.get
        .mockResolvedValueOnce(mockSlotDoc) // Slot document
        .mockResolvedValueOnce(mockProDoc); // Professional document

      // Mock request for first user
      const mockRequest1 = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-1',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // First user should succeed
      const result1 = await bookAppointmentCallable(mockRequest1);
      expect(result1.data).toHaveProperty('appointmentId');

      // Now mock the slot as already held for second user
      const mockSlotDataHeld = {
        ...mockSlotData,
        status: 'held',
        heldBy: 'user-1',
      };

      const mockSlotDocHeld = {
        exists: true,
        data: () => mockSlotDataHeld,
      };

      // Reset transaction mock for second user
      mockTransaction.get.mockResolvedValueOnce(mockSlotDocHeld);

      // Mock request for second user
      const mockRequest2 = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-2',
        },
      };

      // Second user should fail
      await expect(bookAppointmentCallable(mockRequest2)).rejects.toThrow(
        'Slot is no longer available'
      );
    });

    it('should handle race condition where slot becomes unavailable during transaction', async () => {
      // Mock data
      const mockSlotData = {
        professionalId: 'pro-123',
        status: 'free',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockProData = {
        fullName: 'Dr. Test Professional',
        specialty: 'Psicología Clínica',
        rateCents: 80000,
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      const mockProDoc = {
        exists: true,
        data: () => mockProData,
      };

      // Mock transaction that fails due to race condition
      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        // Simulate race condition by throwing an error
        throw new Error('Transaction failed due to race condition');
      });

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'Failed to book appointment'
      );
    });
  });

  describe('Data Validation', () => {
    it('should validate professional rate is configured', async () => {
      // Mock data with missing rate
      const mockSlotData = {
        professionalId: 'pro-123',
        status: 'free',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockProData = {
        fullName: 'Dr. Test Professional',
        specialty: 'Psicología Clínica',
        // rateCents missing
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      const mockProDoc = {
        exists: true,
        data: () => mockProData,
      };

      // Mock transaction behavior
      mockTransaction.get
        .mockResolvedValueOnce(mockSlotDoc) // Slot document
        .mockResolvedValueOnce(mockProDoc); // Professional document

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123',
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'Professional rate not configured'
      );
    });

    it('should validate slot belongs to specified professional', async () => {
      // Mock data with mismatched professional ID
      const mockSlotData = {
        professionalId: 'pro-456', // Different from request
        status: 'free',
        date: '2024-01-15',
        time: '10:00',
        duration: 60,
        timezone: 'America/Bogota',
      };

      const mockSlotDoc = {
        exists: true,
        data: () => mockSlotData,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockSlotDoc);

      // Mock request
      const mockRequest = {
        data: {
          proId: 'pro-123', // Different from slot
          slotId: 'slot-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const bookAppointmentCallable = httpsCallable(bookAppointment);

      // Execute and expect failure
      await expect(bookAppointmentCallable(mockRequest)).rejects.toThrow(
        'Slot does not belong to the specified professional'
      );
    });
  });
});
