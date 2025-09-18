"use client";

import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Plus, Trash2, Star, StarOff, DollarSign } from "lucide-react";
import type { ProfessionalProfileFormData } from "@/lib/validations";
import type { ProfessionalModality } from "@/lib/types";

interface ModalitiesEditorProps {
  disabled?: boolean;
}

const AVAILABLE_MODALITIES = [
  { id: "individual", name: "Individual" },
  { id: "pareja", name: "Pareja" },
  { id: "familiar", name: "Familiar" },
  { id: "infantil", name: "Infantil" },
  { id: "adolescente", name: "Adolescente" },
  { id: "adultos_mayores", name: "Adultos mayores" },
  { id: "grupal", name: "Grupal" },
  { id: "presencial", name: "Presencial" },
  { id: "intervenciones_breves", name: "Intervenciones breves / de crisis" },
  { id: "psicoeducacion", name: "Psicoeducación (charlas, talleres, acompañamiento no clínico)" },
];

export function ModalitiesEditor({ disabled = false }: ModalitiesEditorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { control, watch, setValue } = useFormContext<ProfessionalProfileFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modalities",
  });

  // Watch the modalities data
  const modalities = watch("modalities");

  // Initialize fields when data is loaded
  useEffect(() => {
    if (modalities && modalities.length > 0 && fields.length === 0) {
      // Clear existing fields and add the loaded data
      modalities.forEach((modality: ProfessionalModality) => {
        append(modality);
      });
    }
  }, [modalities, fields.length, append]);

  const addModality = () => {
    append({
      id: "",
      modalityId: "",
      modalityName: "",
      virtualPrice: 0,
      presencialPrice: 0,
      offersPresencial: false,
      description: "",
      isDefault: fields.length === 0,
    });
  };

  const removeModality = (index: number) => {
    remove(index);
  };

  const setDefaultModality = (index: number) => {
    // Set all modalities to not default first
    modalities?.forEach((_, idx) => {
      setValue(`modalities.${idx}.isDefault`, false);
    });
    // Set the selected modality as default
    setValue(`modalities.${index}.isDefault`, true);
  };

  const getAvailableModalities = () => {
    const usedModalityIds =
      modalities?.map((m: unknown) => (m as { modalityId?: string }).modalityId).filter(Boolean) ||
      [];
    return AVAILABLE_MODALITIES.filter((m) => !usedModalityIds.includes(m.id));
  };

  return (
    <Card className={isOpen ? "pt-0" : "p-0"}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="group cursor-pointer py-6 transition-colors duration-200 hover:bg-purple-50/30 dark:hover:bg-purple-900/10">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600 transition-colors group-hover:text-purple-700" />
                Modalidades de Intervención
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {modalities?.[index]?.modalityName || `Modalidad ${index + 1}`}
                    </h4>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Virtual
                      </Badge>
                      {modalities?.[index]?.offersPresencial && (
                        <Badge variant="secondary" className="text-xs">
                          Presencial
                        </Badge>
                      )}
                      {modalities?.[index]?.isDefault && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          Por defecto
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!modalities?.[index]?.isDefault && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultModality(index)}
                        disabled={disabled}
                        className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeModality(index)}
                      disabled={disabled}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`modality-${index}`}
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Modalidad *
                    </label>
                    <Select
                      id={`modality-${index}`}
                      options={AVAILABLE_MODALITIES.map((modality) => ({
                        value: modality.id,
                        label: modality.name,
                      }))}
                      value={modalities?.[index]?.modalityId || ""}
                      onValueChange={() => {
                        // This would need to be implemented with form state management
                        // Update the form field
                      }}
                      placeholder="Seleccionar modalidad..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`virtual-price-${index}`}
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Precio Virtual (COP) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id={`virtual-price-${index}`}
                        type="number"
                        {...control.register(`modalities.${index}.virtualPrice`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                        disabled={disabled}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`offers-presencial-${index}`}
                    {...control.register(`modalities.${index}.offersPresencial`)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor={`offers-presencial-${index}`}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    También ofrecer modalidad presencial
                  </label>
                </div>

                {modalities?.[index]?.offersPresencial && (
                  <div>
                    <label
                      htmlFor={`presencial-price-${index}`}
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Precio Presencial (COP)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id={`presencial-price-${index}`}
                        type="number"
                        {...control.register(`modalities.${index}.presencialPrice`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                        disabled={disabled}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor={`description-${index}`}
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Descripción
                  </label>
                  <Textarea
                    id={`description-${index}`}
                    {...control.register(`modalities.${index}.description`)}
                    placeholder="Descripción de la modalidad..."
                    rows={3}
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addModality}
              disabled={disabled || getAvailableModalities().length === 0}
              className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Modalidad
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
