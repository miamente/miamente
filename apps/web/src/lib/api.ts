/**
 * API client for communicating with the FastAPI backend.
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_VERSION = "/api/v1";

// Types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface TypedApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface RegisterProfessionalRequest {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
  specialty: string;
  license_number?: string;
  years_experience?: number;
  rate_cents: number;
  currency?: string;
  bio?: string;
  education?: string;
  certifications?: string[];
  languages?: string[];
  therapy_approaches?: string[];
  timezone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Professional {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;
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
  emergency_contact?: string;
  emergency_phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Availability {
  id: string;
  professional_id: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: "free" | "held" | "booked" | "cancelled";
  held_by?: string;
  held_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  professional_id: string;
  availability_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  timezone: string;
  status:
    | "pending_payment"
    | "paid"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  paid: boolean;
  payment_amount_cents: number;
  payment_currency: string;
  payment_provider: string;
  payment_status: string;
  jitsi_url?: string;
  session_notes?: string;
  session_rating?: number;
  session_feedback?: string;
  created_at: string;
  updated_at?: string;
  cancelled_at?: string;
  completed_at?: string;
}

export interface PaymentIntent {
  payment_intent_id: string;
  client_secret?: string;
  status: string;
  amount_cents: number;
  currency: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      console.log("API Client - Token saved to localStorage:", token.substring(0, 20) + "...");
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${API_VERSION}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          headers.Authorization = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
          }

          return retryResponse.json();
        } else {
          this.clearToken();
          throw new Error("Authentication failed");
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Public HTTP methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  private async refreshToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}${API_VERSION}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data: TokenResponse = await response.json();
        this.setToken(data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    return false;
  }

  // Auth Methods
  async loginUser(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>("/auth/login/user", credentials);

    this.setToken(response.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", response.refresh_token);
    }

    return response;
  }

  async loginProfessional(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>("/auth/login/professional", credentials);

    this.setToken(response.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", response.refresh_token);
    }

    return response;
  }

  async registerUser(userData: RegisterUserRequest): Promise<User> {
    return this.post<User>("/auth/register/user", userData);
  }

  async registerProfessional(professionalData: RegisterProfessionalRequest): Promise<Professional> {
    return this.post<Professional>("/auth/register/professional", professionalData);
  }

  async getCurrentUser(): Promise<{ type: "user" | "professional"; data: User | Professional }> {
    return this.get("/auth/me");
  }

  logout(): void {
    this.clearToken();
  }

  // User Methods
  async getUserProfile(): Promise<User> {
    return this.request<User>("/users/me");
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    return this.request<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Professional Methods
  async getProfessionals(): Promise<Professional[]> {
    return this.request<Professional[]>("/professionals");
  }

  async getProfessional(id: string): Promise<Professional> {
    return this.request<Professional>(`/professionals/${id}`);
  }

  async getProfessionalProfile(): Promise<Professional> {
    return this.request<Professional>("/professionals/me/profile");
  }

  async updateProfessionalProfile(updates: Partial<Professional>): Promise<Professional> {
    return this.request<Professional>("/professionals/me/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Availability Methods
  async getProfessionalAvailability(professionalId: string): Promise<Availability[]> {
    return this.request<Availability[]>(`/availability/professional/${professionalId}`);
  }

  async createAvailability(
    availability: Omit<Availability, "id" | "created_at" | "updated_at">,
  ): Promise<Availability> {
    return this.request<Availability>("/availability", {
      method: "POST",
      body: JSON.stringify(availability),
    });
  }

  // Appointment Methods
  async bookAppointment(
    professionalId: string,
    availabilityId: string,
  ): Promise<{ appointment_id: string; message: string }> {
    return this.request("/appointments/book", {
      method: "POST",
      body: JSON.stringify({
        professional_id: professionalId,
        availability_id: availabilityId,
      }),
    });
  }

  async getUserAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>("/appointments");
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async cancelAppointment(id: string): Promise<{ message: string }> {
    return this.request(`/appointments/${id}`, {
      method: "DELETE",
    });
  }

  // Payment Methods
  async createPaymentIntent(
    appointmentId: string,
    amountCents: number,
    currency: string = "COP",
  ): Promise<PaymentIntent> {
    return this.request<PaymentIntent>("/payments/intent", {
      method: "POST",
      body: JSON.stringify({
        appointment_id: appointmentId,
        amount_cents: amountCents,
        currency,
      }),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<{ message: string; payment_id: string }> {
    return this.request(`/payments/confirm/${paymentIntentId}`, {
      method: "POST",
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Types are already exported above, no need to re-export
