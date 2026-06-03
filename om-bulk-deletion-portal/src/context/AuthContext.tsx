"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { login as loginRequest, logout as logoutRequest } from "@/services/auth.service";
import { authStore } from "@/store/auth.store";
import type { User } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authStore.getUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user: nextUser } = await loginRequest({ username, password });
    authStore.setToken(token);
    authStore.setUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      authStore.clearToken();
      authStore.clearUser();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
