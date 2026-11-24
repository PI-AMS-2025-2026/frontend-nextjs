import { beforeEach, describe, expect, it, vi } from "vitest";
import { carregarDados, exportarGrade, erroAlocacao, salvarGrade, validar } from "./integracao";
import type { Aula, Grade } from "./tipos";

vi.mock("@/lib/api", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/api")>(),
  api: { get: vi.fn(), getBlob: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("@/services/auth.service", () => ({ authService: { getUser: () => ({ id: 99 }) } }));
import { api, ApiError } from "@/lib/api";

describe("carregamento dos quadros por turma", () => {
  beforeEach(() => vi.clearAllMocks());
  it("consulta o motor do quadro de cada turma ativa", async () => {
    vi.mocked(api.get).mockImplementation(async (path) => {
      if (path.startsWith("/turmas/")) return { periodo: 2 } as never;
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
      if (path === "/turmas/10") return { periodo: 2 } as never;
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


describe("etapa curricular e professor escolhido", () => {
  it("carrega apenas disciplinas do curso e etapa da turma e todos os professores vinculados", async () => {
    vi.mocked(api.get).mockImplementation(async path => {
      if (path === "/quadros-horarios/40") return { id: 40, turma: { id: 10 }, curso: { id: 5, nome: "ADS" }, status: "ATIVO", versao: 1, dataCriacao: "2026-01-01", periodoAtividadeQuadro: { periodo: 1, ano: 2026 } } as never;
      if (path === "/turmas/10") return { periodo: 2 } as never;
      if (path === "/motor-quadro/quadros/40") return { blocos: [], turmas: [{ id: 10, codigo: "A" }] } as never;
      if (path === "/disciplinas") return [{ id: 1, nome: "Banco", curso: { id: 5 }, periodo: 2 }, { id: 2, nome: "Redes", curso: { id: 5 }, periodo: 1 }, { id: 3, nome: "Outro", curso: { id: 6 }, periodo: 2 }] as never;
      if (path === "/professores") return [{ id: 11, nome: "Ana", status: "ATIVO" }, { id: 12, nome: "Bia", status: "ATIVO" }] as never;
      if (path === "/professores-disciplinas") return [{ disciplinaId: 1, professorId: 11 }, { disciplinaId: 1, professorId: 12 }] as never;
      return [] as never;
    });
    const resultado = await carregarDados(40);
    expect(resultado.grades[0].disciplinaIds).toEqual(["1"]);
    expect(resultado.disciplinas[0].professores).toEqual([{ id: 11, nome: "Ana" }, { id: 12, nome: "Bia" }]);
    expect(resultado.disciplinas[1].professores).toEqual([]);
  });
  it("preserva o motivo da indisponibilidade se a consulta de sugestões falhar", async () => {
    vi.mocked(api.post).mockReset().mockResolvedValueOnce({ valido: false, mensagem: "Professor indisponível" } as never).mockRejectedValueOnce(new Error("Falha de sugestões"));
    const grade: Grade = { id: "g", quadroId: 40, turmaId: 10, versao: 1, dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", horarios: [], blocos: [{ id: 3, inicio: "07:00", fim: "08:00" }], intervalos: [], disciplinaIds: [], salaIds: [], aulas: [] };
    const resultado = await validar(grade, { id: "1", disciplina: "Banco", professor: "Ana", professorId: 11, sala: "" }, "8", "segunda", { inicio: "07:00", fim: "08:00" });
    expect(resultado).toEqual({ valido: false, mensagem: "Professor indisponível", sugestoes: [] });
  });
  it("envia o professor escolhido no rascunho ao salvar", async () => {
    const grade: Grade = { id: "40:10", quadroId: 40, turmaId: 10, versao: 1, dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", horarios: [{ inicio: "07:00", fim: "08:00" }], blocos: [{ id: 3, inicio: "07:00", fim: "08:00" }], intervalos: [], disciplinaIds: ["1"], salaIds: ["8"], aulas: [] };
    vi.mocked(api.put).mockResolvedValueOnce(undefined);
    await salvarGrade(grade, [{ id: "nova", disciplinaId: "1", salaId: "8", dia: "segunda", inicio: "07:00", fim: "08:00", disciplina: "Banco", professor: "Bia", professorId: 12, sala: "A" }], [{ id: "1", disciplina: "Banco", professor: "Selecione", sala: "" }]);
    expect(api.put).toHaveBeenCalledWith("/alocacoes/sincronizar-grade", {
      removidas: [], atualizadas: [],
      novas: [expect.objectContaining({ professor: { id: 12 }, usuarioAlteracao: { id: 99 } })],
    });
  });
});

describe("feedback ao salvar alocações", () => {
  const horario = { inicio: "07:00", fim: "08:00" };
  const grade: Grade = { id: "40:10", quadroId: 40, turmaId: 10, versao: 1, dataCriacao: "2026-01-01",
    curso: "ADS", periodoLetivo: "2026", horarios: [horario], blocos: [{ id: 3, ...horario }],
    intervalos: [], disciplinaIds: ["1", "2"], salaIds: ["8", "9"], aulas: [] };
  const primeira: Aula = { ...horario, id: "nova-1", disciplinaId: "1", salaId: "8", dia: "segunda",
    disciplina: "Banco", professor: "Bia", professorId: 12, sala: "A-101" };
  const segunda: Aula = { ...primeira, id: "nova-2", disciplinaId: "2", salaId: "9", dia: "quarta",
    disciplina: "Redes", sala: "B-204" };
  const disciplinas = [primeira, segunda].map(aula => ({
    id: aula.disciplinaId, disciplina: aula.disciplina, professor: "Selecione", sala: "",
  }));

  beforeEach(() => vi.clearAllMocks());

  it("identifica a sala e a aula apontadas pelo índice do lote", async () => {
    const message = "A sala informada é incompatível com o tipo de sala exigido pela disciplina.";
    vi.mocked(api.put).mockRejectedValueOnce(new ApiError(message, 409, { message, alocacaoIndice: 1 }));
    const resultado = salvarGrade(grade, [primeira, segunda], disciplinas);
    await expect(resultado).rejects.toThrow(/Redes · Quarta 07:00–08:00 · Sala: B-204.*incompatível/);
    await expect(resultado).rejects.not.toThrow(/A-101/);
  });

  it("reaproveita os detalhes de campo da API na atualização", async () => {
    const aula = { ...primeira, id: "10" };
    vi.mocked(api.put).mockRejectedValueOnce(new ApiError("Erro de validação", 422, {
      fieldErrors: [{ field: "professor.id", message: "ID deve ser positivo" }],
    }));
    await expect(salvarGrade({ ...grade, aulas: [aula] }, [{ ...aula, professorId: 99 }], disciplinas))
      .rejects.toThrow(/Ao salvar \(Banco.*Professor: ID deve ser positivo/);
  });

  it("mostra mensagem útil sem atribuir uma falha sem detalhes à aula errada", async () => {
    vi.mocked(api.put).mockRejectedValueOnce(new ApiError("Erro na API (503)", 503));
    await expect(salvarGrade(grade, [primeira, segunda], disciplinas))
      .rejects.toThrow(/Ao salvar \(2 aulas\): Não foi possível concluir a operação. Tente novamente/);
  });

  it("reconhece em uma nova tentativa a aula já persistida quando a confirmação falhou", async () => {
    await salvarGrade({ ...grade, aulas: [{ ...primeira, id: "10" }] }, [primeira], disciplinas, true);
    expect(api.delete).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
});
