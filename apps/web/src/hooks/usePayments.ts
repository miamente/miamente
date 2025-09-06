/**
 * Hook for managing payments.
 */
import { useState, useCallback } from "react";

import { apiClient } from "@/lib/api";

export function usePayments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(
    async (appointmentId: string, amountCents: number, currency: string = "COP") => {
      setIsLoading(true);
      setError(null);

      try {
        const paymentIntent = await apiClient.createPaymentIntent(
          appointmentId,
          amountCents,
          currency,
        );
        return paymentIntent;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create payment intent");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.confirmPayment(paymentIntentId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm payment");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment,
  };
}
