import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelecaoQuadro } from "./selecao-quadro";
import { authService } from "@/services/auth.service";
import { turmasService } from "@/services/turmas.service";
import { periodoAtividadeQuadroService } from "@/services/periodo-atividade-quadro.service";
import { quadroHorariosService } from "@/services/quadro-horarios.service";

vi.mock("@/services/auth.service", () => ({ authService: { getUser: vi.fn() } }));
vi.mock("@/services/turmas.service", () => ({ turmasService: { listar: vi.fn() } }));
vi.mock("@/services/periodo-atividade-quadro.service", () => ({ periodoAtividadeQuadroService: { listar: vi.fn() } }));
vi.mock("@/services/quadro-horarios.service", () => ({ quadroHorariosService: { listar: vi.fn(), criar: vi.fn() } }));
vi.mock("./integracao", () => ({ erroAlocacao: (e: unknown) => e instanceof Error ? e.message.replace(/^ALOCACAO:/, "") : "Falha" }));

const curso = { id: 5, nome: "ADS", periodicidade: "Anual" };
const turma = { id: 10, codigo: "2/2026", ano: 2026, periodo: 2, status: "ATIVO", curso };
const periodo = { id: 20, periodo: 1, ano: 2026, status: "ATIVO" };
const quadro = { id: 40, curso, turma: { id: 10 }, periodoAtividadeQuadro: periodo, status: "ATIVO", versao: 1 };
const pagina = <T,>(content: T[], totalPages = 1) => ({ content, totalPages, page: 0, size: 100, totalElements: content.length });

async function selecionar() {
  await screen.findByRole("button", { name: "Turma" });
  await waitFor(() => expect(screen.getByRole("button", { name: "Turma" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Turma" }));
  fireEvent.click(screen.getByRole("button", { name: "2/2026 · 2026 · 2º ano" }));
  fireEvent.click(screen.getByRole("button", { name: "Período Atividade Quadro" }));
  fireEvent.click(screen.getByRole("button", { name: "1º período de 2026" }));
  fireEvent.click(screen.getByRole("button", { name: "Abrir ou criar quadro" }));
}

describe("seleção do quadro pelo coordenador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getUser).mockReturnValue({ tipoUsuario: "COORDENADOR", curso });
    vi.mocked(turmasService.listar).mockResolvedValue(pagina([turma]) as never);
    vi.mocked(periodoAtividadeQuadroService.listar).mockResolvedValue(pagina([periodo]) as never);
    vi.mocked(quadroHorariosService.listar).mockResolvedValue(pagina([]) as never);
    vi.mocked(quadroHorariosService.criar).mockResolvedValue(quadro as never);
  });
  it("filtra turmas pelo curso da sessão e percorre páginas", async () => {
    vi.mocked(turmasService.listar).mockResolvedValueOnce(pagina([], 2) as never).mockResolvedValueOnce(pagina([turma, { ...turma, id: 11, curso: { ...curso, id: 9 }, codigo: "outro" }], 2) as never);
    render(<SelecaoQuadro aoSelecionar={vi.fn()} />);
    await waitFor(() => expect(turmasService.listar).toHaveBeenCalledTimes(2));
    expect(turmasService.listar).toHaveBeenCalledWith({ curso: 5, status: "ATIVO", page: 0, size: 100 });
    fireEvent.click(screen.getByRole("button", { name: "Turma" }));
    expect(screen.getByText(/2\/2026/)).toBeInTheDocument();
    expect(screen.queryByText(/outro/)).not.toBeInTheDocument();
  });
  it("cria o primeiro quadro quando não há histórico", async () => {
    const abrir = vi.fn(); render(<SelecaoQuadro aoSelecionar={abrir} />);
    await selecionar();
    await waitFor(() => expect(abrir).toHaveBeenCalledWith(40));
    expect(quadroHorariosService.criar).toHaveBeenCalledWith({ versao: 1, status: "ATIVO", curso: { id: 5 }, turma: { id: 10 }, periodoAtividadeQuadro: { id: 20 } });
  });
  it("abre o quadro ativo sem criar outro", async () => {
    vi.mocked(quadroHorariosService.listar).mockResolvedValue(pagina([quadro]) as never);
    const abrir = vi.fn(); render(<SelecaoQuadro aoSelecionar={abrir} />); await selecionar();
    await waitFor(() => expect(abrir).toHaveBeenCalledWith(40));
    expect(quadroHorariosService.criar).not.toHaveBeenCalled();
    expect(quadroHorariosService.listar).toHaveBeenCalledWith({ curso: 5, turma: 10, periodo_atividade_quadro: 20, page: 0, size: 100 });
  });
  it("preserva histórico inativo e informa a ausência de quadro ativo", async () => {
    vi.mocked(quadroHorariosService.listar).mockResolvedValue(pagina([{ ...quadro, status: "INATIVO" }]) as never);
    render(<SelecaoQuadro aoSelecionar={vi.fn()} />); await selecionar();
    expect(await screen.findByRole("alert")).toHaveTextContent("histórico inativo");
    expect(quadroHorariosService.criar).not.toHaveBeenCalled();
  });
  it("exibe erro de autorização sem criar quadro", async () => {
    vi.mocked(quadroHorariosService.listar).mockRejectedValue(new Error("Você não tem permissão"));
    render(<SelecaoQuadro aoSelecionar={vi.fn()} />); await selecionar();
    expect(await screen.findByRole("alert")).toHaveTextContent("Você não tem permissão");
    expect(quadroHorariosService.criar).not.toHaveBeenCalled();
  });
  it("impede a jornada quando a sessão não tem curso", async () => {
    vi.mocked(authService.getUser).mockReturnValue({ tipoUsuario: "COORDENADOR" });
    render(<SelecaoQuadro aoSelecionar={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("identificar o curso");
    expect(turmasService.listar).not.toHaveBeenCalled();
  });
});
