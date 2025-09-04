import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import firebaseFunctionsTest from 'firebase-functions-test';
import { mockApprovePayment } from '../mock-payment';
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
// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
    setApiKey: vi.fn(),
    send: vi.fn(),
}));
describe('Mock Payment Approval', () => {
    let testEnv;
    let mockDb;
    let mockTransaction;
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
        mockDb.runTransaction.mockImplementation(async (callback) => {
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
    describe('mockApprovePayment', () => {
        it('should successfully approve a pending payment appointment', async () => {
            // Mock data
            const mockAppointmentData = {
                userId: 'user-123',
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
            mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);
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
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute the function
            const result = await mockApprovePaymentCallable(mockRequest);
            // Verify the result
            expect(result.data).toEqual({
                success: true,
                message: 'Payment approved successfully',
                appointmentId: 'appt-123',
                jitsiUrl: expect.stringContaining('https://meet.jit.si/miamente-appt-123-pro-123')
            });
            // Verify transaction was called
            expect(mockDb.runTransaction).toHaveBeenCalledTimes(1);
        });
        it('should successfully approve a pending_confirmation appointment', async () => {
            // Mock data
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
            mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);
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
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute the function
            const result = await mockApprovePaymentCallable(mockRequest);
            // Verify the result
            expect(result.data.success).toBe(true);
            expect(result.data.appointmentId).toBe('appt-123');
            expect(result.data.jitsiUrl).toContain('https://meet.jit.si/miamente-appt-123-pro-123');
        });
        it('should fail when appointment is not found', async () => {
            // Mock non-existent appointment
            const mockAppointmentDoc = {
                exists: false,
                data: () => null,
            };
            // Mock transaction behavior
            mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);
            // Mock request
            const mockRequest = {
                data: {
                    appointmentId: 'non-existent-appt',
                },
                auth: {
                    uid: 'user-123',
                },
            };
            // Create the callable function
            const test = firebaseFunctionsTest();
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute and expect failure
            await expect(mockApprovePaymentCallable(mockRequest)).rejects.toThrow('Appointment not found');
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
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute and expect failure
            await expect(mockApprovePaymentCallable(mockRequest)).rejects.toThrow('User must be authenticated');
        });
        it('should fail when appointment does not belong to user', async () => {
            // Mock data with different user
            const mockAppointmentData = {
                userId: 'different-user',
                professionalId: 'pro-123',
                slotId: 'slot-123',
                status: 'pending_payment',
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
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute and expect failure
            await expect(mockApprovePaymentCallable(mockRequest)).rejects.toThrow('You can only approve your own appointments');
        });
        it('should fail when appointment status is not approvable', async () => {
            // Mock data with confirmed status
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
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute and expect failure
            await expect(mockApprovePaymentCallable(mockRequest)).rejects.toThrow("Appointment status 'confirmed' cannot be approved");
        });
        it('should fail when appointmentId is missing', async () => {
            // Mock request with missing appointmentId
            const mockRequest = {
                data: {
                // appointmentId missing
                },
                auth: {
                    uid: 'user-123',
                },
            };
            // Create the callable function
            const test = firebaseFunctionsTest();
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute and expect failure
            await expect(mockApprovePaymentCallable(mockRequest)).rejects.toThrow('appointmentId is required');
        });
        it('should generate correct Jitsi URL', async () => {
            // Mock data
            const mockAppointmentData = {
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
                }
            };
            const mockAppointmentDoc = {
                exists: true,
                data: () => mockAppointmentData,
            };
            // Mock transaction behavior
            mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);
            // Mock request
            const mockRequest = {
                data: {
                    appointmentId: 'appt-456',
                },
                auth: {
                    uid: 'user-123',
                },
            };
            // Create the callable function
            const test = firebaseFunctionsTest();
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute the function
            const result = await mockApprovePaymentCallable(mockRequest);
            // Verify Jitsi URL format
            expect(result.data.jitsiUrl).toBe('https://meet.jit.si/miamente-appt-456-pro-456');
        });
        it('should handle JWT token in Jitsi URL when configured', async () => {
            // Set JWT secret
            process.env.JITSI_JWT_SECRET = 'test-jwt-secret';
            // Mock data
            const mockAppointmentData = {
                userId: 'user-123',
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
            mockTransaction.get.mockResolvedValueOnce(mockAppointmentDoc);
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
            const mockApprovePaymentCallable = test.wrap(mockApprovePayment);
            // Execute the function
            const result = await mockApprovePaymentCallable(mockRequest);
            // Verify Jitsi URL includes JWT
            expect(result.data.jitsiUrl).toContain('jwt=test-jwt-secret');
        });
    });
});
