import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";

interface TherapyApproach {
  id: string;
  name: string;
  description?: string;
}

export function useTherapyApproachNames(approachIds: string[]) {
  const [approachNames, setApproachNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the approachIds to prevent unnecessary re-renders
  const memoizedApproachIds = useMemo(() => approachIds, [approachIds.join(",")]);

  const fetchApproachNames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all therapy approaches
      const approaches = await apiClient.get<TherapyApproach[]>("/therapeutic-approaches");

      // Create a map of ID to name
      const nameMap: Record<string, string> = {};
      if (approaches && Array.isArray(approaches)) {
        approaches.forEach((approach) => {
          if (approach && approach.id && approach.name) {
            nameMap[approach.id] = approach.name;
          }
        });
      }

      setApproachNames(nameMap);
    } catch (err) {
      console.error("Error fetching therapy approach names:", err);
      setError(err instanceof Error ? err.message : "Error al cargar los enfoques terapéuticos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!memoizedApproachIds || memoizedApproachIds.length === 0) {
      setApproachNames({});
      setLoading(false);
      setError(null);
      return;
    }

    fetchApproachNames();
  }, [memoizedApproachIds, fetchApproachNames]);

  // Return the names for the given IDs
  const getNames = (ids: string[]): string[] => {
    return ids.map((id) => approachNames[id] || id).filter(Boolean);
  };

  return {
    approachNames,
    getNames,
    loading,
    error,
  };
}
