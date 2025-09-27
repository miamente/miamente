import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { ProfessionalTherapeuticApproach } from "@/lib/types";

export function useProfessionalTherapeuticApproaches(professionalId?: string) {
  const [approaches, setApproaches] = useState<ProfessionalTherapeuticApproach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchApproaches = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProfessionalTherapeuticApproaches(professionalId);
        setApproaches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApproaches();
  }, [professionalId]);

  const updateApproaches = async (approachIds: string[]) => {
    if (!professionalId) return;

    try {
      setLoading(true);
      const data = await apiClient.updateProfessionalTherapeuticApproaches(professionalId, approachIds);
      setApproaches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { approaches, loading, error, updateApproaches };
}
