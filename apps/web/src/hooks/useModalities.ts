import { useState, useEffect } from "react";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

        const url = `${API_BASE_URL}/api/v1/modalities`;
        console.log("useModalities - Fetching from:", url);

        const response = await fetch(url);
        console.log("useModalities - Response status:", response.status);
        console.log("useModalities - Response ok:", response.ok);

        if (!response.ok) {
          throw new Error(`Failed to fetch modalities: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
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
