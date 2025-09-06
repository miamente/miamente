/**
 * Hook for managing professionals and their availability.
 */
import { useState, useCallback } from "react";

import { apiClient, type Professional, type Availability } from "@/lib/api";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getProfessionals();
      setProfessionals(data);
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

export function useProfessionalAvailability(professionalId: string) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!professionalId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getProfessionalAvailability(professionalId);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch availability");
    } finally {
      setIsLoading(false);
    }
  }, [professionalId]);

  const createAvailability = useCallback(
    async (availabilityData: Omit<Availability, "id" | "created_at" | "updated_at">) => {
      setIsLoading(true);
      setError(null);

      try {
        const newAvailability = await apiClient.createAvailability(availabilityData);
        setAvailability((prev) => [...prev, newAvailability]);
        return newAvailability;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create availability");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    availability,
    isLoading,
    error,
    fetchAvailability,
    createAvailability,
  };
}
