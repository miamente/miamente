import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export interface Modality {
  id: string;
  name: string;
  description?: string;
  category?: string;
  currency: string;
  default_price_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export function useModalities() {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModalities = async () => {
      try {
        console.log("useModalities - Starting fetch...");
        setLoading(true);
        setError(null);

        const data = await apiClient.getModalities();
        console.log("useModalities - Data received:", data.length, "items");
        setModalities(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("useModalities - Error:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchModalities();
  }, []);

  return { modalities, loading, error };
}
