"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, StarOff } from "lucide-react";

interface ModalityCardHeaderProps {
  readonly index: number;
  readonly modalityName?: string;
  readonly offersPresencial?: boolean;
  readonly isDefault?: boolean;
  readonly disabled?: boolean;
  readonly onSetDefault?: (index: number) => void;
  readonly onRemove?: (index: number) => void;
}

export function ModalityCardHeader({
  index,
  modalityName,
  offersPresencial = false,
  isDefault = false,
  disabled = false,
  onSetDefault,
  onRemove,
}: ModalityCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {modalityName || `Modalidad ${index + 1}`}
        </h4>
        <div className="flex gap-1">
          <Badge variant="secondary" className="text-xs">
            Virtual
          </Badge>
          {offersPresencial && (
            <Badge variant="secondary" className="text-xs">
              Presencial
            </Badge>
          )}
          {isDefault && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              Por defecto
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isDefault && onSetDefault && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(index)}
            disabled={disabled}
            className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
          >
            <StarOff className="h-4 w-4" />
          </Button>
        )}
        {onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
