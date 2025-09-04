import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import firebaseFunctionsTest from 'firebase-functions-test';
import { runReminders } from '../reminders-https';
import { sendEmailHandler, generateConfirmationEmailHtml, generateReminderEmailHtml } from '../email';

// Mock Firebase Admin
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
      where: vi.fn(() => ({
        get: vi.fn(),
      })),
    })),
  })),
}));

// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
  setApiKey: vi.fn(),
  send: vi.fn(),
}));

describe('Email and Reminder System', () => {
  let testEnv: RulesTestEnvironment;
  let mockDb: any;

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

    // Mock database
    mockDb = {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          set: vi.fn(),
          update: vi.fn(),
        })),
        where: vi.fn(() => ({
          get: vi.fn(),
        })),
      })),
    };

    // Set up environment variables
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_FROM_EMAIL = 'test@miamente.com';
    process.env.REMINDERS_AUTH_TOKEN = 'test-token';
    process.env.JITSI_BASE_URL = 'https://meet.jit.si';
  });

  afterEach(async () => {
    await testEnv.cleanup();
    vi.clearAllMocks();
  });

  describe('Email Templates', () => {
    it('should generate confirmation email HTML correctly', () => {
      const appointmentDate = new Date('2024-01-15T10:00:00');
      const jitsiUrl = 'https://meet.jit.si/miamente-appt-123-pro-123';
      const professionalName = 'Dr. Test Professional';

      const html = generateConfirmationEmailHtml(appointmentDate, jitsiUrl, professionalName);

      expect(html).toContain('¡Cita Confirmada!');
      expect(html).toContain('Dr. Test Professional');
      expect(html).toContain('https://meet.jit.si/miamente-appt-123-pro-123');
      expect(html).toContain('Unirme a la Sesión');
      expect(html).toContain('Política de Cancelación');
      expect(html).toContain('Cancelaciones:');
      expect(html).toContain('Reprogramaciones:');
      expect(html).toContain('No-show:');
      expect(html).toContain('Emergencias:');
    });

    it('should generate reminder email HTML correctly', () => {
      const appointmentDate = new Date('2024-01-15T10:00:00');
      const jitsiUrl = 'https://meet.jit.si/miamente-appt-123-pro-123';
      const hoursUntil = 24;
      const professionalName = 'Dr. Test Professional';

      const html = generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil, professionalName);

      expect(html).toContain('Recordatorio de Cita');
      expect(html).toContain('Dr. Test Professional');
      expect(html).toContain('https://meet.jit.si/miamente-appt-123-pro-123');
      expect(html).toContain('en 24 horas');
      expect(html).toContain('Unirme a la Sesión');
      expect(html).toContain('Preparación para la sesión:');
    });

    it('should generate 1-hour reminder email correctly', () => {
      const appointmentDate = new Date('2024-01-15T10:00:00');
      const jitsiUrl = 'https://meet.jit.si/miamente-appt-123-pro-123';
      const hoursUntil = 1;
      const professionalName = 'Dr. Test Professional';

      const html = generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil, professionalName);

      expect(html).toContain('en 1 hora');
      expect(html).toContain('Recordatorio de Cita');
    });
  });

  describe('SendGrid Email Handler', () => {
    it('should send email successfully', async () => {
      const mockSendGrid = require('@sendgrid/mail');
      mockSendGrid.send.mockResolvedValue([{
        headers: { 'x-message-id': 'test-message-id' }
      }]);

      const result = await sendEmailHandler(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: {
          email: 'test@miamente.com',
          name: 'Miamente',
        },
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });
    });

    it('should handle SendGrid errors gracefully', async () => {
      const mockSendGrid = require('@sendgrid/mail');
      mockSendGrid.send.mockRejectedValue(new Error('SendGrid API error'));

      const result = await sendEmailHandler(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('SendGrid API error');
    });
  });

  describe('Reminders HTTPS Function', () => {
    it('should process reminders successfully with valid token', async () => {
      // Mock appointments data
      const mockAppointments24h = {
        docs: [
          {
            id: 'appt-1',
            data: () => ({
              id: 'appt-1',
              userId: 'user-1',
              professionalId: 'pro-1',
              slot: { date: '2024-01-16', time: '10:00' },
              professional: { fullName: 'Dr. Test' },
              status: 'confirmed',
              sent24h: false
            })
          }
        ]
      };

      const mockAppointments1h = {
        docs: []
      };

      // Mock user data
      const mockUserDoc = {
        exists: true,
        data: () => ({ email: 'user@example.com' })
      };

      // Mock database calls
      mockDb.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'appointments') {
          return {
            where: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockAppointments24h)
            }))
          };
        }
        if (collectionName === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue(mockUserDoc)
            }))
          };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(),
            update: vi.fn()
          }))
        };
      });

      // Mock SendGrid
      const mockSendGrid = require('@sendgrid/mail');
      mockSendGrid.send.mockResolvedValue([{
        headers: { 'x-message-id': 'test-message-id' }
      }]);

      // Create mock request
      const mockRequest = {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Execute the function
      await runReminders(mockRequest as any, mockResponse as any);

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          remindersSent: expect.objectContaining({
            '24h': expect.any(Number),
            '1h': expect.any(Number)
          })
        })
      );
    });

    it('should reject requests without valid token', async () => {
      const mockRequest = {
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };

      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      await runReminders(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
    });

    it('should reject requests without authorization header', async () => {
      const mockRequest = {
        method: 'GET',
        headers: {}
      };

      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      await runReminders(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
    });

    it('should reject non-GET requests', async () => {
      const mockRequest = {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      await runReminders(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(405);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    it('should handle OPTIONS requests for CORS', async () => {
      const mockRequest = {
        method: 'OPTIONS',
        headers: {}
      };

      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
      };

      await runReminders(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalledWith('');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing SendGrid configuration', async () => {
      delete process.env.SENDGRID_API_KEY;

      const result = await sendEmailHandler(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('SENDGRID_API_KEY');
    });

    it('should handle database errors in reminders', async () => {
      // Mock database error
      mockDb.collection.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const mockRequest = {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      await runReminders(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database connection failed'
        })
      );
    });
  });
});
