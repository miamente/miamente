import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";

import { apiClient } from "@/lib/api";

export type UserRole = "user" | "pro" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  phone?: string;
  is_verified?: boolean;
}

export function useRole() {
  const { user, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/auth/me`);

        // The response has structure: {type: "user"|"professional", data: {...}}
        const userData = (response as any).data;
        const userType = (response as any).type;

        setUserProfile({
          id: userData.id,
          role: userType === "professional" ? "pro" : "user",
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          is_verified: userData.is_verified,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userProfile ? roles.includes(userProfile.role) : false;
  };

  const isAdmin = (): boolean => hasRole("admin");
  const isProfessional = (): boolean => hasRole("pro");
  const isUser = (): boolean => hasRole("user");

  return {
    userProfile,
    loading: authLoading || loading,
    error,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProfessional,
    isUser,
  };
}
