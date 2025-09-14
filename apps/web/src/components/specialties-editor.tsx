"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Stethoscope, ChevronDown, ChevronRight } from "lucide-react";
import { useProfessionalSpecialties } from "@/hooks/useProfessionalSpecialties";

interface SpecialtiesEditorProps {
  professionalId: string;
  disabled?: boolean;
}

export function SpecialtiesEditorSimple({
  professionalId,
  disabled: _disabled = false,
}: SpecialtiesEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { specialties, loading, error } = useProfessionalSpecialties(professionalId);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={isOpen ? "pt-0" : "p-0"}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Especialidades
              </div>
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Gestiona tus especialidades profesionales (sistema anterior - en migración)
            </p>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Mensaje de carga */}
            {loading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-600">Cargando especialidades...</p>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">Error: {error}</p>
              </div>
            )}

            {/* Lista de especialidades */}
            {!loading && !error && specialties.length > 0 && (
              <div className="space-y-3">
                {specialties.map((specialty) => (
                  <div key={specialty.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {specialty.specialty?.name ||
                              `Especialidad ${specialty.id.slice(0, 8)}`}
                          </h4>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">ID: {specialty.specialtyId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay especialidades */}
            {!loading && !error && specialties.length === 0 && (
              <div className="py-8 text-center">
                <Stethoscope className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-4 text-gray-600">No tienes especialidades configuradas</p>
                <p className="text-sm text-gray-500">
                  Este sistema está en proceso de migración. Usa los nuevos campos de especialidades
                  en la sección de información profesional.
                </p>
              </div>
            )}

            {/* Mensaje informativo */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">Sistema en Migración</h4>
              <p className="text-sm text-blue-700">
                Este sistema de especialidades está siendo migrado. Por favor, usa los nuevos campos
                de especialidades en la sección de información profesional para gestionar tus
                especialidades de salud mental.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
