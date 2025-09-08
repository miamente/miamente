/**
 * Payment Service Interface
 *
 * Defines the contract for payment providers in the Miamente platform.
 * Each payment provider must implement this interface to be used in the system.
 */

export interface PaymentCheckoutResult {
  /** URL to redirect user to for payment completion */
  redirectUrl?: string;
  /** Client secret for client-side payment confirmation (e.g., Stripe) */
  clientSecret?: string;
  /** Payment session ID for tracking */
  sessionId?: string;
  /** Additional provider-specific data */
  metadata?: Record<string, unknown>;
}

export interface PaymentReturnParams {
  /** Payment session ID */
  sessionId?: string;
  /** Payment intent ID */
  paymentIntentId?: string;
  /** Transaction reference */
  reference?: string;
  /** Payment status */
  status?: string;
  /** Additional provider-specific parameters */
  [key: string]: unknown;
}

export interface PaymentService {
  /**
   * Start the checkout process for an appointment
   * @param appointmentId - The appointment ID to process payment for
   * @returns Promise with checkout result containing redirect URL or client secret
   */
  startCheckout(appointmentId: string): Promise<PaymentCheckoutResult>;

  /**
   * Handle return from payment gateway (for redirect-based flows)
   * @param params - Parameters returned from the payment gateway
   * @returns Promise that resolves when processing is complete
   */
  handleReturn(params: PaymentReturnParams): Promise<void>;

  /**
   * Get payment status for an appointment
   * @param appointmentId - The appointment ID to check
   * @returns Promise with payment status information
   */
  getPaymentStatus(appointmentId: string): Promise<{
    status: "pending" | "confirmed" | "failed" | "cancelled";
    amount?: number;
    currency?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  }>;

  /**
   * Cancel a payment session
   * @param sessionId - The payment session ID to cancel
   * @returns Promise that resolves when cancellation is complete
   */
  cancelPayment(sessionId: string): Promise<void>;
}

/**
 * Payment Provider Types
 */
export type PaymentProvider = "mock" | "wompi" | "stripe";

/**
 * Payment Service Factory
 * Creates the appropriate payment service based on provider and feature flags
 */
export const PaymentServiceFactory = {
  instance: null as PaymentService | null,

  /**
   * Get the payment service instance
   * @param provider - The payment provider to use
   * @returns PaymentService instance
   */
  getService: async (provider: PaymentProvider): Promise<PaymentService> => {
    if (PaymentServiceFactory.instance) {
      return PaymentServiceFactory.instance;
    }

    // Check feature flags
    const paymentsEnabled = await PaymentServiceFactory.getFeatureFlag("payments_enabled");

    if (!paymentsEnabled) {
      // Always use mock adapter when payments are disabled
      const { MockPaymentAdapter } = await import("./adapters/mockAdapter");
      PaymentServiceFactory.instance = new MockPaymentAdapter();
      return PaymentServiceFactory.instance;
    }

    // Select adapter based on provider
    switch (provider) {
      case "mock": {
        const { MockPaymentAdapter } = await import("./adapters/mockAdapter");
        PaymentServiceFactory.instance = new MockPaymentAdapter();
        break;
      }
      case "wompi": {
        const { WompiPaymentAdapter } = await import("./adapters/wompiAdapter");
        PaymentServiceFactory.instance = new WompiPaymentAdapter();
        break;
      }
      case "stripe": {
        const { StripePaymentAdapter } = await import("./adapters/stripeAdapter");
        PaymentServiceFactory.instance = new StripePaymentAdapter();
        break;
      }
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }

    return PaymentServiceFactory.instance;
  },

  /**
   * Get feature flag value
   * @param flagName - The feature flag name
   * @returns Promise with feature flag value
   */
  getFeatureFlag: async (flagName: string): Promise<boolean> => {
    try {
      // In a real implementation, this would fetch from Firebase Remote Config
      // or your feature flag service
      const featureFlags = {
        payments_enabled: false,
        payments_mock_auto_approve: true,
      };

      return featureFlags[flagName as keyof typeof featureFlags] || false;
    } catch (error) {
      console.error("Error fetching feature flag:", error);
      return false;
    }
  },

  /**
   * Reset the service instance (useful for testing)
   */
  reset: (): void => {
    PaymentServiceFactory.instance = null;
  },
};

/**
 * Payment Service Manager
 * High-level interface for payment operations
 */
export class PaymentManager {
  private service: PaymentService | null = null;

  /**
   * Initialize the payment service
   * @param appointmentId - The appointment ID to get provider from
   */
  async initialize(appointmentId: string): Promise<void> {
    try {
      // Get appointment to determine provider using FastAPI
      const { apiClient } = await import("@/lib/api");
      const appointment = await apiClient.get(`/appointments/${appointmentId}`);

      const provider = (appointment as any).payment_provider || "mock";
      this.service = await PaymentServiceFactory.getService(provider as PaymentProvider);
    } catch (error) {
      console.error("Error initializing payment service:", error);
      // Fallback to mock adapter
      this.service = await PaymentServiceFactory.getService("mock");
    }
  }

  /**
   * Start checkout process
   * @param appointmentId - The appointment ID
   * @returns Promise with checkout result
   */
  async startCheckout(appointmentId: string): Promise<PaymentCheckoutResult> {
    if (!this.service) {
      await this.initialize(appointmentId);
    }

    if (!this.service) {
      throw new Error("Payment service not initialized");
    }

    return await this.service.startCheckout(appointmentId);
  }

  /**
   * Handle payment return
   * @param params - Return parameters
   */
  async handleReturn(params: PaymentReturnParams): Promise<void> {
    if (!this.service) {
      throw new Error("Payment service not initialized");
    }

    return await this.service.handleReturn(params);
  }

  /**
   * Get payment status
   * @param appointmentId - The appointment ID
   * @returns Promise with payment status
   */
  async getPaymentStatus(appointmentId: string): Promise<Record<string, unknown>> {
    if (!this.service) {
      await this.initialize(appointmentId);
    }

    if (!this.service) {
      throw new Error("Payment service not initialized");
    }

    return await this.service.getPaymentStatus(appointmentId);
  }

  /**
   * Cancel payment
   * @param sessionId - The session ID
   */
  async cancelPayment(sessionId: string): Promise<void> {
    if (!this.service) {
      throw new Error("Payment service not initialized");
    }

    return await this.service.cancelPayment(sessionId);
  }
}
