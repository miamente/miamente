"use client";
import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsInfoProps {
  appliedSearch: string;
  totalItems: number;
  entityName: string;
  entityNamePlural: string;
  showClearButton?: boolean;
  onClearSearch?: () => void;
}

export function SearchResultsInfo({
  appliedSearch,
  totalItems,
  entityName,
  entityNamePlural,
  showClearButton = true,
  onClearSearch,
}: SearchResultsInfoProps) {
  if (!appliedSearch) return null;

  return (
    <div className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-3">
      <div className="flex items-center">
        <Search className="mr-2 h-4 w-4 text-blue-600" data-testid="search-icon" />
        <span className="text-sm text-blue-800">
          {totalItems === 0 
            ? `No se encontraron ${entityNamePlural.toLowerCase()} que coincidan con "${appliedSearch}"`
            : `Se encontraron ${totalItems} ${entityName.toLowerCase()}${totalItems === 1 ? '' : 'es'} que coinciden con "${appliedSearch}"`
          }
        </span>
      </div>
      {showClearButton && onClearSearch && (
        <Button variant="outline" size="sm" onClick={onClearSearch}>
          <X className="mr-1 h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
