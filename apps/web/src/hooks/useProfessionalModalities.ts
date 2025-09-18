import { useState, useEffect } from "react";
import { ProfessionalModality } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        const response = await fetch(
          `${API_BASE_URL}/api/v1/professional-modalities/professional/${professionalId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch professional modalities");
        }

        const data = await response.json();
        setModalities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchModalities();
  }, [professionalId]);

  const createModality = async (
    modalityData: Omit<ProfessionalModality, "id" | "professionalId">,
  ) => {
    if (!professionalId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/professional-modalities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...modalityData,
          professionalId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create professional modality");
      }

      const data = await response.json();
      setModalities((prev) => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateModality = async (
    modalityId: string,
    modalityData: Partial<ProfessionalModality>,
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/professional-modalities/${modalityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modalityData),
      });

      if (!response.ok) {
        throw new Error("Failed to update professional modality");
      }

      const data = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/api/v1/professional-modalities/${modalityId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete professional modality");
      }

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
      const response = await fetch(
        `${API_BASE_URL}/api/v1/professional-modalities/${modalityId}/set-default`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to set default modality");
      }

      // Update local state
      setModalities((prev) =>
        prev.map((m) => ({
          ...m,
          isDefault: m.id === modalityId,
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
