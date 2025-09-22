import React from "react";
import { Select } from "@/components/ui/select";
import { SpecialtySelectorProps } from "./types";

export const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({
  availableSpecialties,
  onAdd,
  disabled,
  placeholder,
  maxSelections,
  currentCount,
}) => {
  const canAddMore = !maxSelections || currentCount < maxSelections;
  const isDisabled = disabled || !canAddMore || availableSpecialties.length === 0;

  if (disabled) return null;

  if (availableSpecialties.length === 0 && currentCount > 0) {
    return (
      <div className="text-sm text-gray-500">
        Todas las especialidades disponibles han sido seleccionadas.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Select
        options={availableSpecialties.map((specialty) => ({
          value: specialty.id,
          label: specialty.name,
        }))}
        value=""
        onValueChange={onAdd}
        placeholder={placeholder}
        disabled={isDisabled}
        className="w-full"
        aria-label="Seleccionar especialidad"
      />
      {maxSelections && (
        <div className="text-xs text-gray-500">
          {currentCount} de {maxSelections} especialidades seleccionadas
        </div>
      )}
    </div>
  );
};
