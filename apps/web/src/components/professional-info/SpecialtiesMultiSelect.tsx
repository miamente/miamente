"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useSpecialties } from "@/hooks/useSpecialties";

// Import sub-components and hooks
import {
  SpecialtiesMultiSelectProps,
  useSpecialtySelection,
  useSpecialtyData,
  LoadingState,
  ErrorState,
  SelectedSpecialtiesList,
  SpecialtySelector,
} from "./specialties-multi-select";

// Main component
export function SpecialtiesMultiSelect({
  value = [],
  onChange,
  disabled = false,
  label = "Especialidades",
  placeholder = "Seleccionar especialidad...",
  maxSelections,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: Readonly<SpecialtiesMultiSelectProps>) {
  const { specialties, loading, error } = useSpecialties();
  const { handleAdd, handleRemove } = useSpecialtySelection(value, onChange, maxSelections);
  const { selectedSpecialties, availableSpecialties } = useSpecialtyData(value, specialties);

  // Loading state
  if (loading) {
    return <LoadingState label={label} />;
  }

  // Error state
  if (error) {
    return <ErrorState label={label} error={error} />;
  }

  return (
    <fieldset
      className="space-y-3"
      aria-label={ariaLabel || `${label} selection`}
      aria-describedby={ariaDescribedBy}
    >
      {/* Header with label and help */}
      <div className="flex items-center gap-2">
        <Label className="font-medium">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="rounded-full p-1 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              aria-label="Información sobre especialidades"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Selecciona una o más especialidades en salud mental que correspondan a tu formación
              académica o campo profesional regulado.
              {maxSelections && ` Máximo ${maxSelections} especialidades.`}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Selected specialties */}
      <SelectedSpecialtiesList
        selectedSpecialties={selectedSpecialties}
        onRemove={handleRemove}
        disabled={disabled}
      />

      {/* Add new specialty selector */}
      <SpecialtySelector
        availableSpecialties={availableSpecialties}
        onAdd={handleAdd}
        disabled={disabled}
        placeholder={placeholder}
        maxSelections={maxSelections}
        currentCount={value.length}
      />
    </fieldset>
  );
}

// Export types for better TypeScript support
export type { SpecialtiesMultiSelectProps } from "./specialties-multi-select";
