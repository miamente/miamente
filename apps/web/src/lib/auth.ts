import { apiClient } from "./api";
import type { UserRole, User, LoginResponse, UserCreate } from "./types";

// Re-export types for backward compatibility
export type { UserRole, User, LoginResponse, UserCreate };

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

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
}

export async function registerWithEmail(data: RegisterRequest): Promise<User> {
  try {
    const response = await apiClient.post("/auth/register/user", data);
    return response as User;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });

    // Store the token
    const { access_token } = response as LoginResponse;
    localStorage.setItem("access_token", access_token);

    // Set the token in the API client for future requests
    apiClient.setToken(access_token);

    return response as LoginResponse;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    // Clear token from API client and localStorage
    // In JWT-based authentication, logout is handled client-side by removing the token
    apiClient.clearToken();
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, we should still clear local storage and redirect
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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

export async function getUserProfile(): Promise<User | null> {
  try {
    const response = await apiClient.get("/users/me");
    return (response as { data: User }).data;
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
  (
    apiClient as unknown as { defaults: { headers: { common: { [key: string]: string } } } }
  ).defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken(): void {
  localStorage.removeItem("access_token");
  delete (apiClient as unknown as { defaults: { headers: { common: { [key: string]: string } } } })
    .defaults.headers.common["Authorization"];
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
