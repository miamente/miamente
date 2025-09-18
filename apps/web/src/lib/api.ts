/**
 * API client for communicating with the FastAPI backend.
 */

import type {
  User,
  Professional,
  Appointment,
  Specialty,
  TherapeuticApproach,
  Modality,
  Review,
  LoginResponse,
  UserCreate,
  ProfessionalCreate,
  AppointmentCreate,
  SpecialtyCreate,
  TherapeuticApproachCreate,
  ModalityCreate,
  CreateReviewRequest,
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  AuthUser,
  UserUpdate,
  ProfessionalUpdate,
  AppointmentUpdate,
  SpecialtyUpdate,
  TherapeuticApproachUpdate,
  ModalityUpdate,
  BookAppointmentRequest,
  BookAppointmentResponse,
  ReviewStats,
  UploadResponse,
} from "./types";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_VERSION = "/api/v1";

// Re-export types for backward compatibility
export type {
  User,
  Professional,
  Appointment,
  Specialty,
  TherapeuticApproach,
  Modality,
  Review,
  LoginResponse,
  UserCreate,
  ProfessionalCreate,
  AppointmentCreate,
  SpecialtyCreate,
  TherapeuticApproachCreate,
  ModalityCreate,
  CreateReviewRequest,
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  AuthUser,
  UserUpdate,
  ProfessionalUpdate,
  AppointmentUpdate,
  SpecialtyUpdate,
  TherapeuticApproachUpdate,
  ModalityUpdate,
  BookAppointmentRequest,
  BookAppointmentResponse,
  ReviewStats,
  UploadResponse,
};

// Legacy type aliases for backward compatibility
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterUserRequest = UserCreate;
export type RegisterProfessionalRequest = ProfessionalCreate;

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

// API Client Class
class ApiClient {
  private readonly baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.detail);
    }

    return response.json();
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  // Auth methods
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/auth/login", { email, password });

    // Store the token
    const { access_token } = response;
    this.setToken(access_token);

    return response;
  }

  async loginUser(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/auth/login/user", credentials);

    // Store the token
    const { access_token } = response;
    this.setToken(access_token);

    return response;
  }

  async loginProfessional(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/auth/login/professional", credentials);

    // Store the token
    const { access_token } = response;
    this.setToken(access_token);

    return response;
  }

  async registerUser(userData: UserCreate): Promise<User> {
    return this.post<User>("/auth/register/user", userData);
  }

  async registerProfessional(professionalData: ProfessionalCreate): Promise<Professional> {
    return this.post<Professional>("/auth/register/professional", professionalData);
  }

  async getCurrentUser(): Promise<AuthUser> {
    // Ensure we have the latest token from localStorage
    this.token = this.getStoredToken();
    const result = await this.get<AuthUser>("/auth/me");
    return result;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // User methods
  async getUser(userId: string): Promise<User> {
    return this.get<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: UserUpdate): Promise<User> {
    return this.patch<User>(`/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/users/${userId}`);
  }

  // Professional methods
  async getProfessional(professionalId: string): Promise<Professional> {
    return this.get<Professional>(`/professionals/${professionalId}`);
  }

  async getProfessionals(params?: {
    page?: number;
    size?: number;
    specialty?: string;
    verified?: boolean;
  }): Promise<PaginatedResponse<Professional>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.size) searchParams.set("size", params.size.toString());
    if (params?.specialty) searchParams.set("specialty", params.specialty);
    if (params?.verified !== undefined) searchParams.set("verified", params.verified.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/professionals?${queryString}` : "/professionals";
    return this.get<PaginatedResponse<Professional>>(endpoint);
  }

  async updateProfessional(
    professionalId: string,
    professionalData: ProfessionalUpdate,
  ): Promise<Professional> {
    return this.patch<Professional>(`/professionals/${professionalId}`, professionalData);
  }

  async deleteProfessional(professionalId: string): Promise<void> {
    return this.delete<void>(`/professionals/${professionalId}`);
  }

  // Appointment methods
  async getAppointments(params?: {
    page?: number;
    size?: number;
    status?: string;
    user_id?: string;
    professional_id?: string;
  }): Promise<PaginatedResponse<Appointment>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.size) searchParams.set("size", params.size.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.user_id) searchParams.set("user_id", params.user_id);
    if (params?.professional_id) searchParams.set("professional_id", params.professional_id);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/appointments?${queryString}` : "/appointments";
    return this.get<PaginatedResponse<Appointment>>(endpoint);
  }

  async getAppointment(appointmentId: string): Promise<Appointment> {
    return this.get<Appointment>(`/appointments/${appointmentId}`);
  }

  async createAppointment(appointmentData: AppointmentCreate): Promise<Appointment> {
    return this.post<Appointment>("/appointments", appointmentData);
  }

  async updateAppointment(
    appointmentId: string,
    appointmentData: AppointmentUpdate,
  ): Promise<Appointment> {
    return this.patch<Appointment>(`/appointments/${appointmentId}`, appointmentData);
  }

  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    return this.patch<Appointment>(`/appointments/${appointmentId}`, { status: "cancelled" });
  }

  async bookAppointment(bookingData: BookAppointmentRequest): Promise<BookAppointmentResponse> {
    return this.post<BookAppointmentResponse>("/appointments/book", bookingData);
  }

  async getUserAppointments(): Promise<Appointment[]> {
    return this.get<Appointment[]>("/appointments/my-appointments");
  }

  async bookAppointmentDirect(
    professionalId: string,
    startTime: string,
    endTime: string,
  ): Promise<BookAppointmentResponse> {
    return this.post<BookAppointmentResponse>("/appointments/book", {
      professional_id: professionalId,
      start_time: startTime,
      end_time: endTime,
    });
  }

  // Specialty methods
  async getSpecialties(): Promise<Specialty[]> {
    return this.get<Specialty[]>("/specialties");
  }

  async getSpecialty(specialtyId: string): Promise<Specialty> {
    return this.get<Specialty>(`/specialties/${specialtyId}`);
  }

  async createSpecialty(specialtyData: SpecialtyCreate): Promise<Specialty> {
    return this.post<Specialty>("/specialties", specialtyData);
  }

  async updateSpecialty(specialtyId: string, specialtyData: SpecialtyUpdate): Promise<Specialty> {
    return this.patch<Specialty>(`/specialties/${specialtyId}`, specialtyData);
  }

  async deleteSpecialty(specialtyId: string): Promise<void> {
    return this.delete<void>(`/specialties/${specialtyId}`);
  }

  // Therapeutic Approach methods
  async getTherapeuticApproaches(): Promise<TherapeuticApproach[]> {
    return this.get<TherapeuticApproach[]>("/therapeutic-approaches");
  }

  async getTherapeuticApproach(approachId: string): Promise<TherapeuticApproach> {
    return this.get<TherapeuticApproach>(`/therapeutic-approaches/${approachId}`);
  }

  async createTherapeuticApproach(
    approachData: TherapeuticApproachCreate,
  ): Promise<TherapeuticApproach> {
    return this.post<TherapeuticApproach>("/therapeutic-approaches", approachData);
  }

  async updateTherapeuticApproach(
    approachId: string,
    approachData: TherapeuticApproachUpdate,
  ): Promise<TherapeuticApproach> {
    return this.patch<TherapeuticApproach>(`/therapeutic-approaches/${approachId}`, approachData);
  }

  async deleteTherapeuticApproach(approachId: string): Promise<void> {
    return this.delete<void>(`/therapeutic-approaches/${approachId}`);
  }

  // Modality methods
  async getModalities(): Promise<Modality[]> {
    return this.get<Modality[]>("/modalities");
  }

  async getModality(modalityId: string): Promise<Modality> {
    return this.get<Modality>(`/modalities/${modalityId}`);
  }

  async createModality(modalityData: ModalityCreate): Promise<Modality> {
    return this.post<Modality>("/modalities", modalityData);
  }

  async updateModality(modalityId: string, modalityData: ModalityUpdate): Promise<Modality> {
    return this.patch<Modality>(`/modalities/${modalityId}`, modalityData);
  }

  async deleteModality(modalityId: string): Promise<void> {
    return this.delete<void>(`/modalities/${modalityId}`);
  }

  // Review methods
  async getReviews(params?: {
    page?: number;
    size?: number;
    professional_id?: string;
    user_id?: string;
  }): Promise<PaginatedResponse<Review>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.size) searchParams.set("size", params.size.toString());
    if (params?.professional_id) searchParams.set("professional_id", params.professional_id);
    if (params?.user_id) searchParams.set("user_id", params.user_id);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/reviews?${queryString}` : "/reviews";
    return this.get<PaginatedResponse<Review>>(endpoint);
  }

  async getReview(reviewId: string): Promise<Review> {
    return this.get<Review>(`/reviews/${reviewId}`);
  }

  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    return this.post<Review>("/reviews", reviewData);
  }

  async getProfessionalReviews(professionalId: string, limit?: number): Promise<Review[]> {
    const endpoint = limit
      ? `/reviews/professional/${professionalId}?limit=${limit}`
      : `/reviews/professional/${professionalId}`;
    return this.get<Review[]>(endpoint);
  }

  async getProfessionalAverageRating(professionalId: string): Promise<ReviewStats> {
    return this.get<ReviewStats>(`/reviews/professional/${professionalId}/stats`);
  }

  async hasUserReviewedAppointment(
    userId: string,
    appointmentId: string,
  ): Promise<{ hasReviewed: boolean }> {
    return this.get<{ hasReviewed: boolean }>(`/reviews/check/${appointmentId}/${userId}`);
  }

  // File upload methods
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.post<UploadResponse>("/upload", formData, {
      headers: {
        // Don't set Content-Type, let the browser set it with boundary
      },
    });
  }

  async deleteFile(filename: string): Promise<void> {
    return this.delete<void>(`/files/${filename}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get<{ status: string; timestamp: string }>("/health");
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };
