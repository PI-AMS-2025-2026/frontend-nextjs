"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import type { LoginRequest, TipoUsuario, UsuarioResponse } from "@/types/api";

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
  const [user, setUser] = useState<UsuarioResponse | JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let ativo = true;

    async function restaurarSessao() {
      const storedToken = authService.getToken();
      const refreshToken = authService.getRefreshToken();

      if (!storedToken || !refreshToken) {
        authService.clearSession();
        if (ativo) setIsLoading(false);
        return;
      }

      try {
        // Valida o refresh token mesmo quando ainda existe um access token salvo.
        const response = await authService.refreshToken();
        const refreshedUser = response.usuario ?? authService.getUser() ?? parseJwt(response.accessToken);
        const role = String(
          refreshedUser && "tipoUsuario" in refreshedUser
            ? refreshedUser.tipoUsuario
            : (parseJwt(response.accessToken)?.role ?? parseJwt(response.accessToken)?.tipoUsuario),
        ).toUpperCase();

        if (!["ADMIN", "ADMINISTRADOR", "COORDENADOR"].includes(role)) {
          throw new Error("Sessão sem perfil válido");
        }

        setCookie("role", role);
        if (ativo) {
          setToken(response.accessToken);
          setUser(refreshedUser);
        }
      } catch {
        // Refresh inválido/expirado: a sessão inteira deixa de ser confiável.
        authService.clearSession();
        if (ativo) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (ativo) setIsLoading(false);
      }
    }

    void restaurarSessao();
    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.login(credentials);
        const newToken = res.accessToken;
        setToken(newToken);

        const decoded = parseJwt(newToken);
        const loggedUser = res.usuario;
        setUser(loggedUser ?? decoded);

        // The API response is authoritative; JWT is only a compatibility fallback.
        const roleRaw = loggedUser?.tipoUsuario || decoded?.role || decoded?.tipoUsuario;
        const role = String(roleRaw).toUpperCase();

        if (!role || role === "UNDEFINED") {
          throw new Error("O login não retornou o tipo de usuário.");
        }

        setCookie("role", role);

        // Redirect based on role
        if (role === "COORDENADOR") {
          router.push("/coordenador/home");
        } else if (role === "ADMIN" || role === "ADMINISTRADOR") {
          router.push("/adminstrador/home");
        } else {
          throw new Error("Tipo de usuário não autorizado.");
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
