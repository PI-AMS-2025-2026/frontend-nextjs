import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { authService } from "./auth.service";

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }));

describe("autenticação da sessão", () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("salva access token, refresh token e usuário retornados no login", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      usuario: { id: 1, nome: "Carlos", tipoUsuario: "ADMINISTRADOR" },
    } as never);

    await authService.login({ email: "carlos@example.com", senha: "senha" });

    expect(api.post).toHaveBeenCalledWith(
      "/auth/login",
      { email: "carlos@example.com", senha: "senha" },
      false,
    );
    expect(localStorage.getItem("access_token")).toBe("access-123");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-456");
    expect(JSON.parse(localStorage.getItem("usuario") ?? "{}").nome).toBe("Carlos");
  });
});
