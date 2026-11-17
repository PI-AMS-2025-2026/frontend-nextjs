import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./api";

describe("download autenticado da API", () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
  it("envia o token e retorna o PDF binário", async () => {
    localStorage.setItem("access_token", "token-teste");
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Blob(["%PDF"], { type: "application/pdf" }), { status: 200, headers: { "Content-Type": "application/pdf" } }));
    vi.stubGlobal("fetch", fetchMock);
    const resultado = await api.getBlob("/motor-quadro/quadros/42/exportar/pdf");
    expect(resultado.type).toBe("application/pdf");
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get("Authorization")).toBe("Bearer token-teste");
    expect(fetchMock.mock.calls[0][0]).toContain("/motor-quadro/quadros/42/exportar/pdf");
  });
  it("preserva erro de autorização sem gerar download", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Sem acesso" }), { status: 403, headers: { "Content-Type": "application/json" } })));
    await expect(api.getBlob("/motor-quadro/quadros/42/exportar/pdf")).rejects.toMatchObject({ status: 403, message: "Sem acesso" } satisfies Partial<ApiError>);
  });
  it("converte os detalhes de validação recebidos da API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: "Erro de validação", field_errors: [{ field: "tipoUsuario", message: "Tipo obrigatório" }],
    }), { status: 422, headers: { "Content-Type": "application/json" } })));
    await expect(api.post("/usuarios", {})).rejects.toMatchObject({
      status: 422, data: { fieldErrors: [{ field: "tipoUsuario", message: "Tipo obrigatório" }] },
    });
  });
});
