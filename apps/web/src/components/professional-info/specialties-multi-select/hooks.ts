import { useMemo, useCallback } from "react";
import { Specialty } from "@/lib/types";

export const useSpecialtySelection = (
  value: readonly string[] = [],
  onChange?: (specialtyIds: readonly string[]) => void,
  maxSelections?: number,
) => {
  const handleAdd = useCallback(
    (specialtyId: string) => {
      if (!specialtyId || value.includes(specialtyId)) {
        return;
      }

      if (maxSelections && value.length >= maxSelections) {
        return;
      }

      const newSpecialties = [...value, specialtyId];
      onChange?.(newSpecialties);
    },
    [value, onChange, maxSelections],
  );

  const handleRemove = useCallback(
    (specialtyId: string) => {
      const newSpecialties = value.filter((id) => id !== specialtyId);
      onChange?.(newSpecialties);
    },
    [value, onChange],
  );

  return { handleAdd, handleRemove };
};

export const useSpecialtyData = (selectedIds: readonly string[], specialties: Specialty[]) => {
  const selectedSpecialties = useMemo(
    () =>
      selectedIds.map((id) => specialties.find((s) => s.id === id)).filter(Boolean) as Specialty[],
    [selectedIds, specialties],
  );

  const availableSpecialties = useMemo(
    () => specialties.filter((specialty) => !selectedIds.includes(specialty.id)),
    [specialties, selectedIds],
  );

  const getSpecialtyName = useCallback(
    (specialtyId: string) => {
      const specialty = specialties.find((s) => s.id === specialtyId);
      return specialty?.name || `Especialidad ${specialtyId.slice(0, 8)}`;
    },
    [specialties],
  );

  return {
    selectedSpecialties,
    availableSpecialties,
    getSpecialtyName,
  };
};
