import { api } from "@/lib/api";
import type { LoginRequest, LoginResponse, UsuarioRequest } from "@/types/api";

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login", data, false);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.token);
    }
    return response;
  },

  registrar(data: UsuarioRequest) {
    return api.post<void>("/auth/registrar", data, false);
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
};
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

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },

  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  },
};

