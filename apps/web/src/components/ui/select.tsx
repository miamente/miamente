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
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Seleccionar...",
      disabled = false,
      className,
      id,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState<SelectOption | null>(() => {
      return options.find((option) => option.value === value) || null;
    });

    const selectRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const option = options.find((opt) => opt.value === value);
      setSelectedOption(option || null);
    }, [value, options]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      // Use a small delay to allow option clicks to complete
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleOptionClick = (option: SelectOption) => {
      setSelectedOption(option);
      onValueChange?.(option.value);
      setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            const currentIndex = options.findIndex((opt) => opt.value === value);
            const nextIndex = Math.min(currentIndex + 1, options.length - 1);
            onValueChange?.(options[nextIndex].value);
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            const currentIndex = options.findIndex((opt) => opt.value === value);
            const prevIndex = Math.max(currentIndex - 1, 0);
            onValueChange?.(options[prevIndex].value);
          }
          break;
      }
    };

    return (
      <div ref={ref} className="relative" {...props}>
        <div
          ref={selectRef}
          data-custom-select="true"
          className={cn(
            "border-input bg-background flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            disabled && "cursor-not-allowed opacity-50",
            isOpen && "ring-ring/50 border-ring ring-[3px]",
            className,
          )}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }}
          onKeyDown={handleKeyDown}
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon
            className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </div>

        {isOpen && (
          <div
            className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md border-2 border-blue-500 bg-white text-gray-900 shadow-lg"
            role="listbox"
            onClick={(e) => {
              // Don't stop propagation here, let option clicks work
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                  "hover:bg-blue-100 hover:text-blue-900",
                  "focus:bg-blue-100 focus:text-blue-900",
                  value === option.value && "bg-blue-100 text-blue-900",
                )}
                role="option"
                aria-selected={value === option.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
