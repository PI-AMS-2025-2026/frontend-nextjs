import { api } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  UsuarioRequest,
} from "@/types/api";

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login", data, false);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      localStorage.setItem("usuario", JSON.stringify(response.usuario));
    }
    return response;
  },

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("Nenhum refresh token disponível");
    }

    const response = await api.post<LoginResponse>(
      "/auth/refresh",
      { refreshToken } satisfies RefreshTokenRequest,
      false,
    );

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      if (response.usuario) {
        localStorage.setItem("usuario", JSON.stringify(response.usuario));
      }
    }
    return response;
  },

  registrar(data: UsuarioRequest) {
    return api.post<void>("/auth/registrar", data, false);
  },

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await api.post<void>(
          "/auth/logout",
          { refreshToken } satisfies RefreshTokenRequest,
          false,
        );
      } catch (err) {
        console.error("Erro ao encerrar sessão no backend:", err);
      }
    }

    this.clearSession();
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },

  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  },

  getUser() {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("usuario");
      return null;
    }
  },
};

