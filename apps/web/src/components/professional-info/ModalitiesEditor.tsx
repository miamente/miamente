"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Plus, Star } from "lucide-react";
import { useModalities } from "@/hooks/useModalities";
import type { ProfessionalModality } from "@/lib/types";
import { ModalityCardTrigger } from "./shared/ModalityCardTrigger";
import { ModalityCardHeader } from "./shared/ModalityCardHeader";
import { ModalityFormFields, PresencialPriceField } from "./shared/ModalityFormFields";

interface ModalitiesEditorProps {
  disabled?: boolean;
  value?: ProfessionalModality[];
  onChange?: (modalities: ProfessionalModality[]) => void;
}

export function ModalitiesEditor({
  disabled = false,
  value = [],
  onChange,
}: ModalitiesEditorProps) {
  const {
    modalities: availableModalities,
    loading: modalitiesLoading,
    error: modalitiesError,
  } = useModalities();
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalities, setModalities] = useState<ProfessionalModality[]>(value);
  const isInternalUpdate = useRef(false);
  const previousValue = useRef<ProfessionalModality[]>(value);

  // Update local state when value prop changes (but not from internal updates)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      // Only update if the value actually changed (deep comparison)
      const valueChanged =
        previousValue.current.length !== value.length ||
        previousValue.current.some(
          (prev, index) => !value[index] || JSON.stringify(prev) !== JSON.stringify(value[index]),
        );

      if (valueChanged) {
        setModalities(value);
        previousValue.current = value;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  // Notify parent of changes
  const notifyParent = useCallback(
    (newModalities: ProfessionalModality[]) => {
      if (onChange) {
        isInternalUpdate.current = true;
        onChange(newModalities);
      }
    },
    [onChange],
  );

  const addModality = () => {
    const newModality: ProfessionalModality = {
      id: crypto.randomUUID(),
      modalityId: "",
      modalityName: "Modalidad",
      virtualPrice: 0,
      presencialPrice: 0,
      offersPresencial: false,
      description: "",
      isDefault: false, // New modalities are not default by default
    };
    const newModalities = [...modalities, newModality];
    setModalities(newModalities);
    notifyParent(newModalities);
  };

  const removeModality = (index: number) => {
    const wasDefault = modalities[index]?.isDefault;
    const newModalities = modalities.filter((_, idx) => idx !== index);

    // If we removed the default modality, make the first remaining one default
    if (wasDefault && newModalities.length > 0) {
      newModalities[0].isDefault = true;
    }

    setModalities(newModalities);
    notifyParent(newModalities);
  };

  const setDefaultModality = (index: number) => {
    const newModalities = modalities.map((modality, idx) => ({
      ...modality,
      isDefault: idx === index,
    }));
    setModalities(newModalities);
    notifyParent(newModalities);
  };

  const updateModality = (index: number, field: keyof ProfessionalModality, value: unknown) => {
    const newModalities = modalities.map((modality, idx) =>
      idx === index ? { ...modality, [field]: value } : modality,
    );
    setModalities(newModalities);
    notifyParent(newModalities);
  };

  const getModalityName = (modalityId: string) => {
    const modality = availableModalities.find((m) => m.id === modalityId);
    return modality ? modality.name : "Modalidad";
  };

  const getAvailableModalities = (currentIndex: number) => {
    // Get modalities that are not already selected by other items
    const usedModalityIds = modalities
      .map((m, idx) => (idx !== currentIndex ? m.modalityId : null))
      .filter(Boolean);
    return availableModalities.filter((m) => !usedModalityIds.includes(m.id));
  };

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
        <ModalityCardTrigger isOpen={isOpen} />
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {modalities.map((modality, index) => (
              <div key={modality.id} className="space-y-4 rounded-lg border p-4">
                <ModalityCardHeader
                  index={index}
                  modalityName={modality.modalityName}
                  offersPresencial={modality.offersPresencial}
                  isDefault={modality.isDefault}
                  disabled={disabled}
                  onSetDefault={setDefaultModality}
                  onRemove={removeModality}
                />

                <ModalityFormFields
                  index={index}
                  value={modality}
                  disabled={disabled}
                  availableModalities={getAvailableModalities(index)}
                  onChange={(field: keyof ProfessionalModality, value: unknown) =>
                    updateModality(index, field, value)
                  }
                  onModalityChange={(value: string) => {
                    const modalityName = getModalityName(value);
                    updateModality(index, "modalityId", value);
                    updateModality(index, "modalityName", modalityName);
                  }}
                />

                {modality.offersPresencial && (
                  <PresencialPriceField
                    index={index}
                    value={modality.presencialPrice}
                    disabled={disabled}
                    onChange={(value: number) => updateModality(index, "presencialPrice", value)}
                  />
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
