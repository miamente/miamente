import { apiClient } from "./api";

export interface ProfessionalProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  specialty: string;
  license_number?: string;
  years_experience: number;
  rate_cents: number;
  currency: string;
  bio?: string;
  education?: string;
  certifications?: string[];
  languages?: string[];
  therapy_approaches?: string[];
  timezone: string;
  profile_picture?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfessionalProfileRequest {
  specialty?: string;
  bio?: string;
  experience_years?: number;
  education?: string;
  certifications?: string[];
  languages?: string[];
  consultation_fee?: number;
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

export async function updateProfessionalProfile(
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
    const response = await apiClient.get("/professionals/me");
    return response as ProfessionalProfile;
  } catch (error) {
    console.error("Get my professional profile error:", error);
    return null;
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
