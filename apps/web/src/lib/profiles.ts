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

export async function getProfessionalProfile(professionalId: string): Promise<ProfessionalProfile> {
  try {
    const response = await apiClient.get(`/professionals/${professionalId}`);
    return response as ProfessionalProfile;
  } catch (error) {
    console.error("Get professional profile error:", error);
    throw error;
  }
}

export async function updateProfessionalProfileById(
  professionalId: string,
  data: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfile> {
  try {
    const response = await apiClient.patch(`/professionals/${professionalId}`, data);
    return response as ProfessionalProfile;
  } catch (error) {
    console.error("Update professional profile error:", error);
    throw error;
  }
}

export async function getMyProfessionalProfile(): Promise<ProfessionalProfile | null> {
  try {
    const response = await apiClient.get("/professionals/me/profile");
    return response as ProfessionalProfile;
  } catch (error) {
    console.error("Get my professional profile error:", error);
    return null;
  }
}

export async function updateProfessionalProfile(
  data: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfile> {
  try {
    const response = await apiClient.put("/professionals/me", data);
    return response as ProfessionalProfile;
  } catch (error) {
    console.error("Update professional profile error:", error);
    throw error;
  }
}

export async function createProfessionalProfile(
  data: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfile> {
  try {
    const response = await apiClient.post("/professionals", data);
    return response as ProfessionalProfile;
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

export async function queryProfessionals(
  filters?: Record<string, unknown>,
): Promise<ProfessionalsQueryResult> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/professionals?${queryString}` : "/professionals";

    const response = await apiClient.get(endpoint);

    // Transform the response to match the expected format
    const professionals = Array.isArray(response) ? response : [];

    return {
      professionals,
      lastSnapshot: null, // Backend doesn't support pagination yet
    };
  } catch (error) {
    console.error("Query professionals error:", error);
    return {
      professionals: [],
      lastSnapshot: null,
    };
  }
}

export async function getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response as Record<string, unknown>;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.patch(`/users/${userId}`, data);
    return response as Record<string, unknown>;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
}
