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
// UNIFIED ACCOUNTS SYSTEM (NEW)
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  role_id: string;
  email: string;
  full_name: string;
  phone?: string;
  phone_country_code?: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface AccountWithRole extends Account {
  role_name: string;
}

export interface UserProfile {
  account_id: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_phone_country_code?: string;
  emergency_phone_number?: string;
}

export interface ProfessionalProfile {
  account_id: string;
  license_number?: string;
  years_experience: number;
  rate_cents: number;
  custom_rate_cents?: number;
  currency: string;
  short_description?: string;
  academic_experience?: string; // JSON string
  work_experience?: string; // JSON string
  certifications?: string; // JSON string
  languages?: string[];
  timezone: string;
  working_hours?: string; // JSON string
  emergency_contact_name?: string;
  emergency_phone_country_code?: string;
  emergency_phone_number?: string;
}

export interface UnifiedAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  account: AccountWithRole;
  role: string;
  profile?: UserProfile | ProfessionalProfile | null;
}

export interface UnifiedLogin {
  email: string;
  password: string;
}

export interface AccountRegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  phone_country_code?: string;
  phone_number?: string;
}

export interface AccountUpdate {
  full_name?: string;
  phone?: string;
  phone_country_code?: string;
  phone_number?: string;
  profile_picture?: string;
  is_verified?: boolean;
}

export interface AccountStatusUpdate {
  is_active: boolean;
}

export interface AccountWithProfile {
  account: AccountWithRole;
  role: string;
  profile?: UserProfile | ProfessionalProfile | null;
}

export interface PaginatedAccountsResponse {
  items: AccountWithRole[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// USER CREATION TYPES (for registration)
// ============================================================================

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

// ============================================================================
// PROFESSIONAL CREATION TYPES (for registration)
// ============================================================================

export interface ProfessionalCreate {
  email: string;
  full_name: string;
  password: string;
  phone_country_code?: string;
  phone_number?: string;
  license_number?: string;
  years_experience?: number;
  rate_cents?: number;
  currency?: string;
  short_description?: string;
  academic_experience?: AcademicExperience[];
  work_experience?: WorkExperience[];
  certifications?: Certification[];
  languages?: string[];
  timezone?: string;
}

export interface ProfessionalWithCountResponse {
  id: string;
  email: string;
  full_name: string;
  phone_country_code?: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at?: string;
  license_number?: string;
  years_experience: number;
  rate_cents: number;
  currency: string;
  bio?: string;
  timezone: string;
  last_login?: string;
}

export interface PaginatedProfessionalsResponse {
  items: ProfessionalWithCountResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// SPECIALTY TYPES
// ============================================================================

export interface Specialty extends BaseEntity {
  name: string;
  is_active?: boolean;
  description?: string;
  professional_count?: number;
}

export interface SpecialtyCreate {
  name: string;
  description?: string;
}

export interface SpecialtyUpdate {
  name?: string;
  is_active?: boolean;
  description?: string;
}

// ============================================================================
// THERAPEUTIC APPROACH TYPES
// ============================================================================

export interface TherapeuticApproach extends BaseEntity {
  name: string;
  description?: string;
  is_active?: boolean;
  professional_count?: number;
}

export interface TherapeuticApproachCreate {
  name: string;
  description?: string;
}

export interface TherapeuticApproachUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
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

// Type that matches backend schema (snake_case)
export interface ProfessionalModality {
  id: string;
  professional_id?: string;
  modality_id: string;
  modality_name: string;
  virtual_price: number;
  presencial_price: number;
  offers_presencial: boolean;
  description?: string;
  is_default: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Alias for clarity
export type ProfessionalModalityBackend = ProfessionalModality;

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

export interface PaginatedSpecialtiesResponse {
  items: Specialty[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedTherapeuticApproachesResponse {
  items: TherapeuticApproach[];
  total: number;
  page: number;
  page_size: number;
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
// Note: UserProfile is now defined in the "UNIFIED ACCOUNTS SYSTEM" section above

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
  file_url: string;
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
