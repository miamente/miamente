import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore();

interface MockApprovePaymentRequest {
  appointmentId: string;
}

interface MockApprovePaymentResponse {
  success: boolean;
  message: string;
  appointmentId: string;
  jitsiUrl?: string;
}

/**
 * Mock Payment Approval Function
 * 
 * This function simulates payment approval for development and testing.
 * It should only be available in development/staging environments.
 * 
 * In production, this would be replaced by actual payment gateway webhooks.
 */
export const mockApprovePayment = onCall<MockApprovePaymentRequest, Promise<MockApprovePaymentResponse>>(
  { region: 'us-central1' },
  async (request) => {
    const { appointmentId } = request.data;
    const { auth } = request;

    // Verify authentication
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to approve payments');
    }

    // Validate input
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'appointmentId is required');
    }

    try {
      // Use transaction to ensure atomicity
      const result = await db.runTransaction(async (transaction) => {
        // Get the appointment document
        const appointmentRef = db.collection('appointments').doc(appointmentId);
        const appointmentDoc = await transaction.get(appointmentRef);

        if (!appointmentDoc.exists) {
          throw new HttpsError('not-found', 'Appointment not found');
        }

        const appointmentData = appointmentDoc.data();
        
        // Verify the appointment belongs to the authenticated user
        if (appointmentData?.userId !== auth.uid) {
          throw new HttpsError('permission-denied', 'You can only approve your own appointments');
        }

        // Verify appointment is in a valid state for approval
        if (!['pending_payment', 'pending_confirmation'].includes(appointmentData?.status)) {
          throw new HttpsError('failed-precondition', `Appointment status '${appointmentData?.status}' cannot be approved`);
        }

        // Generate Jitsi URL
        const jitsiUrl = generateJitsiUrl(appointmentId, appointmentData.professionalId);

        // Update appointment status to confirmed and mark as paid
        transaction.update(appointmentRef, {
          status: 'confirmed',
          paid: true,
          payment: {
            ...appointmentData.payment,
            status: 'approved',
            approvedAt: FieldValue.serverTimestamp()
          },
          jitsiUrl,
          confirmedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });

        // Update slot status to booked
        if (appointmentData?.slotId) {
          const slotRef = db.collection('availability').doc(appointmentData.slotId);
          transaction.update(slotRef, {
            status: 'booked',
            bookedBy: auth.uid,
            bookedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
        }

        return {
          appointmentData,
          jitsiUrl
        };
      });

      // Send confirmation email
      await sendConfirmationEmail(appointmentId, result.jitsiUrl);

      // Log successful approval
      console.log(`Mock payment approved successfully: ${appointmentId} for user ${auth.uid}`);

      return {
        success: true,
        message: 'Payment approved successfully',
        appointmentId,
        jitsiUrl: result.jitsiUrl
      };

    } catch (error) {
      console.error('Error approving mock payment:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to approve payment. Please try again.');
    }
  }
);

/**
 * Generate Jitsi URL for the appointment
 */
function generateJitsiUrl(appointmentId: string, professionalId: string): string {
  const baseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';
  const roomName = `miamente-${appointmentId}-${professionalId}`;
  
  // Add JWT token if configured
  const jwtToken = process.env.JITSI_JWT_SECRET;
  if (jwtToken) {
    // In a real implementation, you would generate a proper JWT token
    // For now, we'll use a simple approach
    return `${baseUrl}/${roomName}?jwt=${jwtToken}`;
  }
  
  return `${baseUrl}/${roomName}`;
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(appointmentId: string, jitsiUrl: string): Promise<void> {
  try {
    // Get appointment details for email
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();
    
    if (!appointmentDoc.exists) {
      console.error('Appointment not found for email confirmation');
      return;
    }

    const appointmentData = appointmentDoc.data();
    
    // Get user details
    const userRef = db.collection('users').doc(appointmentData?.userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error('User not found for email confirmation');
      return;
    }

    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
      console.error('User email not found for confirmation');
      return;
    }

    // Check if SendGrid is configured
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.log('SendGrid not configured, skipping email confirmation');
      return;
    }

    // Send email using SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendGridApiKey);

    const emailContent = generateConfirmationEmail(appointmentData, jitsiUrl);

    const msg = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@miamente.com',
      subject: 'Cita Confirmada - Miamente',
      html: emailContent,
    };

    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${userEmail} for appointment ${appointmentId}`);

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error for email failures
  }
}

/**
 * Generate confirmation email HTML content
 */
function generateConfirmationEmail(appointmentData: any, jitsiUrl: string): string {
  const { professional, slot, payment } = appointmentData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cita Confirmada - Miamente</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .appointment-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Cita Confirmada!</h1>
          <p>Tu pago ha sido procesado exitosamente</p>
        </div>
        
        <div class="content">
          <h2>Detalles de tu Cita</h2>
          
          <div class="appointment-details">
            <h3>Profesional</h3>
            <p><strong>${professional.fullName}</strong><br>
            ${professional.specialty}</p>
            
            <h3>Fecha y Hora</h3>
            <p>${slot.date} a las ${slot.time}<br>
            Duración: ${slot.duration} minutos</p>
            
            <h3>Pago</h3>
            <p>Total pagado: ${new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            }).format(payment.amountCents)}</p>
          </div>
          
          <h3>Acceso a la Videollamada</h3>
          <p>Tu sesión estará disponible 5 minutos antes de la hora programada.</p>
          
          <a href="${jitsiUrl}" class="button">Acceder a la Videollamada</a>
          
          <h3>Próximos Pasos</h3>
          <ul>
            <li>Recibirás un recordatorio 24 horas antes de tu cita</li>
            <li>Podrás acceder a la videollamada 5 minutos antes</li>
            <li>Después de la sesión, podrás dejar una reseña</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Si tienes alguna pregunta, contáctanos en support@miamente.com</p>
          <p>© 2024 Miamente. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
