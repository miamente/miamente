"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, HelpCircle } from "lucide-react";
import { useTherapeuticApproaches } from "@/hooks/useTherapeuticApproaches";

interface TherapeuticApproachesMultiSelectProps {
  value?: string[];
  onChange?: (approachIds: string[]) => void;
  disabled?: boolean;
}

export function TherapeuticApproachesMultiSelect({
  value = [],
  onChange,
  disabled = false,
}: TherapeuticApproachesMultiSelectProps) {
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>(value);

  const {
    approaches,
    loading: approachesLoading,
    error: approachesError,
  } = useTherapeuticApproaches();

  // Update local state when value prop changes
  useEffect(() => {
    setSelectedApproaches(value);
  }, [value]);

  const handleApproachChange = (approachId: string) => {
    if (!approachId || selectedApproaches.includes(approachId)) {
      return;
    }

    const newApproaches = [...selectedApproaches, approachId];
    setSelectedApproaches(newApproaches);
    onChange?.(newApproaches);
  };

  const handleRemoveApproach = (approachId: string) => {
    const newApproaches = selectedApproaches.filter((id) => id !== approachId);
    setSelectedApproaches(newApproaches);
    onChange?.(newApproaches);
  };

  // Get approach name by ID
  const getApproachName = (approachId: string) => {
    const approach = approaches.find((a) => a.id === approachId);
    return approach?.name || `Enfoque ${approachId.slice(0, 8)}`;
  };

  // Get available approaches (not already selected)
  const availableApproaches = approaches.filter((a) => !selectedApproaches.includes(a.id));

  if (approachesLoading) {
    return (
      <div className="space-y-2">
        <Label>Enfoques Terapéuticos</Label>
        <div className="text-sm text-gray-500">Cargando enfoques terapéuticos...</div>
      </div>
    );
  }

  if (approachesError) {
    return (
      <div className="space-y-2">
        <Label>Enfoques Terapéuticos</Label>
        <div className="text-sm text-red-500">Error: {approachesError}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Enfoques Terapéuticos</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Selecciona uno o más enfoques terapéuticos que manejas. Puedes combinar varios
              enfoques según tu formación y experiencia.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Selected Approaches */}
      {selectedApproaches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedApproaches.map((approachId) => (
            <Badge key={approachId} variant="secondary" className="flex items-center gap-1">
              {getApproachName(approachId)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveApproach(approachId)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Add New Approach */}
      {!disabled && availableApproaches.length > 0 && (
        <div>
          <Select
            options={availableApproaches.map((approach) => ({
              value: approach.id,
              label: approach.name,
            }))}
            value=""
            onValueChange={handleApproachChange}
            placeholder="Seleccionar enfoque terapéutico..."
            className="w-full"
          />
        </div>
      )}

      {/* No available approaches message */}
      {!disabled && availableApproaches.length === 0 && selectedApproaches.length > 0 && (
        <div className="text-sm text-gray-500">
          Todos los enfoques terapéuticos disponibles han sido seleccionados.
        </div>
      )}
    </div>
  );
}
