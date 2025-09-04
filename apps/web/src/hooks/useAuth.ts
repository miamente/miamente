"use client";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";

import { onAuthStateChange, getUserProfile, type UserProfile } from "@/lib/auth";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      try {
        if (user) {
          const profile = await getUserProfile(user.uid);
          setState({
            user,
            profile,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : "Authentication error",
        });
      }
    });

    return unsubscribe;
  }, []);

  return state;
}
