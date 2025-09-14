"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useTherapeuticApproaches } from "@/hooks/useTherapeuticApproaches";
import { TherapeuticApproach } from "@/lib/types";

interface TherapeuticApproachesSelectorProps {
  selectedApproaches: string[];
  onApproachesChange: (approaches: string[]) => void;
  disabled?: boolean;
}

export function TherapeuticApproachesSelector({
  selectedApproaches,
  onApproachesChange,
  disabled = false,
}: TherapeuticApproachesSelectorProps) {
  const { approaches, loading, error } = useTherapeuticApproaches();

  const handleApproachToggle = (approach: TherapeuticApproach) => {
    if (disabled) return;

    const isSelected = selectedApproaches.includes(approach.id);
    if (isSelected) {
      onApproachesChange(selectedApproaches.filter((id) => id !== approach.id));
    } else {
      onApproachesChange([...selectedApproaches, approach.id]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5" />
          Enfoques Terapéuticos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Selecciona uno o más enfoques terapéuticos que manejas. Puedes combinar varios enfoques
        </p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-600">Cargando enfoques terapéuticos...</p>
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
              {approaches.map((approach) => (
                <div key={approach.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`approach-${approach.id}`}
                    checked={selectedApproaches.includes(approach.id)}
                    onCheckedChange={() => handleApproachToggle(approach)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`approach-${approach.id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {approach.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedApproaches.length > 0 && (
              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-green-800">
                  Enfoques seleccionados ({selectedApproaches.length}):
                </p>
                <p className="mt-1 text-sm text-green-600">
                  {approaches
                    .filter((a) => selectedApproaches.includes(a.id))
                    .map((a) => a.name)
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
