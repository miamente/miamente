"use client";
import React from "react";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchCardProps {
  title: string;
  placeholder: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch?: () => void;
  showClearButton?: boolean;
  loading?: boolean;
  entityName: string;
}

export function SearchCard({
  title,
  placeholder,
  searchTerm,
  onSearchTermChange,
  onSearch,
  onClearSearch,
  showClearButton = true,
  loading = false,
  entityName,
}: SearchCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" data-testid="search-icon" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              aria-label={`Buscar ${entityName}`}
            />
            {showClearButton && searchTerm && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-1 top-1"
                onClick={onClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={onSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
