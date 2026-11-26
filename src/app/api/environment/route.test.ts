import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

async function ambienteRetornado(valor: string | undefined) {
  if (valor === undefined) {
    vi.stubEnv("APP_ENVIRONMENT", undefined);
  } else {
    vi.stubEnv("APP_ENVIRONMENT", valor);
  }
  const resposta = await GET();
  return { resposta, corpo: await resposta.json() };
}

describe("GET /api/environment", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(["dev", "staging", "production"])("retorna %s quando configurado", async (valor) => {
    const { resposta, corpo } = await ambienteRetornado(valor);

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({ environment: valor });
  });

  it.each([undefined, "", "prod", "STAGING", "local", " dev"])(
    "retorna null para valor ausente ou inválido (%j)",
    async (valor) => {
      const { corpo } = await ambienteRetornado(valor);

      expect(corpo).toEqual({ environment: null });
    },
  );

  it("nunca é cacheada", async () => {
    const { resposta } = await ambienteRetornado("dev");

    expect(resposta.headers.get("Cache-Control")).toBe("no-store");
  });
});
