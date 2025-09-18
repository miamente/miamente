import { apiClient } from "./api";

export interface Availability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  professional_id: string;
  start: string;
  end: string;
  is_available: boolean;
  created_at: string;
}

export interface GenerateSlotsResponse {
  created: number;
  skipped: number;
  slots: AvailabilitySlot[];
}

export interface CreateAvailabilityRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export async function getAvailability(professionalId: string): Promise<Availability[]> {
  try {
    const response = await apiClient.get(`/professionals/${professionalId}/availability`);
    return (response as { data: Availability[] }).data;
  } catch (error) {
    console.error("Get availability error:", error);
    throw error;
  }
}

export async function createAvailability(
  professionalId: string,
  data: CreateAvailabilityRequest,
): Promise<Availability> {
  try {
    const response = await apiClient.post(`/professionals/${professionalId}/availability`, data);
    return (response as { data: Availability }).data;
  } catch (error) {
    console.error("Create availability error:", error);
    throw error;
  }
}

export async function updateAvailability(
  professionalId: string,
  availabilityId: string,
  data: Partial<Availability>,
): Promise<Availability> {
  try {
    const response = await apiClient.patch(
      `/professionals/${professionalId}/availability/${availabilityId}`,
      data,
    );
    return (response as { data: Availability }).data;
  } catch (error) {
    console.error("Update availability error:", error);
    throw error;
  }
}

export async function deleteAvailability(
  professionalId: string,
  availabilityId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/professionals/${professionalId}/availability/${availabilityId}`);
  } catch (error) {
    console.error("Delete availability error:", error);
    throw error;
  }
}

// Legacy functions for compatibility
export async function getNext14DaysFreeSlots(professionalId: string): Promise<AvailabilitySlot[]> {
  try {
    const response = await apiClient.get(`/professionals/${professionalId}/slots`);
    return (response as { data: AvailabilitySlot[] }).data;
  } catch (error) {
    console.error("Get free slots error:", error);
    return [];
  }
}

export async function generateSlots(
  professionalId: string,
  data: Record<string, unknown>,
): Promise<GenerateSlotsResponse> {
  try {
    const response = await apiClient.post(`/professionals/${professionalId}/slots`, data);
    return (response as { data: GenerateSlotsResponse }).data;
  } catch (error) {
    console.error("Generate slots error:", error);
    throw error;
  }
}

export async function deleteSlot(professionalId: string, slotId: string): Promise<void> {
  try {
    await apiClient.delete(`/professionals/${professionalId}/slots/${slotId}`);
  } catch (error) {
    console.error("Delete slot error:", error);
    throw error;
  }
}
