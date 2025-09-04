import { httpsCallable } from "firebase/functions";

import type { PaymentService, PaymentCheckoutResult, PaymentReturnParams } from "../PaymentService";

import { getFirebaseFunctions } from "@/lib/firebase";

/**
 * Mock Payment Adapter
 *
 * Simulates payment processing for development and testing.
 * Supports both auto-approve and manual approval modes.
 */
export class MockPaymentAdapter implements PaymentService {
  private async getFeatureFlag(flagName: string): Promise<boolean> {
    try {
      // In a real implementation, this would fetch from Firebase Remote Config
      const featureFlags = {
        payments_enabled: false,
        payments_mock_auto_approve: true,
      };

      return featureFlags[flagName as keyof typeof featureFlags] || false;
    } catch (error) {
      console.error("Error fetching feature flag:", error);
      return true; // Default to auto-approve
    }
  }

  /**
   * Start checkout process
   * Changes appointment status to "pending_confirmation" and returns redirect URL
   */
  async startCheckout(appointmentId: string): Promise<PaymentCheckoutResult> {
    try {
      console.log(`[MockPaymentAdapter] Starting checkout for appointment: ${appointmentId}`);

      // Get appointment details
      const getAppointment = httpsCallable(getFirebaseFunctions(), "getAppointment");
      const result = await getAppointment({ appointmentId });
      const appointment = result.data as {
        id: string;
        payment: {
          amountCents: number;
          currency: string;
          provider: string;
        };
      } & Record<string, unknown>;

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Update appointment status to pending_confirmation
      await this.updateAppointmentStatus(appointmentId, "pending_confirmation");

      // Check if auto-approve is enabled
      const autoApprove = await this.getFeatureFlag("payments_mock_auto_approve");

      const sessionId = `mock_session_${appointmentId}_${Date.now()}`;

      if (autoApprove) {
        console.log(`[MockPaymentAdapter] Auto-approve enabled, redirecting to success`);

        // Call mockApprovePayment function for immediate approval
        try {
          const mockApprovePayment = httpsCallable(getFirebaseFunctions(), "mockApprovePayment");
          await mockApprovePayment({ appointmentId });
          console.log(
            `[MockPaymentAdapter] Mock payment approved automatically for appointment: ${appointmentId}`,
          );
        } catch (error) {
          console.error(`[MockPaymentAdapter] Error auto-approving payment:`, error);
          // Fallback to manual approval if auto-approval fails
        }

        return {
          redirectUrl: `/checkout/success?appt=${appointmentId}&session=${sessionId}`,
          sessionId,
          metadata: {
            provider: "mock",
            autoApproved: true,
            amount: appointment.payment.amountCents,
            currency: appointment.payment.currency,
          },
        };
      } else {
        console.log(`[MockPaymentAdapter] Auto-approve disabled, redirecting to pending`);

        // Leave appointment in pending_confirmation status
        // No automatic approval - admin will need to manually approve

        return {
          redirectUrl: `/checkout/pending?appt=${appointmentId}&session=${sessionId}`,
          sessionId,
          metadata: {
            provider: "mock",
            autoApproved: false,
            amount: appointment.payment.amountCents,
            currency: appointment.payment.currency,
          },
        };
      }
    } catch (error) {
      console.error("[MockPaymentAdapter] Error in startCheckout:", error);
      throw new Error("Failed to start checkout process");
    }
  }

  /**
   * Handle return from payment gateway
   * For mock adapter, this is mainly for consistency with the interface
   */
  async handleReturn(params: PaymentReturnParams): Promise<void> {
    try {
      console.log(`[MockPaymentAdapter] Handling return with params:`, params);

      const { sessionId, status } = params;

      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      // Extract appointment ID from session ID
      const appointmentId = sessionId.split("_")[2];

      if (status === "success") {
        await this.updateAppointmentStatus(appointmentId, "confirmed");
      } else if (status === "failed") {
        await this.updateAppointmentStatus(appointmentId, "failed");
      } else if (status === "cancelled") {
        await this.updateAppointmentStatus(appointmentId, "cancelled");
      }

      console.log(
        `[MockPaymentAdapter] Return handling completed for appointment: ${appointmentId}`,
      );
    } catch (error) {
      console.error("[MockPaymentAdapter] Error in handleReturn:", error);
      throw new Error("Failed to handle payment return");
    }
  }

  /**
   * Get payment status for an appointment
   */
  async getPaymentStatus(appointmentId: string): Promise<{
    status: "pending" | "confirmed" | "failed" | "cancelled";
    amount?: number;
    currency?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  }> {
    try {
      const getAppointment = httpsCallable(getFirebaseFunctions(), "getAppointment");
      const result = await getAppointment({ appointmentId });
      const appointment = result.data as {
        id: string;
        status: string;
        payment?: {
          amountCents: number;
          currency: string;
          provider: string;
        };
        updatedAt: string;
      } & Record<string, unknown>;

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return {
        status:
          appointment.status === "confirmed"
            ? "confirmed"
            : appointment.status === "failed"
              ? "failed"
              : appointment.status === "cancelled"
                ? "cancelled"
                : "pending",
        amount: appointment.payment?.amountCents,
        currency: appointment.payment?.currency,
        provider: appointment.payment?.provider,
        metadata: {
          appointmentId,
          lastUpdated: appointment.updatedAt,
        },
      };
    } catch (error) {
      console.error("[MockPaymentAdapter] Error getting payment status:", error);
      throw new Error("Failed to get payment status");
    }
  }

  /**
   * Cancel a payment session
   */
  async cancelPayment(sessionId: string): Promise<void> {
    try {
      console.log(`[MockPaymentAdapter] Cancelling payment session: ${sessionId}`);

      // Extract appointment ID from session ID
      const appointmentId = sessionId.split("_")[2];

      // Update appointment status to cancelled
      await this.updateAppointmentStatus(appointmentId, "cancelled");

      // Release the slot
      await this.releaseSlot(appointmentId);

      console.log(`[MockPaymentAdapter] Payment cancelled for appointment: ${appointmentId}`);
    } catch (error) {
      console.error("[MockPaymentAdapter] Error cancelling payment:", error);
      throw new Error("Failed to cancel payment");
    }
  }

  /**
   * Update appointment status
   */
  private async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    try {
      // In a real implementation, this would call a Firebase function
      // For now, we'll simulate the update
      console.log(
        `[MockPaymentAdapter] Updating appointment ${appointmentId} status to: ${status}`,
      );

      // TODO: Implement actual Firebase function call to update appointment status
      // const updateAppointment = httpsCallable(functions, 'updateAppointment');
      // await updateAppointment({ appointmentId, status });
    } catch (error) {
      console.error("[MockPaymentAdapter] Error updating appointment status:", error);
      throw error;
    }
  }

  /**
   * Send confirmation email
   */
  private async sendConfirmationEmail(appointment: Record<string, unknown>): Promise<void> {
    try {
      console.log(
        `[MockPaymentAdapter] Sending confirmation email for appointment: ${appointment.id}`,
      );

      // TODO: Implement actual email sending
      // const sendEmail = httpsCallable(functions, 'sendEmail');
      // await sendEmail({
      //   to: appointment.userEmail,
      //   subject: 'Cita Confirmada - Miamente',
      //   html: `Tu cita ha sido confirmada...`
      // });
    } catch (error) {
      console.error("[MockPaymentAdapter] Error sending confirmation email:", error);
      // Don't throw error for email failures
    }
  }

  /**
   * Simulate manual approval process
   */
  private async simulateManualApproval(appointmentId: string): Promise<void> {
    try {
      console.log(
        `[MockPaymentAdapter] Simulating manual approval for appointment: ${appointmentId}`,
      );

      // Simulate approval after 5 seconds
      await this.updateAppointmentStatus(appointmentId, "confirmed");

      // Get appointment details for email
      const getAppointment = httpsCallable(getFirebaseFunctions(), "getAppointment");
      const result = await getAppointment({ appointmentId });
      const appointment = result.data as {
        id: string;
      } & Record<string, unknown>;

      await this.sendConfirmationEmail(appointment);

      console.log(
        `[MockPaymentAdapter] Manual approval completed for appointment: ${appointmentId}`,
      );
    } catch (error) {
      console.error("[MockPaymentAdapter] Error in manual approval:", error);
    }
  }

  /**
   * Release slot when payment is cancelled
   */
  private async releaseSlot(appointmentId: string): Promise<void> {
    try {
      console.log(`[MockPaymentAdapter] Releasing slot for appointment: ${appointmentId}`);

      // TODO: Implement actual slot release
      // const releaseSlot = httpsCallable(functions, 'releaseSlot');
      // await releaseSlot({ appointmentId });
    } catch (error) {
      console.error("[MockPaymentAdapter] Error releasing slot:", error);
      throw error;
    }
  }
}
