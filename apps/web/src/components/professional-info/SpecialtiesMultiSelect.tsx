"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, HelpCircle } from "lucide-react";
import { useSpecialties } from "@/hooks/useSpecialties";

interface SpecialtiesMultiSelectProps {
  value?: string[];
  onChange?: (specialtyIds: string[]) => void;
  disabled?: boolean;
}

export function SpecialtiesMultiSelect({
  value = [],
  onChange,
  disabled = false,
}: SpecialtiesMultiSelectProps) {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(value);

  const { specialties, loading: specialtiesLoading, error: specialtiesError } = useSpecialties();

  // Update local state when value prop changes
  useEffect(() => {
    setSelectedSpecialties(value);
  }, [value]);

  const handleSpecialtyChange = (specialtyId: string) => {
    if (!specialtyId || selectedSpecialties.includes(specialtyId)) {
      return;
    }

    const newSpecialties = [...selectedSpecialties, specialtyId];
    setSelectedSpecialties(newSpecialties);
    onChange?.(newSpecialties);
  };

  const handleRemoveSpecialty = (specialtyId: string) => {
    const newSpecialties = selectedSpecialties.filter((id) => id !== specialtyId);
    setSelectedSpecialties(newSpecialties);
    onChange?.(newSpecialties);
  };

  // Get specialty name by ID
  const getSpecialtyName = (specialtyId: string) => {
    const specialty = specialties.find((s) => s.id === specialtyId);
    return specialty?.name || `Especialidad ${specialtyId.slice(0, 8)}`;
  };

  // Get available specialties (not already selected)
  const availableSpecialties = specialties.filter((s) => !selectedSpecialties.includes(s.id));

  if (specialtiesLoading) {
    return (
      <div className="space-y-2">
        <Label>Especialidades</Label>
        <div className="text-sm text-gray-500">Cargando especialidades...</div>
      </div>
    );
  }

  if (specialtiesError) {
    return (
      <div className="space-y-2">
        <Label>Especialidades</Label>
        <div className="text-sm text-red-500">Error: {specialtiesError}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Especialidades</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Selecciona una o más especialidades en salud mental que correspondan a tu formación
              académica o campo profesional regulado.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Selected Specialties */}
      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSpecialties.map((specialtyId) => (
            <Badge key={specialtyId} variant="secondary" className="flex items-center gap-1">
              {getSpecialtyName(specialtyId)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialty(specialtyId)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Add New Specialty */}
      {!disabled && availableSpecialties.length > 0 && (
        <div>
          <Select
            options={availableSpecialties.map((specialty) => ({
              value: specialty.id,
              label: specialty.name,
            }))}
            value=""
            onValueChange={handleSpecialtyChange}
            placeholder="Seleccionar especialidad..."
            className="w-full"
          />
        </div>
      )}

      {/* No available specialties message */}
      {!disabled && availableSpecialties.length === 0 && selectedSpecialties.length > 0 && (
        <div className="text-sm text-gray-500">
          Todas las especialidades disponibles han sido seleccionadas.
        </div>
      )}
    </div>
  );
}
