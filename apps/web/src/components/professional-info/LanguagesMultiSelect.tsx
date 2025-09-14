"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, HelpCircle } from "lucide-react";

interface LanguagesMultiSelectProps {
  value?: string[];
  onChange?: (languages: string[]) => void;
  disabled?: boolean;
}

// Lista de idiomas comunes
const COMMON_LANGUAGES = [
  "Español",
  "Inglés",
  "Francés",
  "Alemán",
  "Italiano",
  "Portugués",
  "Ruso",
  "Chino Mandarín",
  "Japonés",
  "Coreano",
  "Árabe",
  "Hindi",
  "Holandés",
  "Sueco",
  "Noruego",
  "Danés",
  "Finlandés",
  "Polaco",
  "Checo",
  "Húngaro",
  "Rumano",
  "Búlgaro",
  "Griego",
  "Turco",
  "Hebreo",
  "Persa",
  "Tailandés",
  "Vietnamita",
  "Indonesio",
  "Malayo",
  "Filipino",
  "Swahili",
  "Afrikaans",
  "Catalán",
  "Euskera",
  "Gallego",
  "Valenciano",
  "Asturiano",
  "Aragonés",
  "Leonés",
  "Cántabro",
];

export function LanguagesMultiSelect({
  value = [],
  onChange,
  disabled = false,
}: LanguagesMultiSelectProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(value);

  // Update local state when value prop changes
  useEffect(() => {
    setSelectedLanguages(value);
  }, [value]);

  const handleLanguageChange = (language: string) => {
    if (!language || selectedLanguages.includes(language)) {
      return;
    }

    const newLanguages = [...selectedLanguages, language];
    setSelectedLanguages(newLanguages);
    onChange?.(newLanguages);
  };

  const handleRemoveLanguage = (language: string) => {
    const newLanguages = selectedLanguages.filter((lang) => lang !== language);
    setSelectedLanguages(newLanguages);
    onChange?.(newLanguages);
  };

  // Get available languages (not already selected)
  const availableLanguages = COMMON_LANGUAGES.filter((lang) => !selectedLanguages.includes(lang));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Idiomas</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">Selecciona los idiomas que manejas de la lista disponible.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((language) => (
            <Badge key={language} variant="secondary" className="flex items-center gap-1">
              {language}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(language)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Add from common languages */}
      {!disabled && availableLanguages.length > 0 && (
        <div>
          <Select
            options={availableLanguages.map((language) => ({
              value: language,
              label: language,
            }))}
            value=""
            onValueChange={handleLanguageChange}
            placeholder="Seleccionar idioma..."
            className="w-full"
          />
        </div>
      )}

      {/* No available languages message */}
      {!disabled && availableLanguages.length === 0 && selectedLanguages.length > 0 && (
        <div className="text-sm text-gray-500">
          Todos los idiomas disponibles han sido seleccionados.
        </div>
      )}
    </div>
  );
}
