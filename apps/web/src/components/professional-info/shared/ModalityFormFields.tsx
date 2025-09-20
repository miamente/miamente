"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";
import type { ProfessionalModality } from "@/lib/types";

interface ModalityFormFieldsProps {
  readonly index: number;
  readonly value: ProfessionalModality;
  readonly disabled?: boolean;
  readonly availableModalities: Array<{ id: string; name: string }>;
  readonly onChange?: (field: keyof ProfessionalModality, value: unknown) => void;
  readonly onModalityChange?: (value: string) => void;
}

export function ModalityFormFields({
  index,
  value,
  disabled = false,
  availableModalities,
  onChange,
  onModalityChange,
}: ModalityFormFieldsProps) {
  return (
    <>
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
            options={availableModalities.map((modality) => ({
              value: modality.id,
              label: modality.name,
            }))}
            value={value.modalityId}
            onValueChange={onModalityChange}
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
              value={value.virtualPrice}
              onChange={(e) => onChange?.("virtualPrice", parseFloat(e.target.value) || 0)}
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
          checked={value.offersPresencial}
          onChange={(e) => onChange?.("offersPresencial", e.target.checked)}
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

      <div>
        <label
          htmlFor={`description-${index}`}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descripción
        </label>
        <Textarea
          id={`description-${index}`}
          value={value.description}
          onChange={(e) => onChange?.("description", e.target.value)}
          placeholder="Descripción de la modalidad..."
          rows={3}
          disabled={disabled}
        />
      </div>
    </>
  );
}

interface PresencialPriceFieldProps {
  readonly index: number;
  readonly value: number;
  readonly disabled?: boolean;
  readonly onChange?: (value: number) => void;
}

export function PresencialPriceField({
  index,
  value,
  disabled = false,
  onChange,
}: PresencialPriceFieldProps) {
  return (
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
          value={value}
          onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
          placeholder="0"
          disabled={disabled}
          className="pl-10"
        />
      </div>
    </div>
  );
}
