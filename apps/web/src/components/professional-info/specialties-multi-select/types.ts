import { Specialty } from "@/lib/types";

export interface SpecialtiesMultiSelectProps {
  readonly value?: readonly string[];
  readonly onChange?: (specialtyIds: readonly string[]) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly placeholder?: string;
  readonly maxSelections?: number;
  readonly "aria-label"?: string;
  readonly "aria-describedby"?: string;
}

export interface SpecialtyBadgeProps {
  specialty: Specialty;
  onRemove: (id: string) => void;
  disabled: boolean;
}

export interface SelectedSpecialtiesListProps {
  selectedSpecialties: Specialty[];
  onRemove: (id: string) => void;
  disabled: boolean;
}

export interface SpecialtySelectorProps {
  availableSpecialties: Specialty[];
  onAdd: (id: string) => void;
  disabled: boolean;
  placeholder: string;
  maxSelections?: number;
  currentCount: number;
}

export interface LoadingStateProps {
  label: string;
}

export interface ErrorStateProps {
  label: string;
  error: string;
}
