import { api } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  RedefinirSenhaRequest,
  RefreshTokenRequest,
  SolicitarRecuperacaoSenhaRequest,
} from "@/types/api";
import {
  clearSession as limparSessao,
  getAccessToken,
  getRefreshToken,
  invalidatePendingRefresh,
  refreshSession,
  storeSession,
} from "@/services/auth-session";

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login", data, false);
    storeSession(response);
    return response;
  },

  solicitarRecuperacao(data: SolicitarRecuperacaoSenhaRequest) {
    return api.post<void>("/auth/solicitar-recuperacao", data, false);
  },

  redefinirSenha(data: RedefinirSenhaRequest) {
    return api.post<void>("/auth/redefinir-senha", data, false);
  },

  async refreshToken() {
    return refreshSession();
  },

  async logout() {
    const refreshToken = this.getRefreshToken();
    invalidatePendingRefresh();
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
    limparSessao();
  },

  getToken() {
    return getAccessToken();
  },

  getRefreshToken() {
    return getRefreshToken();
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

