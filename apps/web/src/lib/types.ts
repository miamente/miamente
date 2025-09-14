export type UserRole = "user" | "professional" | "admin";

export interface UserProfile {
  fullName: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalProfile {
  specialty: string; // Keep for backward compatibility
  rateCents: number; // Rate in cents to avoid floating point issues
  bio: string;
  isVerified: boolean;
  credentials?: string; // URL to credentials PDF
  privateNotes?: string; // Admin-only notes
  createdAt: Date;
  updatedAt: Date;
  // New fields for the updated structure
  specialtyIds?: string[]; // New: list of specialty IDs
  therapeuticApproachIds?: string[]; // New: list of therapeutic approach IDs
  modalityIds?: string[]; // New: list of modality IDs
}

// New types for the updated structure
export interface Specialty {
  id: string;
  name: string;
  category?: string;
}

export interface TherapeuticApproach {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface Modality {
  id: string;
  name: string;
  description: string;
  defaultPriceCents: number;
  currency: string;
  category: string;
}

export interface ProfessionalSpecialty {
  id: string;
  professionalId: string;
  specialtyId: string;
  specialty?: Specialty;
}

export interface ProfessionalTherapeuticApproach {
  id: string;
  professionalId: string;
  therapeuticApproachId: string;
  therapeuticApproach?: TherapeuticApproach;
}

export interface ProfessionalModality {
  id: string;
  professionalId: string;
  modalityId?: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  modality?: Modality;
}

export interface FileUpload {
  file: File;
  path: string;
  isPublic: boolean;
}
