import { useState, useEffect, useRef } from "react";
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
  const prevApproachIdsRef = useRef<string[]>([]);

  useEffect(() => {
    // Check if approachIds have actually changed
    const hasChanged =
      approachIds.length !== prevApproachIdsRef.current.length ||
      approachIds.some((id, index) => id !== prevApproachIdsRef.current[index]);

    if (!hasChanged) {
      return;
    }

    prevApproachIdsRef.current = approachIds;

    if (!approachIds || approachIds.length === 0) {
      setApproachNames({});
      setLoading(false);
      setError(null);
      return;
    }

    const fetchApproachNames = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all therapy approaches
        const approaches = await apiClient.get<TherapyApproach[]>("/therapeutic-approaches");

        // Create a map of ID to name
        const nameMap: Record<string, string> = {};
        if (approaches && Array.isArray(approaches)) {
          approaches.forEach((approach) => {
            if (approach?.id && approach?.name) {
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
    };

    fetchApproachNames();
  }, [approachIds]);

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
