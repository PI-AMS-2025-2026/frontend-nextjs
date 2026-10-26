"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import type { LoginRequest, TipoUsuario } from "@/types/api";

export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  tipoUsuario?: TipoUsuario;
  exp?: number;
  [key: string]: unknown;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = authService.getToken();
    if (storedToken) {
      setToken(storedToken);
      const decoded = parseJwt(storedToken);
      setUser(decoded);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.login(credentials);
        const newToken = res.accessToken;
        setToken(newToken);

        const decoded = parseJwt(newToken);
        setUser(decoded);

        // Determine user role (role or tipoUsuario from payload or fallback)
        const roleRaw = decoded?.role || decoded?.tipoUsuario || "ADMINISTRADOR";
        const role = String(roleRaw).toUpperCase();

        setCookie("role", role);

        // Redirect based on role
        if (role === "COORDENADOR") {
          router.push("/coordenador/listagens/sala");
        } else {
          router.push("/adminstrador/home");
        }

        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    deleteCookie("role");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
