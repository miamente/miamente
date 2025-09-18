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
import { Plus } from "lucide-react";
import type { ProfessionalProfileFormData } from "@/lib/validations";
import type { ProfessionalModality } from "@/lib/types";
import { ModalityCardTrigger } from "./shared/ModalityCardTrigger";
import { ModalityCardHeader } from "./shared/ModalityCardHeader";
import { ModalityFormFields, PresencialPriceField } from "./shared/ModalityFormFields";

interface ModalitiesEditorProps {
  readonly disabled?: boolean;
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
        <ModalityCardTrigger isOpen={isOpen} onOpenChange={setIsOpen} />
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <ModalityCardHeader
                  index={index}
                  modalityName={modalities?.[index]?.modalityName}
                  offersPresencial={modalities?.[index]?.offersPresencial}
                  isDefault={modalities?.[index]?.isDefault}
                  disabled={disabled}
                  onSetDefault={setDefaultModality}
                  onRemove={removeModality}
                />

                <ModalityFormFields
                  index={index}
                  control={control}
                  disabled={disabled}
                  availableModalities={AVAILABLE_MODALITIES}
                  onModalityChange={() => {
                    // This would need to be implemented with form state management
                    // Update the form field
                  }}
                />

                {modalities?.[index]?.offersPresencial && (
                  <PresencialPriceField index={index} control={control} disabled={disabled} />
                )}
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
