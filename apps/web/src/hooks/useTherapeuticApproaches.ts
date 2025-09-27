import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { TherapeuticApproach } from "@/lib/types";

export function useTherapeuticApproaches() {
  const [approaches, setApproaches] = useState<TherapeuticApproach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApproaches = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getTherapeuticApproaches();
        setApproaches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApproaches();
  }, []);

  return { approaches, loading, error };
}
