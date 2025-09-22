import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { SpecialtyBadgeProps } from "./types";

export const SpecialtyBadge: React.FC<SpecialtyBadgeProps> = ({
  specialty,
  onRemove,
  disabled,
}) => (
  <li key={specialty.id} className="flex items-center gap-1">
    <Badge variant="secondary" className="flex items-center gap-1">
      <span>{specialty.name}</span>
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(specialty.id)}
          className="ml-1 rounded-full p-0.5 hover:bg-gray-300 focus:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
          aria-label={`Remover ${specialty.name}`}
          tabIndex={0}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  </li>
);
