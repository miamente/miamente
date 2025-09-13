import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface ProfessionalSpecialty {
  id: string;
  professional_id: string;
  specialty_id?: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  default_specialty_name?: string;
  default_specialty_description?: string;
  default_specialty_price_cents?: number;
}

export interface DefaultSpecialty {
  id: string;
  name: string;
  description: string;
  default_price_cents: number;
  currency: string;
  category: string;
}

export const useProfessionalSpecialties = () => {
  const [specialties, setSpecialties] = useState<ProfessionalSpecialty[]>([]);
  const [availableDefaults, setAvailableDefaults] = useState<DefaultSpecialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8000/api/v1/professional-specialties/", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error al cargar especialidades");
      }

      const data = await response.json();
      console.log("Professional specialties loaded:", data);
      setSpecialties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDefaults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:8000/api/v1/professional-specialties/available/defaults",
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Error al cargar especialidades predeterminadas");
      }

      const data = await response.json();
      console.log("Available defaults loaded:", data);
      setAvailableDefaults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createSpecialty = async (specialtyData: {
    name: string;
    description: string;
    price_cents: number;
    currency?: string;
    specialty_id?: string;
    is_default: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8000/api/v1/professional-specialties/", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...specialtyData,
          currency: specialtyData.currency || "COP",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear especialidad");
      }

      const newSpecialty = await response.json();
      setSpecialties((prev) => [...prev, newSpecialty]);

      // Refresh available defaults after creating
      await fetchAvailableDefaults();

      return newSpecialty;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSpecialty = async (id: string, updates: Partial<ProfessionalSpecialty>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/v1/professional-specialties/${id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al actualizar especialidad");
      }

      const updatedSpecialty = await response.json();
      setSpecialties((prev) => prev.map((s) => (s.id === id ? updatedSpecialty : s)));

      // Refresh available defaults after updating
      await fetchAvailableDefaults();

      return updatedSpecialty;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecialty = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/v1/professional-specialties/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al eliminar especialidad");
      }

      setSpecialties((prev) => prev.filter((s) => s.id !== id));

      // Refresh available defaults after deleting
      await fetchAvailableDefaults();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
    fetchAvailableDefaults();
  }, []);

  return {
    specialties,
    availableDefaults,
    loading,
    error,
    fetchSpecialties,
    fetchAvailableDefaults,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
  };
};
