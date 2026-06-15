"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthUser } from "@/types/auth";
import { apiGetSession, apiLogout } from "@/lib/auth-client";
import { isValidAuthUser } from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await apiGetSession();
    setUserState(session);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const setUser = useCallback((newUser: AuthUser) => {
    if (!isValidAuthUser(newUser)) return;
    setUserState(newUser);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
