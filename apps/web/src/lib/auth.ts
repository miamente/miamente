import { apiClient } from "./api";

export type UserRole = "user" | "pro" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
}

export async function registerWithEmail(data: RegisterRequest): Promise<UserProfile> {
  try {
    const response = await apiClient.post("/auth/register/user", data);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  try {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await apiClient.post("/auth/login/user", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Store the token
    const { access_token } = response;
    localStorage.setItem("access_token", access_token);

    // Set the token in the API client for future requests
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    // Remove token from localStorage
    localStorage.removeItem("access_token");

    // Remove token from API client
    delete apiClient.defaults.headers.common["Authorization"];

    // Optionally call logout endpoint
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
    // Even if the API call fails, we should still clear local storage
  }
}

export async function resendEmailVerification(): Promise<void> {
  try {
    await apiClient.post("/auth/resend-verification");
  } catch (error) {
    console.error("Resend verification error:", error);
    throw error;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const response = await apiClient.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("access_token", token);
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken(): void {
  localStorage.removeItem("access_token");
  delete apiClient.defaults.headers.common["Authorization"];
}

export function isAuthenticated(): boolean {
  const token = getStoredToken();
  if (!token) return false;

  // Check if token is expired (basic check)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
}
