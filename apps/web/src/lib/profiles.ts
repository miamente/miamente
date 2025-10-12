import { apiClient } from "./api";
import type { AcademicExperience, WorkExperience, Certification, Professional } from "./types";

// Re-export types for backward compatibility
export type { AcademicExperience, WorkExperience, Certification };

// Legacy Modality interface for backward compatibility
export interface Modality {
  id: string;
  modalityId: string;
  modalityName: string;
  virtualPrice: number;
  presencialPrice: number;
  offersPresencial: boolean;
  description?: string;
  isDefault: boolean;
}

// Use the comprehensive Professional type from types.ts
export type ProfessionalProfile = Professional;

export interface UpdateProfessionalProfileRequest {
  // Basic info
  full_name?: string;
  phone_country_code?: string;
  phone_number?: string;

  // Professional info
  specialty?: string;
  specialty_ids?: string[];
  license_number?: string;
  years_experience?: number;
  rate_cents?: number;
  currency?: string;
  bio?: string;

  // Experience arrays
  academic_experience?: Array<{
    institution: string;
    degree: string;
    field: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;

  work_experience?: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;

  // Arrays
  certifications?: Certification[];
  languages?: string[];
  therapy_approaches_ids?: string[];
  modalities?: Modality[];

  // Settings
  timezone?: string;
  profile_picture?: string;
}

/**
 * Get professional profile by ID (uses new unified accounts system)
 * 
 * @param professionalId - Professional account ID
 * @returns Professional profile data
 */
export async function getProfessionalProfile(professionalId: string): Promise<ProfessionalProfile> {
  try {
    // Use new unified endpoint
    const response = await apiClient.getAccountById(professionalId);
    
    // Convert AccountWithProfile to Professional (legacy format)
    const account = response.account;
    const profile = response.profile as any;
    
    return {
      id: account.id,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      phone_country_code: account.phone_country_code,
      phone_number: account.phone_number,
      is_active: account.is_active,
      is_verified: account.is_verified,
      profile_picture: account.profile_picture,
      created_at: account.created_at,
      updated_at: account.updated_at,
      
      // Professional fields
      license_number: profile?.license_number,
      years_experience: profile?.years_experience || 0,
      rate_cents: profile?.rate_cents || 0,
      custom_rate_cents: profile?.custom_rate_cents,
      currency: profile?.currency || "COP",
      bio: profile?.short_description,
      
      academic_experience: profile?.academic_experience ? JSON.parse(profile.academic_experience) : [],
      work_experience: profile?.work_experience ? JSON.parse(profile.work_experience) : [],
      certifications: profile?.certifications ? JSON.parse(profile.certifications) : [],
      languages: profile?.languages || [],
      therapy_approaches_ids: [],
      specialty_ids: [],
      modalities: [],
      
      timezone: profile?.timezone || "America/Bogota",
      working_hours: profile?.working_hours,
      emergency_contact: profile?.emergency_contact_name,
      emergency_phone:
        profile?.emergency_phone_country_code && profile?.emergency_phone_number
          ? `${profile.emergency_phone_country_code}${profile.emergency_phone_number}`
          : undefined,
    };
  } catch (error) {
    console.error("Get professional profile error:", error);
    throw error;
  }
}

/**
 * Update professional profile by ID (uses new unified accounts system)
 */
export async function updateProfessionalProfileById(
  professionalId: string,
  data: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfile> {
  try {
    // Convert to AccountUpdate format
    const accountUpdate = {
      full_name: data.full_name,
      phone_country_code: data.phone_country_code,
      phone_number: data.phone_number,
      profile_picture: data.profile_picture,
    };
    
    const response = await apiClient.updateAccount(professionalId, accountUpdate);
    
    // Convert to legacy Professional format
    return apiClient.getProfessional(professionalId);
  } catch (error) {
    console.error("Update professional profile error:", error);
    throw error;
  }
}

/**
 * Get current user's professional profile (uses new unified system)
 */
export async function getMyProfessionalProfile(): Promise<ProfessionalProfile | null> {
  try {
    const response = await apiClient.getCurrentUser();
    
    if (response.type !== "professional") {
      return null;
    }
    
    return response.data as Professional;
  } catch (error) {
    console.error("Get my professional profile error:", error);
    return null;
  }
}

/**
 * Update current user's professional profile
 * 
 * @deprecated Use updateProfessionalProfileById with current user ID
 */
export async function updateProfessionalProfile(
  data: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfile> {
  try {
    const currentUser = await apiClient.getCurrentUser();
    const userId = currentUser.data.id;
    return updateProfessionalProfileById(userId, data);
  } catch (error) {
    console.error("Update professional profile error:", error);
    throw error;
  }
}

/**
 * @deprecated Professional profiles are created during registration
 */
export async function createProfessionalProfile(
  data: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfile> {
  try {
    throw new Error("Professional profiles are now created during registration. Use registerProfessional instead.");
  } catch (error) {
    console.error("Create professional profile error:", error);
    throw error;
  }
}

// Legacy functions for compatibility
export interface ProfessionalsQueryResult {
  professionals: ProfessionalProfile[];
  lastSnapshot: string | null;
}

/**
 * Query professionals with filters (uses new unified accounts system)
 * 
 * @param filters - Filter parameters (page, specialty, etc.)
 * @returns List of professionals
 */
export async function queryProfessionals(
  filters?: Record<string, unknown>,
): Promise<ProfessionalsQueryResult> {
  try {
    // Use new unified endpoint with role filter
    const page = filters?.page ? Number(filters.page) : 1;
    const pageSize = filters?.pageSize ? Number(filters.pageSize) : 100;
    const search = filters?.search ? String(filters.search) : undefined;
    
    const response = await apiClient.getAllAccountsAdmin(page, pageSize, "professional", search);
    
    // Convert accounts to Professional format
    const professionals: ProfessionalProfile[] = await Promise.all(
      response.items.map(async (account) => {
        try {
          const fullProfile = await apiClient.getAccountById(account.id);
          const profile = fullProfile.profile as any;
          
          return {
            id: account.id,
            email: account.email,
            full_name: account.full_name,
            phone: account.phone,
            phone_country_code: account.phone_country_code,
            phone_number: account.phone_number,
            is_active: account.is_active,
            is_verified: account.is_verified,
            profile_picture: account.profile_picture,
            created_at: account.created_at,
            updated_at: account.updated_at,
            
            license_number: profile?.license_number,
            years_experience: profile?.years_experience || 0,
            rate_cents: profile?.rate_cents || 0,
            custom_rate_cents: profile?.custom_rate_cents,
            currency: profile?.currency || "COP",
            bio: profile?.short_description,
            
            academic_experience: profile?.academic_experience ? JSON.parse(profile.academic_experience) : [],
            work_experience: profile?.work_experience ? JSON.parse(profile.work_experience) : [],
            certifications: profile?.certifications ? JSON.parse(profile.certifications) : [],
            languages: profile?.languages || [],
            therapy_approaches_ids: [],
            specialty_ids: [],
            modalities: [],
            
            timezone: profile?.timezone || "America/Bogota",
            working_hours: profile?.working_hours,
            emergency_contact: profile?.emergency_contact_name,
            emergency_phone:
              profile?.emergency_phone_country_code && profile?.emergency_phone_number
                ? `${profile.emergency_phone_country_code}${profile.emergency_phone_number}`
                : undefined,
          };
        } catch {
          // Fallback if full profile fails
          return {
            id: account.id,
            email: account.email,
            full_name: account.full_name,
            phone_country_code: account.phone_country_code,
            phone_number: account.phone_number,
            is_active: account.is_active,
            is_verified: account.is_verified,
            profile_picture: account.profile_picture,
            created_at: account.created_at,
            updated_at: account.updated_at,
            license_number: "",
            years_experience: 0,
            rate_cents: 0,
            currency: "COP",
            bio: "",
            academic_experience: [],
            work_experience: [],
            certifications: [],
            languages: [],
            therapy_approaches_ids: [],
            specialty_ids: [],
            modalities: [],
            timezone: "America/Bogota",
          };
        }
      })
    );

    return {
      professionals,
      lastSnapshot: null,
    };
  } catch (error) {
    console.error("Query professionals error:", error);
    return {
      professionals: [],
      lastSnapshot: null,
    };
  }
}

/**
 * Get user profile (uses new unified accounts system)
 * 
 * @param userId - User ID (can be self or admin accessing another user)
 * @returns User profile data
 */
export async function getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    // Use new unified endpoint
    const response = await apiClient.getAccountById(userId);
    
    // Convert to legacy format for compatibility
    return {
      id: response.account.id,
      email: response.account.email,
      full_name: response.account.full_name,
      phone: response.account.phone,
      phone_country_code: response.account.phone_country_code,
      phone_number: response.account.phone_number,
      is_active: response.account.is_active,
      is_verified: response.account.is_verified,
      profile_picture: response.account.profile_picture,
      created_at: response.account.created_at,
      updated_at: response.account.updated_at,
      role: response.role,
      // UserProfile fields
      ...(response.profile || {}),
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}

/**
 * Update user profile (uses new unified accounts system)
 * 
 * @param userId - User ID
 * @param data - Profile data to update
 * @returns Updated profile
 */
export async function updateUserProfile(
  userId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    // Convert to AccountUpdate format
    const accountUpdate = {
      full_name: data.full_name as string | undefined,
      phone: data.phone as string | undefined,
      phone_country_code: data.phone_country_code as string | undefined,
      phone_number: data.phone_number as string | undefined,
      profile_picture: data.profile_picture as string | undefined,
      is_verified: data.is_verified as boolean | undefined,
    };

    const response = await apiClient.updateAccount(userId, accountUpdate);
    
    // Convert to legacy format for compatibility
    return {
      id: response.account.id,
      email: response.account.email,
      full_name: response.account.full_name,
      phone: response.account.phone,
      phone_country_code: response.account.phone_country_code,
      phone_number: response.account.phone_number,
      is_active: response.account.is_active,
      is_verified: response.account.is_verified,
      profile_picture: response.account.profile_picture,
      created_at: response.account.created_at,
      updated_at: response.account.updated_at,
      role: response.role,
      ...(response.profile || {}),
    };
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
}
