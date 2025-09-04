export type UserRole = "user" | "pro" | "admin";

export interface UserProfile {
  fullName: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalProfile {
  specialty: string;
  rateCents: number; // Rate in cents to avoid floating point issues
  bio: string;
  isVerified: boolean;
  credentials?: string; // URL to credentials PDF
  privateNotes?: string; // Admin-only notes
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUpload {
  file: File;
  path: string;
  isPublic: boolean;
}
