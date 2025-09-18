/**
 * Comprehensive TypeScript types and interfaces for the Miamente platform
 * Based on backend models and schemas
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum AppointmentStatus {
  PENDING_PAYMENT = "pending_payment",
  PAID = "paid",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum SlotStatus {
  FREE = "free",
  HELD = "held",
  BOOKED = "booked",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentProvider {
  MOCK = "mock",
  STRIPE = "stripe",
  PAYPAL = "paypal",
}

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
// APPOINTMENT TYPES
// ============================================================================

export interface Appointment extends BaseEntity {
  user_id: string;
  professional_id: string;
  availability_id: string;
  status: AppointmentStatus;
  paid: boolean;

  // Time information
  start_time: string;
  end_time: string;
  duration: number;
  timezone: string;

  // Session information
  jitsi_url?: string;
  session_notes?: string;
  session_rating?: number;
  session_feedback?: string;

  // Payment information
  payment_amount_cents: number;
  payment_currency: string;
  payment_provider: string;
  payment_status: string;
  payment_id?: string;

  // Metadata
  cancelled_at?: string;
  completed_at?: string;
}

export interface AppointmentCreate {
  professional_id: string;
  availability_id: string;
  start_time: string;
  end_time: string;
  duration?: number;
  timezone?: string;
}

export interface AppointmentCreateDirect {
  professional_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  session_notes?: string;
  session_rating?: number;
  session_feedback?: string;
  jitsi_url?: string;
}

export interface BookAppointmentRequest {
  professional_id: string;
  availability_id: string;
}

export interface BookAppointmentResponse {
  appointment_id: string;
  message: string;
}

// ============================================================================
// AVAILABILITY TYPES
// ============================================================================

export interface Availability extends BaseEntity {
  professional_id: string;
  date: string;
  time: string; // HH:MM format
  duration: number;
  timezone: string;
  status: SlotStatus;
  held_by?: string;
  held_at?: string;
}

export interface AvailabilityCreate {
  professional_id: string;
  date: string;
  time: string;
  duration?: number;
  timezone?: string;
}

export interface AvailabilityUpdate {
  status?: SlotStatus;
  held_by?: string;
  held_at?: string;
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
// PAYMENT TYPES
// ============================================================================

export interface Payment extends BaseEntity {
  appointment_id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  provider_payment_id?: string;
  provider_transaction_id?: string;
  provider_response?: Record<string, unknown>;
  description?: string;
  payment_metadata?: Record<string, unknown>;
  processed_at?: string;
  failed_at?: string;
}

export interface PaymentCreate {
  appointment_id: string;
  user_id: string;
  amount_cents: number;
  currency?: string;
  provider?: PaymentProvider;
  description?: string;
  payment_metadata?: Record<string, unknown>;
}

export interface PaymentUpdate {
  status?: PaymentStatus;
  provider_payment_id?: string;
  provider_transaction_id?: string;
  provider_response?: Record<string, unknown>;
  processed_at?: string;
  failed_at?: string;
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
  user_type: string;
  user?: User;
  professional?: Professional;
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

export interface AdminMetrics {
  total_users: number;
  new_users_7_days: number;
  new_users_30_days: number;
  verified_professionals: number;
  total_professionals: number;
  confirmed_appointments_today: number;
  total_appointments_today: number;
  payment_conversion_rate: number;
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
  icon?: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

export interface AdminMetrics {
  total_users: number;
  new_users_7_days: number;
  new_users_30_days: number;
  verified_professionals: number;
  total_professionals: number;
  confirmed_appointments_today: number;
  total_appointments_today: number;
  payment_conversion_rate: number;
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
  appointment_count: number;
  average_rating: number;
}

export interface AppointmentSummary {
  id: string;
  user_id: string;
  professional_id: string;
  start: string;
  end: string;
  status: string;
  paid: boolean;
  user_full_name?: string;
  professional_full_name?: string;
  professional_specialty?: string;
}

// ============================================================================
// PAYMENT SERVICE TYPES
// ============================================================================

export interface PaymentCheckoutResult {
  redirectUrl: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentReturnParams {
  sessionId: string;
  status: "success" | "failed" | "cancelled";
  metadata?: Record<string, unknown>;
}

export interface PaymentStatusResult {
  status: "pending" | "confirmed" | "failed" | "cancelled";
  amount?: number;
  currency?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  id: string;
  appointment_id: string;
  user_id: string;
  professional_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface CreateReviewRequest {
  appointment_id: string;
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

export interface AppointmentChartData {
  date: string;
  confirmed: number;
  total: number;
}

export interface EventStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_day: Record<string, number>;
  unique_users: number;
}

export interface ConversionFunnelData {
  signups: number;
  profile_completions: number;
  slot_creations: number;
  appointment_confirmations: number;
  payment_attempts: number;
  payment_successes: number;
}
