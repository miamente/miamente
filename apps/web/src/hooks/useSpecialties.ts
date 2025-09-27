import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Specialty } from "@/lib/types";

export function useSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getSpecialties();
        setSpecialties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  return { specialties, loading, error };
}
