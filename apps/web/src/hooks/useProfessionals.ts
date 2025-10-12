/**
 * Hook for managing professionals using unified accounts system.
 */
import { useState, useCallback } from "react";

import { apiClient } from "@/lib/api";
import type { AccountWithProfile, ProfessionalProfile } from "@/lib/types";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<AccountWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use new unified accounts endpoint
      const response = await apiClient.getAllAccountsAdmin(1, 100, "professional");
      
      // Fetch full profiles for all professionals
      const professionalsWithProfiles = await Promise.all(
        response.items.map(async (account) => {
          try {
            return await apiClient.getAccountById(account.id);
          } catch {
            // Fallback without profile if fetch fails
            return {
              account,
              role: "professional",
              profile: null,
            };
          }
        })
      );
      
      setProfessionals(professionalsWithProfiles);
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
  const [professional, setProfessional] = useState<AccountWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessional = useCallback(async () => {
    if (!professionalId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getAccountById(professionalId);
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
