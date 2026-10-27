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
