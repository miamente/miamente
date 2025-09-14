import { useState, useEffect } from "react";
import { ProfessionalTherapeuticApproach } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        const response = await fetch(
          `${API_BASE_URL}/api/v1/professional-therapeutic-approaches/professional/${professionalId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch professional therapeutic approaches");
        }

        const data = await response.json();
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
      const response = await fetch(
        `${API_BASE_URL}/api/v1/professional-therapeutic-approaches/professional/${professionalId}/approaches`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approachIds),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update professional therapeutic approaches");
      }

      // Refresh the data
      const data = await response.json();
      setApproaches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { approaches, loading, error, updateApproaches };
}
