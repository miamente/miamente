import { apiClient } from "./api";

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  specialty: string;
  bio?: string;
  experience_years?: number;
  education?: string;
  certifications?: string[];
  languages?: string[];
  consultation_fee?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Update professional profile error:", error);
    throw error;
  }
}

export async function getMyProfessionalProfile(): Promise<ProfessionalProfile | null> {
  try {
    const response = await apiClient.get("/professionals/me");
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Create professional profile error:", error);
    throw error;
  }
}

// Legacy functions for compatibility
export async function queryProfessionals(
  filters?: Record<string, unknown>,
): Promise<ProfessionalProfile[]> {
  try {
    const response = await apiClient.get("/professionals", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Query professionals error:", error);
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
}
