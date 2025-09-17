"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
export function useSpecialtyNames() {
  const [namesMap, setNamesMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allSpecialties = await apiClient.getSpecialtiesNew();
      const newNamesMap = new Map<string, string>();
      allSpecialties.forEach((specialty) => {
        newNamesMap.set(specialty.id, specialty.name);
      });
      setNamesMap(newNamesMap);
    } catch (err) {
      console.error("Failed to fetch specialties:", err);
      setError(err instanceof Error ? err.message : "Error fetching specialties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  const getNames = useCallback(
    (ids: string[]): string[] => {
      return ids.map((id) => namesMap.get(id) || id); // Fallback to ID if name not found
    },
    [namesMap],
  );

  return { getNames, loading, error };
}
