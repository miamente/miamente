"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  multiple?: boolean;
  size?: number;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Seleccionar...",
      disabled = false,
      className,
      multiple = false,
      size,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.target.value;
      onValueChange?.(selectedValue);
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          multiple={multiple}
          size={size}
          className={cn(
            "border-input bg-background flex h-9 w-full appearance-none items-center justify-between rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2",
            disabled && "opacity-50",
          )}
        />
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
