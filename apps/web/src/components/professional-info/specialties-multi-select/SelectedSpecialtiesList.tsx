import React from "react";
import { SpecialtyBadge } from "./SpecialtyBadge";
import { SelectedSpecialtiesListProps } from "./types";

export const SelectedSpecialtiesList: React.FC<SelectedSpecialtiesListProps> = ({
  selectedSpecialties,
  onRemove,
  disabled,
}) => {
  if (selectedSpecialties.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        Especialidades seleccionadas ({selectedSpecialties.length})
      </div>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Especialidades seleccionadas">
        {selectedSpecialties.map((specialty) => (
          <SpecialtyBadge
            key={specialty.id}
            specialty={specialty}
            onRemove={onRemove}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
