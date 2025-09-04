import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import firebaseFunctionsTest from 'firebase-functions-test';
import { adminConfirmPayment, adminFailPayment } from '../admin-payments';

// Mock Firebase Admin
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    runTransaction: vi.fn(),
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        add: vi.fn(),
      })),
      add: vi.fn(),
    })),
  })),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
  })),
}));

// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
  setApiKey: vi.fn(),
  send: vi.fn(),
}));

describe('Admin Payment Functions', () => {
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
        add: vi.fn(),
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

    // Set up environment variables
    process.env.JITSI_BASE_URL = 'https://meet.jit.si';
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_FROM_EMAIL = 'test@miamente.com';
  });

  afterEach(async () => {
    await testEnv.cleanup();
    vi.clearAllMocks();
  });

  describe('adminConfirmPayment', () => {
    it('should successfully confirm payment for admin user', async () => {
      // Mock admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock appointment data
      const mockAppointmentData = {
        userId: 'user-123',
        professionalId: 'pro-123',
        slotId: 'slot-123',
        status: 'pending_confirmation',
        paid: false,
        payment: {
          provider: 'mock',
          amountCents: 80000,
          currency: 'COP',
          status: 'pending'
        },
        professional: {
          id: 'pro-123',
          fullName: 'Dr. Test Professional',
          specialty: 'Psicología Clínica',
          rateCents: 80000
        },
        slot: {
          date: '2024-01-15',
          time: '10:00',
          duration: 60,
          timezone: 'America/Bogota'
        }
      };

      const mockAppointmentDoc = {
        exists: true,
        data: () => mockAppointmentData,
      };

      // Mock transaction behavior
      mockTransaction.get
        .mockResolvedValueOnce(mockAppointmentDoc); // Appointment document

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute the function
      const result = await adminConfirmPaymentCallable(mockRequest);

      // Verify the result
      expect(result.data).toEqual({
        success: true,
        message: 'Payment confirmed successfully',
        appointmentId: 'appt-123',
        jitsiUrl: expect.stringContaining('https://meet.jit.si/miamente-appt-123-pro-123')
      });

      // Verify transaction was called
      expect(mockDb.runTransaction).toHaveBeenCalledTimes(1);
    });

    it('should fail when user is not admin', async () => {
      // Mock non-admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'user' }), // Not admin
      };

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute and expect failure
      await expect(adminConfirmPaymentCallable(mockRequest)).rejects.toThrow(
        'Only admin users can confirm payments'
      );
    });

    it('should fail when user is not authenticated', async () => {
      // Mock request without authentication
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: null,
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute and expect failure
      await expect(adminConfirmPaymentCallable(mockRequest)).rejects.toThrow(
        'User must be authenticated'
      );
    });

    it('should fail when appointment is not found', async () => {
      // Mock admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock non-existent appointment
      const mockAppointmentDoc = {
        exists: false,
        data: () => null,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'non-existent-appt',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute and expect failure
      await expect(adminConfirmPaymentCallable(mockRequest)).rejects.toThrow(
        'Appointment not found'
      );
    });

    it('should fail when appointment status is not approvable', async () => {
      // Mock admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock appointment with confirmed status
      const mockAppointmentData = {
        userId: 'user-123',
        professionalId: 'pro-123',
        slotId: 'slot-123',
        status: 'confirmed', // Already confirmed
        paid: true,
        payment: {
          provider: 'mock',
          amountCents: 80000,
          currency: 'COP',
          status: 'approved'
        }
      };

      const mockAppointmentDoc = {
        exists: true,
        data: () => mockAppointmentData,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute and expect failure
      await expect(adminConfirmPaymentCallable(mockRequest)).rejects.toThrow(
        "Appointment status 'confirmed' cannot be confirmed"
      );
    });

    it('should fail when appointmentId is missing', async () => {
      // Mock admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request with missing appointmentId
      const mockRequest = {
        data: {
          // appointmentId missing
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute and expect failure
      await expect(adminConfirmPaymentCallable(mockRequest)).rejects.toThrow(
        'appointmentId is required'
      );
    });
  });

  describe('adminFailPayment', () => {
    it('should successfully fail payment for admin user', async () => {
      // Mock admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock appointment data
      const mockAppointmentData = {
        userId: 'user-123',
        professionalId: 'pro-123',
        slotId: 'slot-123',
        status: 'pending_confirmation',
        paid: false,
        payment: {
          provider: 'mock',
          amountCents: 80000,
          currency: 'COP',
          status: 'pending'
        }
      };

      const mockAppointmentDoc = {
        exists: true,
        data: () => mockAppointmentData,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminFailPaymentCallable = test.wrap(adminFailPayment);

      // Execute the function
      const result = await adminFailPaymentCallable(mockRequest);

      // Verify the result
      expect(result.data).toEqual({
        success: true,
        message: 'Payment marked as failed successfully',
        appointmentId: 'appt-123'
      });

      // Verify transaction was called
      expect(mockDb.runTransaction).toHaveBeenCalledTimes(1);
    });

    it('should fail when user is not admin', async () => {
      // Mock non-admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'user' }), // Not admin
      };

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminFailPaymentCallable = test.wrap(adminFailPayment);

      // Execute and expect failure
      await expect(adminFailPaymentCallable(mockRequest)).rejects.toThrow(
        'Only admin users can fail payments'
      );
    });

    it('should fail when appointment status is not failable', async () => {
      // Mock admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock appointment with confirmed status
      const mockAppointmentData = {
        userId: 'user-123',
        professionalId: 'pro-123',
        slotId: 'slot-123',
        status: 'confirmed', // Already confirmed
        paid: true,
        payment: {
          provider: 'mock',
          amountCents: 80000,
          currency: 'COP',
          status: 'approved'
        }
      };

      const mockAppointmentDoc = {
        exists: true,
        data: () => mockAppointmentData,
      };

      // Mock transaction behavior
      mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminFailPaymentCallable = test.wrap(adminFailPayment);

      // Execute and expect failure
      await expect(adminFailPaymentCallable(mockRequest)).rejects.toThrow(
        "Appointment status 'confirmed' cannot be marked as failed"
      );
    });
  });

  describe('Admin Privilege Tests', () => {
    it('should check admin role correctly', async () => {
      // Mock admin user with role field
      const mockAdminUserDoc = {
        exists: true,
        data: () => ({ role: 'admin' }),
      };

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockAdminUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock appointment data
      const mockAppointmentData = {
        userId: 'user-123',
        professionalId: 'pro-123',
        slotId: 'slot-123',
        status: 'pending_confirmation',
        paid: false,
        payment: {
          provider: 'mock',
          amountCents: 80000,
          currency: 'COP',
          status: 'pending'
        }
      };

      const mockAppointmentDoc = {
        exists: true,
        data: () => mockAppointmentData,
      };

      mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute the function
      const result = await adminConfirmPaymentCallable(mockRequest);

      // Verify the result
      expect(result.data.success).toBe(true);
    });

    it('should check isAdmin field correctly', async () => {
      // Mock admin user with isAdmin field
      const mockAdminUserDoc = {
        exists: true,
        data: () => ({ isAdmin: true }),
      };

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockAdminUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock appointment data
      const mockAppointmentData = {
        userId: 'user-123',
        professionalId: 'pro-123',
        slotId: 'slot-123',
        status: 'pending_confirmation',
        paid: false,
        payment: {
          provider: 'mock',
          amountCents: 80000,
          currency: 'COP',
          status: 'pending'
        }
      };

      const mockAppointmentDoc = {
        exists: true,
        data: () => mockAppointmentData,
      };

      mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'admin-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute the function
      const result = await adminConfirmPaymentCallable(mockRequest);

      // Verify the result
      expect(result.data.success).toBe(true);
    });

    it('should reject non-admin users', async () => {
      // Mock non-admin user
      const mockUserDoc = {
        exists: true,
        data: () => ({ role: 'user', isAdmin: false }),
      };

      // Mock user collection for admin check
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc),
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
          })),
          add: vi.fn(),
        };
      });

      // Mock request
      const mockRequest = {
        data: {
          appointmentId: 'appt-123',
        },
        auth: {
          uid: 'user-123',
        },
      };

      // Create the callable function
      const test = firebaseFunctionsTest();
      const adminConfirmPaymentCallable = test.wrap(adminConfirmPayment);

      // Execute and expect failure
      await expect(adminConfirmPaymentCallable(mockRequest)).rejects.toThrow(
        'Only admin users can confirm payments'
      );
    });
  });
});
