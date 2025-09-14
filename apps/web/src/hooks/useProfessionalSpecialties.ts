import { useState, useEffect } from "react";
import { ProfessionalSpecialty } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        const response = await fetch(
          `${API_BASE_URL}/api/v1/professional-specialties-new/professional/${professionalId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch professional specialties");
        }

        const data = await response.json();
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
      const response = await fetch(
        `${API_BASE_URL}/api/v1/professional-specialties-new/professional/${professionalId}/specialties`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(specialtyIds),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update professional specialties");
      }

      // Refresh the data
      const data = await response.json();
      setSpecialties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { specialties, loading, error, updateSpecialties };
}
