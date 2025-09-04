import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";

import { getFirebaseFirestore } from "@/lib/firebase";

export type UserRole = "user" | "pro" | "admin";

export interface UserProfile {
  uid: string;
  role: UserRole;
  fullName?: string;
  email?: string;
  phone?: string;
  isVerified?: boolean;
}

export function useRole() {
  const { user, loading: authLoading } = useAuth();
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

        const firestore = getFirebaseFirestore();
        const userDoc = await getDoc(doc(firestore, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile({
            uid: user.uid,
            role: data.role || "user",
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            isVerified: data.isVerified,
          });
        } else {
          setError("User profile not found");
        }
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
