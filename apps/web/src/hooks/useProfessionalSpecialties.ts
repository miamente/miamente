import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { ProfessionalSpecialty } from "@/lib/types";

export function useProfessionalSpecialties(professionalId?: string) {
  const [specialties, setSpecialties] = useState<ProfessionalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProfessionalSpecialties(professionalId);
        setSpecialties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, [professionalId]);

  const updateSpecialties = async (specialtyIds: string[]) => {
    if (!professionalId) return;

    try {
      setLoading(true);
      const data = await apiClient.updateProfessionalSpecialties(professionalId, specialtyIds);
      setSpecialties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { specialties, loading, error, updateSpecialties };
}
