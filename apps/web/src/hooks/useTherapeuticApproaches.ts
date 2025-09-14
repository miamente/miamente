import { useState, useEffect } from "react";
import { TherapeuticApproach } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useTherapeuticApproaches() {
  const [approaches, setApproaches] = useState<TherapeuticApproach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApproaches = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/therapeutic-approaches`);

        if (!response.ok) {
          throw new Error("Failed to fetch therapeutic approaches");
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
  }, []);

  return { approaches, loading, error };
}
