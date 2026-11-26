import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EnvironmentBanner } from "./environment-banner";

function mockFetch(implementacao: (...args: unknown[]) => Promise<unknown>) {
  const fetchMock = vi.fn(implementacao);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function respostaJson(corpo: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(corpo) });
}

describe("faixa de ambiente", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("consulta a rota de mesma origem", async () => {
    const fetchMock = mockFetch(() => respostaJson({ environment: null }));

    render(<EnvironmentBanner />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/environment", expect.anything()),
    );
  });

  it.each([
    ["dev", "Ambiente de desenvolvimento"],
    ["staging", "Ambiente de homologação"],
  ])("exibe a faixa para %s", async (environment, texto) => {
    mockFetch(() => respostaJson({ environment }));

    render(<EnvironmentBanner />);

    const faixa = await screen.findByRole("status");
    expect(faixa).toHaveTextContent(texto);
    expect(faixa).toHaveClass("uppercase");
  });

  it.each([
    ["production", () => respostaJson({ environment: "production" })],
    ["null", () => respostaJson({ environment: null })],
    ["valor inesperado", () => respostaJson({ environment: "qa" })],
    ["corpo inesperado", () => respostaJson("dev")],
    ["resposta HTTP de erro", () => respostaJson({ environment: "dev" }, false)],
    ["erro de rede", () => Promise.reject(new TypeError("Failed to fetch"))],
  ])("não renderiza nada para %s", async (_caso, implementacao) => {
    const fetchMock = mockFetch(implementacao);

    const { container } = render(<EnvironmentBanner />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    // Dá tempo para as promessas encadeadas resolverem.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
