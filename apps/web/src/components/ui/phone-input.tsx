"use client";

import React, { useState } from "react";
import { parsePhoneNumber } from "libphonenumber-js";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PhoneInputFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (countryCode: string) => void;
  phoneNumber?: string;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

// Lista completa de países con sus códigos
const countries = [
  // América del Sur
  { code: "CO", name: "Colombia", callingCode: "57", flag: "🇨🇴" },
  { code: "AR", name: "Argentina", callingCode: "54", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", callingCode: "55", flag: "🇧🇷" },
  { code: "PE", name: "Perú", callingCode: "51", flag: "🇵🇪" },
  { code: "CL", name: "Chile", callingCode: "56", flag: "🇨🇱" },
  { code: "EC", name: "Ecuador", callingCode: "593", flag: "🇪🇨" },
  { code: "UY", name: "Uruguay", callingCode: "598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", callingCode: "595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", callingCode: "591", flag: "🇧🇴" },
  { code: "VE", name: "Venezuela", callingCode: "58", flag: "🇻🇪" },
  { code: "GY", name: "Guyana", callingCode: "592", flag: "🇬🇾" },
  { code: "SR", name: "Surinam", callingCode: "597", flag: "🇸🇷" },

  // América del Norte
  { code: "US", name: "Estados Unidos", callingCode: "1", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", callingCode: "1", flag: "🇨🇦" },
  { code: "MX", name: "México", callingCode: "52", flag: "🇲🇽" },

  // América Central y Caribe
  { code: "GT", name: "Guatemala", callingCode: "502", flag: "🇬🇹" },
  { code: "BZ", name: "Belice", callingCode: "501", flag: "🇧🇿" },
  { code: "SV", name: "El Salvador", callingCode: "503", flag: "🇸🇻" },
  { code: "HN", name: "Honduras", callingCode: "504", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", callingCode: "505", flag: "🇳🇮" },
  { code: "CR", name: "Costa Rica", callingCode: "506", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", callingCode: "507", flag: "🇵🇦" },
  { code: "CU", name: "Cuba", callingCode: "53", flag: "🇨🇺" },
  { code: "JM", name: "Jamaica", callingCode: "1876", flag: "🇯🇲" },
  { code: "HT", name: "Haití", callingCode: "509", flag: "🇭🇹" },
  { code: "DO", name: "República Dominicana", callingCode: "1809", flag: "🇩🇴" },
  { code: "PR", name: "Puerto Rico", callingCode: "1787", flag: "🇵🇷" },

  // Europa
  { code: "ES", name: "España", callingCode: "34", flag: "🇪🇸" },
  { code: "FR", name: "Francia", callingCode: "33", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", callingCode: "49", flag: "🇩🇪" },
  { code: "IT", name: "Italia", callingCode: "39", flag: "🇮🇹" },
  { code: "GB", name: "Reino Unido", callingCode: "44", flag: "🇬🇧" },
  { code: "PT", name: "Portugal", callingCode: "351", flag: "🇵🇹" },
  { code: "NL", name: "Países Bajos", callingCode: "31", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", callingCode: "32", flag: "🇧🇪" },
  { code: "CH", name: "Suiza", callingCode: "41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", callingCode: "43", flag: "🇦🇹" },
  { code: "SE", name: "Suecia", callingCode: "46", flag: "🇸🇪" },
  { code: "NO", name: "Noruega", callingCode: "47", flag: "🇳🇴" },
  { code: "DK", name: "Dinamarca", callingCode: "45", flag: "🇩🇰" },
  { code: "FI", name: "Finlandia", callingCode: "358", flag: "🇫🇮" },

  // Asia
  { code: "CN", name: "China", callingCode: "86", flag: "🇨🇳" },
  { code: "JP", name: "Japón", callingCode: "81", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", callingCode: "82", flag: "🇰🇷" },
  { code: "IN", name: "India", callingCode: "91", flag: "🇮🇳" },
  { code: "TH", name: "Tailandia", callingCode: "66", flag: "🇹🇭" },
  { code: "SG", name: "Singapur", callingCode: "65", flag: "🇸🇬" },
  { code: "MY", name: "Malasia", callingCode: "60", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", callingCode: "62", flag: "🇮🇩" },
  { code: "PH", name: "Filipinas", callingCode: "63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", callingCode: "84", flag: "🇻🇳" },

  // África
  { code: "ZA", name: "Sudáfrica", callingCode: "27", flag: "🇿🇦" },
  { code: "EG", name: "Egipto", callingCode: "20", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", callingCode: "234", flag: "🇳🇬" },
  { code: "KE", name: "Kenia", callingCode: "254", flag: "🇰🇪" },
  { code: "MA", name: "Marruecos", callingCode: "212", flag: "🇲🇦" },

  // Oceanía
  { code: "AU", name: "Australia", callingCode: "61", flag: "🇦🇺" },
  { code: "NZ", name: "Nueva Zelanda", callingCode: "64", flag: "🇳🇿" },
];

// Componente básico
export function PhoneInputField({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  phoneNumber: externalPhoneNumber,
  onPhoneNumberChange,
  placeholder = "300 123 4567",
  disabled = false,
  className,
  id,
  name,
  ...props
}: PhoneInputFieldProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Colombia por defecto
  const [internalPhoneNumber, setInternalPhoneNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Usar valores externos si están disponibles, sino usar valores internos
  const phoneNumber = externalPhoneNumber !== undefined ? externalPhoneNumber : internalPhoneNumber;
  const currentCountryCode = countryCode || selectedCountry.callingCode;

  // Parsear el número de teléfono si viene con código de país (para compatibilidad)
  React.useEffect(() => {
    if (value && !countryCode && !externalPhoneNumber) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          const country = countries.find((c) => c.code === parsed.country);
          if (country) {
            setSelectedCountry(country);
            setInternalPhoneNumber(parsed.nationalNumber);
            onCountryCodeChange?.(country.callingCode);
            onPhoneNumberChange?.(parsed.nationalNumber);
          }
        }
      } catch {
        // Si no se puede parsear, usar como está
        setInternalPhoneNumber(value);
        onPhoneNumberChange?.(value);
      }
    }
  }, [value, countryCode, externalPhoneNumber, onCountryCodeChange, onPhoneNumberChange]);

  // Actualizar país seleccionado basado en countryCode
  React.useEffect(() => {
    if (countryCode) {
      const country = countries.find((c) => c.callingCode === countryCode);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [countryCode]);

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdown = document.querySelector(".phone-input-dropdown");
      const button = document.querySelector(".phone-input-button");

      if (dropdown && button && !dropdown.contains(target) && !button.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCountryChange = (country: (typeof countries)[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);

    // Notificar cambios por separado
    onCountryCodeChange?.(country.callingCode);

    // Para compatibilidad, también notificar el número completo
    const fullNumber = `+${country.callingCode}${phoneNumber}`;
    onChange?.(fullNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;

    // Actualizar número interno si no hay control externo
    if (externalPhoneNumber === undefined) {
      setInternalPhoneNumber(newNumber);
    }

    // Notificar cambios por separado
    onPhoneNumberChange?.(newNumber);

    // Para compatibilidad, también notificar el número completo
    const fullNumber = `+${currentCountryCode}${newNumber}`;
    onChange?.(fullNumber);
  };

  return (
    <div className={cn("flex w-full", className)}>
      {/* Selector de país */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "phone-input-button border-input bg-background flex h-9 cursor-pointer items-center justify-between rounded-l-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:bg-accent/50",
          )}
        >
          <span className="flex items-center gap-1">
            <span>{selectedCountry.flag}</span>
            <span>+{selectedCountry.callingCode}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {/* Dropdown de países */}
        {isDropdownOpen && (
          <div className="phone-input-dropdown bg-popover text-popover-foreground absolute z-[9999] mt-1 max-h-60 w-80 overflow-auto rounded-md border shadow-md">
            {countries.map((country) => (
              <div
                key={country.code}
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm px-3 py-2 text-sm outline-none select-none"
                onClick={() => handleCountryChange(country)}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="font-medium">{country.name}</span>
                  </span>
                  <span className="text-muted-foreground font-mono">+{country.callingCode}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input de número */}
      <input
        id={id}
        name={name}
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-r-md border border-l-0 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        )}
        {...props}
      />
    </div>
  );
}

// Wrapper compatible con React Hook Form
export const PhoneInputFieldWithRef = React.forwardRef<HTMLInputElement, PhoneInputFieldProps>(
  ({ onChange, onCountryCodeChange, onPhoneNumberChange, ...props }) => {
    const handleChange = (value: string) => {
      // Crear un evento sintético compatible con React Hook Form
      const syntheticEvent = {
        target: { value: value || "" },
        type: "change",
      };
      if (onChange) {
        onChange(syntheticEvent.target.value);
      }
    };

    const handleCountryCodeChange = (countryCode: string) => {
      if (onCountryCodeChange) {
        onCountryCodeChange(countryCode);
      }
    };

    const handlePhoneNumberChange = (phoneNumber: string) => {
      if (onPhoneNumberChange) {
        onPhoneNumberChange(phoneNumber);
      }
    };

    return (
      <PhoneInputField
        {...props}
        onChange={handleChange}
        onCountryCodeChange={handleCountryCodeChange}
        onPhoneNumberChange={handlePhoneNumberChange}
      />
    );
  },
);

PhoneInputFieldWithRef.displayName = "PhoneInputFieldWithRef";
