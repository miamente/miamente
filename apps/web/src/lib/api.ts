/**
 * API client for communicating with the FastAPI backend.
 */

import type {
  Specialty,
  TherapeuticApproach,
  Modality,
  ProfessionalSpecialty,
  ProfessionalTherapeuticApproach,
  ProfessionalModality,
  Review,
  UserCreate,
  ProfessionalCreate,
  SpecialtyCreate,
  TherapeuticApproachCreate,
  ModalityCreate,
  CreateReviewRequest,
  ApiResponse,
  PaginatedResponse,
  PaginatedSpecialtiesResponse,
  PaginatedTherapeuticApproachesResponse,
  PaginatedAccountsResponse,
  ErrorResponse,
  SpecialtyUpdate,
  TherapeuticApproachUpdate,
  ModalityUpdate,
  ReviewStats,
  UploadResponse,
  UnifiedAuthResponse,
  AccountWithRole,
  AccountWithProfile,
  AccountUpdate,
} from "./types";

// API Configuration
// Prefer explicit backend URL when provided; otherwise, use frontend proxy route
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_VERSION = "/api/v1";

// Re-export types
export type {
  Specialty,
  TherapeuticApproach,
  Modality,
  Review,
  UserCreate,
  ProfessionalCreate,
  SpecialtyCreate,
  TherapeuticApproachCreate,
  ModalityCreate,
  CreateReviewRequest,
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  SpecialtyUpdate,
  TherapeuticApproachUpdate,
  ModalityUpdate,
  ReviewStats,
  UploadResponse,
  UnifiedAuthResponse,
  AccountWithRole,
  AccountWithProfile,
  AccountUpdate,
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

// Type alias for request body
export type RequestBody = string | FormData | undefined;

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

    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204) {
      return undefined as T;
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

    let body: RequestBody;
    if (data) {
      body = isFormData ? data : JSON.stringify(data);
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

    let body: RequestBody;
    if (data) {
      body = isFormData ? data : JSON.stringify(data);
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

    let body: RequestBody;
    if (data) {
      body = isFormData ? data : JSON.stringify(data);
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

  // Auth methods (Unified accounts system)
  async login(email: string, password: string): Promise<UnifiedAuthResponse> {
    const response = await this.post<UnifiedAuthResponse>("/accounts/login", { email, password });

    // Store the token
    this.setToken(response.access_token);

    return response;
  }

  async registerUser(userData: UserCreate): Promise<UnifiedAuthResponse> {
    const response = await this.post<UnifiedAuthResponse>("/accounts/register/user", userData);

    // Store the token from registration response
    this.setToken(response.access_token);

    return response;
  }

  async registerProfessional(professionalData: ProfessionalCreate): Promise<UnifiedAuthResponse> {
    const response = await this.post<UnifiedAuthResponse>("/accounts/register/professional", professionalData);

    // Store the token from registration response
    this.setToken(response.access_token);

    return response;
  }

  async getCurrentUser(): Promise<AccountWithProfile> {
    // Ensure we have the latest token from localStorage
    this.token = this.getStoredToken();
    const result = await this.get<AccountWithProfile>("/accounts/me");
    
    return result;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Account methods (NEW - replaces User and Professional methods)
  
  /**
   * Get all accounts with pagination and filtering (admin only)
   */
  async getAllAccountsAdmin(
    page: number = 1,
    pageSize: number = 10,
    role?: string,
    search?: string
  ): Promise<PaginatedAccountsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (role) params.set("role", role);
    if (search) params.set("search", search);
    
    return this.get<PaginatedAccountsResponse>(`/accounts/admin/all?${params.toString()}`);
  }

  /**
   * Get account by ID with profile
   */
  async getAccountById(accountId: string): Promise<AccountWithProfile> {
    return this.get<AccountWithProfile>(`/accounts/${accountId}`);
  }

  /**
   * Update account information
   */
  async updateAccount(accountId: string, accountData: AccountUpdate): Promise<AccountWithProfile> {
    return this.patch<AccountWithProfile>(`/accounts/${accountId}`, accountData);
  }

  /**
   * Delete account (admin only)
   */
  async deleteAccount(accountId: string): Promise<void> {
    return this.delete<void>(`/accounts/${accountId}`);
  }

  /**
   * Toggle account active status (admin only)
   */
  async toggleAccountStatus(accountId: string, isActive: boolean): Promise<AccountWithRole> {
    return this.patch<AccountWithRole>(`/accounts/${accountId}/status`, { is_active: isActive });
  }

  // User and Professional methods removed - use Account methods instead

  // Professional methods removed - use Account methods instead

  // Specialty methods
  async getSpecialties(): Promise<Specialty[]> {
    return this.get<Specialty[]>("/specialties");
  }

  async getAllSpecialtiesAdmin(page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedSpecialtiesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    return this.get<PaginatedSpecialtiesResponse>(`/specialties/admin/all?${params.toString()}`);
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

  async getAllTherapeuticApproachesAdmin(page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedTherapeuticApproachesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    return this.get<PaginatedTherapeuticApproachesResponse>(`/therapeutic-approaches/admin/all?${params.toString()}`);
  }

  // Modality methods
  async getModalities(): Promise<Modality[]> {
    return this.get<Modality[]>("/modalities");
  }

  async getAllModalitiesAdmin(): Promise<Modality[]> {
    return this.get<Modality[]>("/modalities/admin/all");
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

  async uploadProfilePicture(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.post<UploadResponse>("/files/upload/profile-picture", formData, {
      headers: {
        // Don't set Content-Type, let the browser set it with boundary
      },
    });
  }

  async uploadCertification(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.post<UploadResponse>("/files/upload/certification", formData, {
      headers: {
        // Don't set Content-Type, let the browser set it with boundary
      },
    });
  }

  async deleteFile(filename: string): Promise<void> {
    return this.delete<void>(`/files/${filename}`);
  }

  async deleteProfilePicture(userId: string, filename: string): Promise<void> {
    return this.delete<void>(`/files/profile-picture/${userId}/${filename}`);
  }

  async deleteCertification(userId: string, filename: string): Promise<void> {
    return this.delete<void>(`/files/certification/${userId}/${filename}`);
  }

  // Professional specialties
  async getProfessionalSpecialties(professionalId: string): Promise<ProfessionalSpecialty[]> {
    return this.get<ProfessionalSpecialty[]>(
      `/professional-specialties/professional/${professionalId}`,
    );
  }

  async updateProfessionalSpecialties(
    professionalId: string,
    specialtyIds: string[],
  ): Promise<ProfessionalSpecialty[]> {
    return this.put<ProfessionalSpecialty[]>(
      `/professional-specialties/professional/${professionalId}/specialties`,
      specialtyIds,
    );
  }

  // Professional therapeutic approaches
  async getProfessionalTherapeuticApproaches(
    professionalId: string,
  ): Promise<ProfessionalTherapeuticApproach[]> {
    return this.get<ProfessionalTherapeuticApproach[]>(
      `/professional-therapeutic-approaches/professional/${professionalId}`,
    );
  }

  async updateProfessionalTherapeuticApproaches(
    professionalId: string,
    approachIds: string[],
  ): Promise<ProfessionalTherapeuticApproach[]> {
    return this.put<ProfessionalTherapeuticApproach[]>(
      `/professional-therapeutic-approaches/professional/${professionalId}/approaches`,
      approachIds,
    );
  }

  // Professional modalities
  async getProfessionalModalities(professionalId: string): Promise<ProfessionalModality[]> {
    return this.get<ProfessionalModality[]>(
      `/professional-modalities/professional/${professionalId}`,
    );
  }

  async createProfessionalModality(
    professionalId: string,
    modalityData: Omit<ProfessionalModality, "id">,
  ): Promise<ProfessionalModality> {
    return this.post<ProfessionalModality>(`/professional-modalities`, {
      professional_id: professionalId,
      ...modalityData,
    });
  }

  async updateProfessionalModality(
    modalityId: string,
    modalityData: Partial<ProfessionalModality>,
  ): Promise<ProfessionalModality> {
    return this.put<ProfessionalModality>(`/professional-modalities/${modalityId}`, modalityData);
  }

  async deleteProfessionalModality(modalityId: string): Promise<void> {
    return this.delete<void>(`/professional-modalities/${modalityId}`);
  }

  // Admin user management methods
  async getUsers(page: number = 1, pageSize: number = 10): Promise<PaginatedAccountsResponse> {
    return this.get<PaginatedAccountsResponse>(`/admin/users?page=${page}&page_size=${pageSize}`);
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<AccountWithRole> {
    return this.put<AccountWithRole>(`/admin/users/${userId}/status`, { is_active: isActive });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/admin/users/${userId}`);
  }

  // Health check
  async healthCheck(): Promise<string> {
    return this.get<string>("/api/health");
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };
