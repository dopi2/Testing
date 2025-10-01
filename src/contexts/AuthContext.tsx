"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
      // fetch profile
      fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((d) => {
          if (d.user) setRole(d.user.role);
        });
    }
  }, []);

  function setAuth(token: string, role: string) {
    sessionStorage.setItem("accessToken", token);
    setAccessToken(token);
    setRole(role);
  }

  function clearAuth() {
    sessionStorage.removeItem("accessToken");
    setAccessToken(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, role, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
