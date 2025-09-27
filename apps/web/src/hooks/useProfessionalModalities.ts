import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { ProfessionalModality } from "@/lib/types";

export function useProfessionalModalities(professionalId?: string) {
  const [modalities, setModalities] = useState<ProfessionalModality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchModalities = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProfessionalModalities(professionalId);
        setModalities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchModalities();
  }, [professionalId]);

  const createModality = async (modalityData: Omit<ProfessionalModality, "id" | "professional_id">) => {
    if (!professionalId) return;

    try {
      setLoading(true);
      const data = await apiClient.createProfessionalModality(professionalId, modalityData);
      setModalities((prev) => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateModality = async (modalityId: string, modalityData: Partial<ProfessionalModality>) => {
    try {
      setLoading(true);
      const data = await apiClient.updateProfessionalModality(modalityId, modalityData);
      setModalities((prev) => prev.map((m) => (m.id === modalityId ? data : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteModality = async (modalityId: string) => {
    try {
      setLoading(true);
      await apiClient.deleteProfessionalModality(modalityId);
      setModalities((prev) => prev.filter((m) => m.id !== modalityId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const setDefaultModality = async (modalityId: string) => {
    try {
      setLoading(true);
      // Note: This endpoint might need to be added to apiClient
      const response = await fetch(`/api/v1/professional-modalities/${modalityId}/set-default`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to set default modality");
      }

      // Update local state
      setModalities((prev) =>
        prev.map((m) => ({
          ...m,
          is_default: m.id === modalityId,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    modalities,
    loading,
    error,
    createModality,
    updateModality,
    deleteModality,
    setDefaultModality,
  };
}