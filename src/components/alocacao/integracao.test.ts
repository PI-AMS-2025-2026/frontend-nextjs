import { beforeEach, describe, expect, it, vi } from "vitest";
import { carregarDados, exportarGrade, erroAlocacao } from "./integracao";
import type { Grade } from "./tipos";

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), getBlob: vi.fn() }, ApiError: class extends Error {} }));
vi.mock("@/services/auth.service", () => ({ authService: {} }));
import { api } from "@/lib/api";

describe("carregamento dos quadros por turma", () => {
  beforeEach(() => vi.clearAllMocks());
  it("consulta o motor do quadro de cada turma ativa", async () => {
    vi.mocked(api.get).mockImplementation(async (path) => {
      if (path === "/quadros-horarios") return [
        { id: 1, turma: { id: 10 }, curso: { id: 5, nome: "ADS" }, status: "ATIVO", versao: 1, dataCriacao: "2026-01-01", periodoAtividadeQuadro: { periodo: 1, ano: 2026 } },
        { id: 2, turma: { id: 11 }, curso: { id: 5, nome: "ADS" }, status: "ATIVO", versao: 2, dataCriacao: "2026-01-01", periodoAtividadeQuadro: { periodo: 1, ano: 2026 } },
      ] as never;
      if (path === "/motor-quadro/quadros/1") return { quadroHorario: { id: 1 }, blocos: [], turmas: [{ id: 10, codigo: "A" }] } as never;
      if (path === "/motor-quadro/quadros/2") return { quadroHorario: { id: 2 }, blocos: [], turmas: [{ id: 11, codigo: "B" }] } as never;
      return [] as never;
    });
    const resultado = await carregarDados();
    expect(resultado.grades.map(g => [g.quadroId, g.turmaId])).toEqual([[1, 10], [2, 11]]);
    expect(api.get).toHaveBeenCalledWith("/motor-quadro/quadros/1");
    expect(api.get).toHaveBeenCalledWith("/motor-quadro/quadros/2");
  });
  it("abre diretamente o quadro selecionado mesmo sem alocações", async () => {
    vi.mocked(api.get).mockImplementation(async (path) => {
      if (path === "/quadros-horarios/40") return { id: 40, turma: { id: 10 }, curso: { id: 5, nome: "ADS" }, status: "ATIVO", versao: 1, dataCriacao: "2026-01-01", periodoAtividadeQuadro: { periodo: 1, ano: 2026 } } as never;
      if (path === "/motor-quadro/quadros/40") return { quadroHorario: { id: 40 }, blocos: [{ id: 3, horaInicio: "07:00:00", horaFim: "08:00:00" }], turmas: [{ id: 10, codigo: "2/2026" }] } as never;
      return [] as never;
    });
    const resultado = await carregarDados(40);
    expect(resultado.grades).toHaveLength(1);
    expect(resultado.grades[0]).toMatchObject({ quadroId: 40, turmaId: 10, aulas: [], horarios: [{ inicio: "07:00", fim: "08:00" }] });
    expect(api.get).not.toHaveBeenCalledWith("/quadros-horarios", expect.anything());
  });
});

describe("exportação de quadro", () => {
  const grade: Grade = { id: "42:10", quadroId: 42, cursoId: 5, turmaId: 10, versao: 2,
    dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", horarios: [], intervalos: [],
    disciplinaIds: [], salaIds: [], aulas: [] };
  it("baixa o PDF do quadro selecionado e libera a URL", async () => {
    vi.mocked(api.getBlob).mockResolvedValue(new Blob(["%PDF"], { type: "application/pdf" }));
    const criar = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:quadro");
    const liberar = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("quadro-horario-42.pdf");
      expect(this.href).toBe("blob:quadro");
    });
    await exportarGrade(grade);
    expect(api.getBlob).toHaveBeenCalledWith("/motor-quadro/quadros/42/exportar/pdf");
    expect(clicar).toHaveBeenCalledOnce();
    expect(liberar).toHaveBeenCalledWith("blob:quadro");
    criar.mockRestore(); liberar.mockRestore(); clicar.mockRestore();
  });
  it("rejeita uma resposta que não é PDF", async () => {
    vi.mocked(api.getBlob).mockResolvedValue(new Blob(["erro"], { type: "text/html" }));
    await expect(exportarGrade(grade)).rejects.toThrow("O serviço não retornou um PDF válido");
    expect(erroAlocacao(new Error("ALOCACAO:erro de exportação"))).toBe("erro de exportação");
  });
});
