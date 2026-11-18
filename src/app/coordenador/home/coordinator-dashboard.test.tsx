import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { alocacoesService } from "@/services/alocacoes.service";
import { periodoAtividadeQuadroService } from "@/services/periodo-atividade-quadro.service";
import { turmasService } from "@/services/turmas.service";
import { CoordinatorDashboard } from "./coordinator-dashboard";

vi.mock("@/services/alocacoes.service", () => ({
  alocacoesService: { listar: vi.fn() },
}));

vi.mock("@/services/periodo-atividade-quadro.service", () => ({
  periodoAtividadeQuadroService: { listar: vi.fn() },
}));

vi.mock("@/services/turmas.service", () => ({
  turmasService: { listar: vi.fn() },
}));
vi.mock("@/services/auth.service", () => ({
  authService: { getUser: vi.fn(() => ({ curso: { id: 7 } })) },
}));

function resposta(totalElements: number) {
  return {
    content: [],
    page: 0,
    size: 1,
    totalElements,
    totalPages: totalElements === 0 ? 0 : 1,
  };
}

const alocacoesApi = vi.mocked(alocacoesService);
const periodosApi = vi.mocked(periodoAtividadeQuadroService);
const turmasApi = vi.mocked(turmasService);

describe("CoordinatorDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alocacoesApi.listar.mockImplementation(async (params) =>
      resposta(params?.turma === 101 ? 8 : 5),
    );
    periodosApi.listar.mockResolvedValue(resposta(7));
    turmasApi.listar.mockImplementation(async (params) => ({
      ...resposta(24),
      content: params?.size === 100 ? ([{ id: 101 }, { id: 102 }] as never[]) : [],
    }));
  });

  it("carrega períodos institucionais e totais de turmas e alocações do curso do usuário", async () => {
    render(<CoordinatorDashboard />);

    expect(await screen.findByText("13")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(turmasApi.listar).toHaveBeenCalledWith({ curso: 7, page: 0, size: 1 });
    expect(turmasApi.listar).toHaveBeenCalledWith({ curso: 7, page: 0, size: 100 });
    expect(alocacoesApi.listar).toHaveBeenCalledWith({ turma: 101, page: 0, size: 1 });
    expect(alocacoesApi.listar).toHaveBeenCalledWith({ turma: 102, page: 0, size: 1 });
    expect(periodosApi.listar).toHaveBeenCalledWith({ page: 0, size: 1 });
  });

  it("exibe zero quando uma listagem não tem registros", async () => {
    turmasApi.listar.mockResolvedValue(resposta(0));

    render(<CoordinatorDashboard />);

    const totalTurmas = screen.getByRole("heading", {
      name: "Turmas cadastradas",
    }).parentElement?.querySelector("div[aria-live='polite']");

    await waitFor(() => expect(totalTurmas).toHaveTextContent("0"));
  });

  it("mostra erro e permite tentar novamente um indicador que falhou", async () => {
    let primeiraFalha = true;
    alocacoesApi.listar.mockImplementation(async (params) => {
      if (primeiraFalha) {
        primeiraFalha = false;
        throw new Error("Falha na API");
      }
      return resposta(params?.turma === 101 ? 9 : 9);
    });

    render(<CoordinatorDashboard />);

    const tentarNovamente = await screen.findByRole("button", {
      name: "Tentar novamente",
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar este total.",
    );

    fireEvent.click(tentarNovamente);

    await waitFor(() => expect(alocacoesApi.listar).toHaveBeenCalledTimes(4));
    expect(await screen.findByText("18")).toBeInTheDocument();
  });

  it("mantém os acessos rápidos apontando para as telas dos coordenadores", () => {
    render(<CoordinatorDashboard />);

    expect(screen.getByRole("link", { name: /Turmas/ })).toHaveAttribute(
      "href",
      "/coordenador/estrutura-academica/turmas",
    );
    expect(
      screen.getByRole("link", { name: /Período Letivo/ }),
    ).toHaveAttribute("href", "/coordenador/estrutura-academica/periodo-letivo");
    expect(screen.getByRole("link", { name: /Alocação/ })).toHaveAttribute(
      "href",
      "/coordenador/grade-planejamento/alocacao",
    );
  });
});

