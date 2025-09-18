"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useSpecialties } from "@/hooks/useSpecialties";
import { Specialty } from "@/lib/types";

interface SpecialtiesSelectorProps {
  selectedSpecialties: string[];
  onSpecialtiesChange: (specialties: string[]) => void;
  disabled?: boolean;
}

export function SpecialtiesSelector({
  selectedSpecialties,
  onSpecialtiesChange,
  disabled = false,
}: SpecialtiesSelectorProps) {
  const { specialties, loading, error } = useSpecialties();

  const handleSpecialtyToggle = (specialty: Specialty) => {
    if (disabled) return;

    const isSelected = selectedSpecialties.includes(specialty.id);
    if (isSelected) {
      onSpecialtiesChange(selectedSpecialties.filter((id) => id !== specialty.id));
    } else {
      onSpecialtiesChange([...selectedSpecialties, specialty.id]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5" />
          Especialidades en Salud Mental
        </CardTitle>
        <p className="text-sm text-gray-600">
          Selecciona una o más especialidades según tu formación académica o campo profesional
          regulado
        </p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-600">Cargando especialidades...</p>
          </div>
        )}

        {error && (
          <div className="py-4 text-center">
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {specialties.map((specialty) => (
                <div key={specialty.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialty-${specialty.id}`}
                    checked={selectedSpecialties.includes(specialty.id)}
                    onCheckedChange={() => handleSpecialtyToggle(specialty)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`specialty-${specialty.id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {specialty.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSpecialties.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-800">
                  Especialidades seleccionadas ({selectedSpecialties.length}):
                </p>
                <p className="mt-1 text-sm text-blue-600">
                  {specialties
                    .filter((s) => selectedSpecialties.includes(s.id))
                    .map((s) => s.name)
                    .join(", ")}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
