import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { apiClient } from "@/lib/api";
import { UserRole, AccountWithRole } from "@/lib/types";

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  phone?: string;
  is_verified?: boolean;
}

export function useRole() {
  const { account, isLoading: authLoading, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !account) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<{ role: string, account: AccountWithRole, profile: any }>(`/accounts/me`);

        // The response has structure: {role: "admin", account: {...}, profile: {...}}
        const accountData = response.account;
        const roleName = response.role;

        // Determine role from role name string
        let userRole: UserRole;
        switch (roleName) {
          case "admin":
            userRole = UserRole.ADMIN;
            break;
          case "professional":
            userRole = UserRole.PROFESSIONAL;
            break;
          case "user":
          default:
            userRole = UserRole.USER;
            break;
        }

        setUserProfile({
          id: accountData.id,
          role: userRole,
          full_name: accountData.full_name,
          email: accountData.email,
          phone: accountData.phone,
          is_verified: accountData.is_verified,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [account, isAuthenticated]);

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userProfile ? roles.includes(userProfile.role) : false;
  };

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);
  const isProfessional = (): boolean => hasRole(UserRole.PROFESSIONAL);
  const isUser = (): boolean => hasRole(UserRole.USER);

  const getUserRole = (): string | null => {
    if (!userProfile) return null;
    return userProfile.role;
  };

  return {
    userProfile,
    loading: authLoading || loading,
    error,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProfessional,
    isUser,
    getUserRole,
  };
}
