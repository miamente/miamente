/**
 * API client for communicating with the FastAPI backend.
 */

import type {
  User,
  Professional,
  Specialty,
  TherapeuticApproach,
  Modality,
  Review,
  LoginResponse,
  UserCreate,
  ProfessionalCreate,
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
  SpecialtyUpdate,
  TherapeuticApproachUpdate,
  ModalityUpdate,
  ReviewStats,
  UploadResponse,
} from "./types";

// API Configuration
// Prefer explicit backend URL when provided; otherwise, use frontend proxy route
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_VERSION = "/api/v1";

// Re-export types for backward compatibility
export type {
  User,
  Professional,
  Specialty,
  TherapeuticApproach,
  Modality,
  Review,
  LoginResponse,
  UserCreate,
  ProfessionalCreate,
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
  SpecialtyUpdate,
  TherapeuticApproachUpdate,
  ModalityUpdate,
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
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const headers = new Headers(this.getHeaders());
    if (isFormData) {
      headers.delete("Content-Type");
    }

    let body: string | FormData | undefined;
    if (data) {
      body = isFormData ? (data as FormData) : JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "POST",
      headers,
      body,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const headers = new Headers(this.getHeaders());
    if (isFormData) {
      headers.delete("Content-Type");
    }

    let body: string | FormData | undefined;
    if (data) {
      body = isFormData ? (data as FormData) : JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "PUT",
      headers,
      body,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const headers = new Headers(this.getHeaders());
    if (isFormData) {
      headers.delete("Content-Type");
    }

    let body: string | FormData | undefined;
    if (data) {
      body = isFormData ? (data as FormData) : JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${API_VERSION}${endpoint}`, {
      method: "PATCH",
      headers,
      body,
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
  async getUsers(params?: { skip?: number; limit?: number; role?: string }): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set("skip", params.skip.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.role) searchParams.set("role", params.role);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";
    return this.get<User[]>(endpoint);
  }

  async getUser(userId: string): Promise<User> {
    return this.get<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: UserUpdate): Promise<User> {
    return this.patch<User>(`/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/users/${userId}`);
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    return this.patch<User>(`/users/${userId}/status`, { is_active: isActive });
  }

  // Professional methods
  async getProfessional(professionalId: string): Promise<Professional> {
    return this.get<Professional>(`/professionals/${professionalId}`);
  }

  async getProfessionals(params?: {
    skip?: number;
    limit?: number;
    specialty?: string;
    min_rate_cents?: number;
    max_rate_cents?: number;
  }): Promise<Professional[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set("skip", params.skip.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.specialty) searchParams.set("specialty", params.specialty);
    if (params?.min_rate_cents !== undefined)
      searchParams.set("min_rate_cents", params.min_rate_cents.toString());
    if (params?.max_rate_cents !== undefined)
      searchParams.set("max_rate_cents", params.max_rate_cents.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/professionals?${queryString}` : "/professionals";
    return this.get<Professional[]>(endpoint);
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

  async toggleProfessionalStatus(professionalId: string, isActive: boolean): Promise<Professional> {
    return this.patch<Professional>(`/professionals/${professionalId}/status`, {
      is_active: isActive,
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
