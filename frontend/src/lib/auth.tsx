"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole } from "@/types";
import { api } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  PATIENT: { email: "patient@medreach.ai", pass: "password123" },
  PHARMACIST: { email: "pharmacist@medreach.ai", pass: "password123" },
  ADMIN: { email: "admin@medreach.ai", pass: "password123" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("medreach_token");
    localStorage.removeItem("medreach_user");
    setToken(null);
    setUser(null);
  }, []);

  const persistAuth = useCallback((accessToken: string, userData: any) => {
    localStorage.setItem("medreach_token", accessToken);
    localStorage.setItem("medreach_user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (email: string, pass: string = "password123") => {
    try {
      const res = await api.login(email, pass);
      if (res && res.access_token && res.user) {
        persistAuth(res.access_token, res.user);
      } else {
        // Unexpected response shape
        console.error("Login response missing expected fields:", res);
        throw new Error("Invalid login response from server");
      }
    } catch (err: any) {
      console.error("Login error", err);
      throw err;
    }
  }, [persistAuth]);

  const register = useCallback(async (data: any) => {
    try {
      const res = await api.register(data);
      if (res && res.access_token && res.user) {
        persistAuth(res.access_token, res.user);
      } else {
        console.error("Register response missing expected fields:", res);
        throw new Error("Invalid registration response from server");
      }
    } catch (err: any) {
      console.error("Registration error", err);
      throw err;
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const switchDemoRole = useCallback(async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  }, [login]);

  // On mount: restore session from localStorage or auto-login as demo patient
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("medreach_token");
      const savedUser = localStorage.getItem("medreach_user");

      if (savedToken && savedUser) {
        // Restore from localStorage
        setToken(savedToken);
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.role) {
            setUser(parsedUser);
          } else {
            // Corrupted user data — clear and re-login
            clearAuth();
          }
        } catch {
          // Corrupted JSON — clear and re-login
          clearAuth();
        }

        // Validate the saved token is still valid by calling /auth/me
        try {
          const freshUser = await api.getMe();
          if (freshUser && freshUser.id) {
            // Token is still valid — update user with fresh data
            localStorage.setItem("medreach_user", JSON.stringify(freshUser));
            setUser(freshUser);
          }
        } catch {
          // Token expired or backend unreachable — keep the localStorage user
          // but don't clear auth (user can still see their cached profile)
        }

        setLoading(false);
      } else {
        // No saved session — auto login as default demo patient
        try {
          await login(DEMO_CREDENTIALS.PATIENT.email, DEMO_CREDENTIALS.PATIENT.pass);
        } catch {
          // Backend not available — user will need to login manually
        }
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

