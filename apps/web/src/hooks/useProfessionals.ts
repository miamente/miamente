/**
 * Hook for managing professionals.
 */
import { useState, useCallback } from "react";

import { apiClient, type Professional } from "@/lib/api";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getProfessionals();
      setProfessionals(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch professionals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    professionals,
    isLoading,
    error,
    fetchProfessionals,
  };
}

export function useProfessional(professionalId: string) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessional = useCallback(async () => {
    if (!professionalId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getProfessional(professionalId);
      setProfessional(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch professional");
    } finally {
      setIsLoading(false);
    }
  }, [professionalId]);

  return {
    professional,
    isLoading,
    error,
    fetchProfessional,
  };
}
