/**
 * Comprehensive TypeScript types and interfaces for the Miamente platform
 * Based on backend models and schemas
 */

import { ComponentType } from "react";

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  USER = "user",
  PROFESSIONAL = "professional",
  ADMIN = "admin",
}

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User extends BaseEntity {
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferences?: string; // JSON string for user preferences
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  profile_picture?: string;
  is_verified?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

// ============================================================================
// PROFESSIONAL TYPES
// ============================================================================

export interface Professional extends BaseEntity {
  email: string;
  full_name: string;
  phone?: string;
  phone_country_code?: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;

  // Professional specific fields
  license_number?: string;
  years_experience: number;
  rate_cents: number;
  custom_rate_cents?: number;
  currency: string;
  bio?: string;

  // Structured data (JSON strings from backend, parsed to objects)
  academic_experience: AcademicExperience[];
  work_experience: WorkExperience[];
  certifications: Certification[];
  languages: string[];
  therapy_approaches_ids: string[];
  specialty_ids: string[];
  modalities: ProfessionalModality[];

  // Availability settings
  timezone: string;
  working_hours?: string; // JSON string

  // Contact information
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface ProfessionalCreate {
  email: string;
  full_name: string;
  password: string;
  phone_country_code?: string;
  phone_number?: string;
  specialty_ids?: string[];
  modalities?: ProfessionalModality[];
  license_number?: string;
  years_experience?: number;
  rate_cents?: number;
  currency?: string;
  bio?: string;
  academic_experience?: AcademicExperience[];
  work_experience?: WorkExperience[];
  certifications?: Certification[];
  languages?: string[];
  therapy_approaches_ids?: string[];
  timezone?: string;
}

export interface ProfessionalUpdate {
  full_name?: string;
  phone_country_code?: string;
  phone_number?: string;
  specialty_ids?: string[];
  modalities?: ProfessionalModality[];
  license_number?: string;
  years_experience?: number;
  rate_cents?: number;
  custom_rate_cents?: number;
  currency?: string;
  bio?: string;
  academic_experience?: AcademicExperience[];
  work_experience?: WorkExperience[];
  certifications?: Certification[];
  languages?: string[];
  therapy_approaches_ids?: string[];
  timezone?: string;
  profile_picture?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  is_verified?: boolean;
}

export interface ProfessionalLogin {
  email: string;
  password: string;
}

// ============================================================================
// SPECIALTY TYPES
// ============================================================================

export interface Specialty extends BaseEntity {
  name: string;
  category: string;
}

export interface SpecialtyCreate {
  name: string;
  category: string;
}

export interface SpecialtyUpdate {
  name?: string;
  category?: string;
}

// ============================================================================
// THERAPEUTIC APPROACH TYPES
// ============================================================================

export interface TherapeuticApproach extends BaseEntity {
  name: string;
  description?: string;
  category?: string;
}

export interface TherapeuticApproachCreate {
  name: string;
  description?: string;
  category?: string;
}

export interface TherapeuticApproachUpdate {
  name?: string;
  description?: string;
  category?: string;
}

// ============================================================================
// MODALITY TYPES
// ============================================================================

export interface Modality extends BaseEntity {
  name: string;
  description?: string;
  category?: string;
  currency: string;
  default_price_cents: number;
  is_active: boolean;
}

export interface ModalityCreate {
  name: string;
  description?: string;
  category?: string;
  currency?: string;
  default_price_cents?: number;
  is_active?: boolean;
}

export interface ModalityUpdate {
  name?: string;
  description?: string;
  category?: string;
  currency?: string;
  default_price_cents?: number;
  is_active?: boolean;
}

// ============================================================================
// PROFESSIONAL MODALITY TYPES
// ============================================================================

export interface ProfessionalModality {
  id: string;
  modalityId: string;
  modalityName: string;
  virtualPrice: number;
  presencialPrice: number;
  offersPresencial: boolean;
  description?: string;
  isDefault: boolean;
}

// ============================================================================
// STRUCTURED DATA TYPES
// ============================================================================

export interface AcademicExperience {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current?: boolean;
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current?: boolean;
}

export interface Certification {
  name: string;
  document?: File;
  document_url?: string;
  file_name?: string;
  issued_by?: string;
  issued_date?: string;
  expiry_date?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthUser {
  type: UserRole;
  data: User | Professional;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_type?: string;
  user?: User;
  professional?: Professional;
  // For unified responses
  user_data?: User;
  professional_data?: Professional;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
  field_errors?: Record<string, string[]>;
}

// ============================================================================
// ADDITIONAL TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  phone?: string;
  is_verified?: boolean;
  created_at?: string;
}

export interface ProfessionalSpecialty {
  id: string;
  professional_id: string;
  specialty_id?: string;
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProfessionalTherapeuticApproach {
  id: string;
  professional_id: string;
  therapeutic_approach_id: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface UserProfileFormData {
  full_name: string;
  phone_country_code?: string;
  phone_number?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface ProfessionalProfileFormData {
  full_name: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  license_number?: string;
  years_experience: number;
  bio?: string;
  academic_experience: AcademicExperience[];
  work_experience: WorkExperience[];
  certifications: Certification[];
  languages: string[];
  therapy_approaches_ids: string[];
  specialty_ids: string[];
  modalities: ProfessionalModality[];
  timezone: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

export interface EventLogEntry {
  id: string;
  event_type: string;
  data: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
}

export interface ProfessionalSummary {
  id: string;
  full_name: string;
  email: string;
  specialty_ids: string[];
  is_verified: boolean;
  created_at: string;
  average_rating: number;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  id: string;
  user_id: string;
  professional_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface CreateReviewRequest {
  professional_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewStats {
  average: number;
  count: number;
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  content_type: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface EventLogData {
  id: string;
  user_id: string;
  action: string;
  entity_id?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface EventStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_day: Record<string, number>;
  unique_users: number;
}
