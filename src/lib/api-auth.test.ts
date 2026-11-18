import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./api";
import { clearSession, storeSession } from "@/services/auth-session";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function loginResponse(accessToken = "access-antigo", refreshToken = "refresh-antigo") {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    usuario: {
      id: 8,
      nome: "Tadeu",
      tipo_usuario: "COORDENADOR",
      curso: { id: 7, nome: "ADS" },
    },
  };
}

describe("renovação de sessão nas requisições autenticadas", () => {
  beforeEach(() => {
    storeSession({
      accessToken: "access-antigo",
      refreshToken: "refresh-antigo",
      usuario: { id: 8, nome: "Tadeu", tipoUsuario: "COORDENADOR", curso: { id: 7, nome: "ADS" } },
    } as never);
    document.cookie = "role=COORDENADOR; path=/";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearSession();
  });

  it("usa o access token salvo no cabeçalho de cada chamada autenticada", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await api.get("/turmas");

    expect(new Headers(fetchMock.mock.calls[0][1].headers).get("Authorization"))
      .toBe("Bearer access-antigo");
  });

  it("renova com o refresh token, salva o novo par e repete a chamada uma vez", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: "Token expirado" }, 401))
      .mockResolvedValueOnce(jsonResponse(loginResponse("access-novo", "refresh-novo")))
      .mockResolvedValueOnce(jsonResponse({ content: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await api.get<{ content: unknown[] }>("/turmas");

    expect(resultado).toEqual({ content: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get("Authorization"))
      .toBe("Bearer access-antigo");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ refresh_token: "refresh-antigo" });
    expect(new Headers(fetchMock.mock.calls[2][1].headers).get("Authorization"))
      .toBe("Bearer access-novo");
    expect(localStorage.getItem("access_token")).toBe("access-novo");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-novo");
    expect(JSON.parse(localStorage.getItem("usuario") ?? "{}").curso.nome).toBe("ADS");
  });

  it("compartilha uma única renovação entre chamadas que recebem 401 ao mesmo tempo", async () => {
    let concluirRefresh!: (response: Response) => void;
    const refreshResponse = new Promise<Response>((resolve) => { concluirRefresh = resolve; });
    let chamadasRefresh = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        chamadasRefresh += 1;
        return refreshResponse;
      }
      const authorization = new Headers(init?.headers).get("Authorization");
      return Promise.resolve(authorization === "Bearer access-antigo"
        ? jsonResponse({ message: "Token expirado" }, 401)
        : jsonResponse({ ok: true }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const requisicoes = Promise.all([api.get("/turmas"), api.get("/cursos")]);
    await vi.waitFor(() => expect(chamadasRefresh).toBe(1));
    concluirRefresh(jsonResponse(loginResponse("access-novo", "refresh-novo")));

    await expect(requisicoes).resolves.toHaveLength(2);
    expect(chamadasRefresh).toBe(1);
  });

  it("faz logout quando o refresh token é rejeitado e dispara o redirecionamento", async () => {
    const expirou = vi.fn();
    window.addEventListener("auth:session-expired", expirou);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: "Token expirado" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "Refresh token inválido" }, 401))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.get("/turmas")).rejects.toMatchObject({ status: 401 } satisfies Partial<ApiError>);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toContain("/auth/logout");
    expect(fetchMock.mock.calls[2][1].body).toContain("refresh-antigo");
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(localStorage.getItem("usuario")).toBeNull();
    expect(document.cookie).not.toContain("role=COORDENADOR");
    expect(expirou).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:session-expired", expirou);
  });

  it("não renova em 403 nem encerra sessão por falha transitória do refresh", async () => {
    const semPermissao = vi.fn().mockResolvedValue(jsonResponse({ message: "Sem acesso" }, 403));
    vi.stubGlobal("fetch", semPermissao);
    await expect(api.get("/usuarios")).rejects.toMatchObject({ status: 403 });
    expect(semPermissao).toHaveBeenCalledTimes(1);

    const indisponivel = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: "Token expirado" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "Manutenção" }, 503));
    vi.stubGlobal("fetch", indisponivel);
    await expect(api.get("/turmas")).rejects.toMatchObject({ status: 503 });
    expect(localStorage.getItem("access_token")).toBe("access-antigo");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-antigo");
  });
});
