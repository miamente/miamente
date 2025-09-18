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
import { Plus, Star } from "lucide-react";
import type { ProfessionalProfileFormData } from "@/lib/validations";
import { useModalities } from "@/hooks/useModalities";
import type { ProfessionalModality } from "@/lib/types";
import { ModalityCardTrigger } from "./shared/ModalityCardTrigger";
import { ModalityCardHeader } from "./shared/ModalityCardHeader";
import { ModalityFormFields, PresencialPriceField } from "./shared/ModalityFormFields";

interface ModalitiesEditorProps {
  disabled?: boolean;
}

export function ModalitiesEditor({ disabled = false }: ModalitiesEditorProps) {
  const {
    modalities: availableModalities,
    loading: modalitiesLoading,
    error: modalitiesError,
  } = useModalities();
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

      // If no modality is marked as default, make the first one default
      const hasDefault = modalities.some((m: unknown) => (m as { isDefault?: boolean }).isDefault);
      if (!hasDefault && modalities.length > 0) {
        setValue(`modalities.0.isDefault`, true);
      }
    }
  }, [modalities, fields.length, append, setValue]);

  const addModality = () => {
    append({
      id: crypto.randomUUID(),
      modalityId: "",
      modalityName: "Modalidad",
      virtualPrice: 0,
      presencialPrice: 0,
      offersPresencial: false,
      description: "",
      isDefault: false, // New modalities are not default by default
    });
  };

  const removeModality = (index: number) => {
    const wasDefault = modalities?.[index]?.isDefault;
    remove(index);

    // If we removed the default modality, make the first remaining one default
    if (wasDefault && modalities && modalities.length > 1) {
      setValue(`modalities.0.isDefault`, true);
    }
  };

  const setDefaultModality = (index: number) => {
    // Set all modalities to not default first
    modalities?.forEach((_, idx) => {
      setValue(`modalities.${idx}.isDefault`, false);
    });
    // Set the selected modality as default
    setValue(`modalities.${index}.isDefault`, true);
  };

  const getModalityName = (modalityId: string) => {
    const modality = availableModalities.find((m) => m.id === modalityId);
    return modality ? modality.name : "Modalidad";
  };

  const getAvailableModalities = (currentIndex: number) => {
    // Get modalities that are not already selected by other items
    const usedModalityIds =
      modalities
        ?.map((m: unknown, idx: number) =>
          idx !== currentIndex ? (m as { modalityId?: string }).modalityId : null,
        )
        .filter(Boolean) || [];
    return availableModalities.filter((m) => !usedModalityIds.includes(m.id));
  };

  // Debug information
  console.log("ModalitiesEditor - Loading:", modalitiesLoading);
  console.log("ModalitiesEditor - Error:", modalitiesError);
  console.log("ModalitiesEditor - Available modalities:", availableModalities);
  console.log("ModalitiesEditor - Current modalities from form:", modalities);
  console.log("ModalitiesEditor - Fields:", fields);

  // Show loading state
  if (modalitiesLoading) {
    return (
      <Card className="p-0">
        <CardHeader className="py-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-purple-600" />
            Modalidades de Intervención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Cargando modalidades...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (modalitiesError) {
    return (
      <Card className="p-0">
        <CardHeader className="py-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-purple-600" />
            Modalidades de Intervención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error al cargar modalidades: {modalitiesError}</p>
        </CardContent>
      </Card>
    );
  }

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
                  availableModalities={getAvailableModalities(index)}
                  onModalityChange={(value) => {
                    const modalityName = getModalityName(value);
                    setValue(`modalities.${index}.modalityId`, value);
                    setValue(`modalities.${index}.modalityName`, modalityName);
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
              disabled={disabled || getAvailableModalities(-1).length === 0}
              className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              {getAvailableModalities(-1).length === 0
                ? "Todas las modalidades han sido agregadas"
                : "Agregar Modalidad"}
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
