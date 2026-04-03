"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { api } from "@/lib/axios";

export type AuthUser = {
  id: string;
  phone: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Clear user (used on logout or 401)
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setIsLoading(false);
  }, []);

  /**
   * Fetch current user from backend (/me)
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<{ user: AuthUser }>("/current-user", {
        withCredentials: true,
      });

      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuth();
        return null;
      }

      // For any other error, also reset user
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  const logout = useCallback(async () => {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  /**
   * On app load → check session
   */
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      refreshUser,
      logout,
      clearAuth,
    }),
    [user, isLoading, refreshUser, logout, clearAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
