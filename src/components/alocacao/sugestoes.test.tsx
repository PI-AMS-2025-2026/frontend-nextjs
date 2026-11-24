import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TelaAlocacao } from "./alocacao";
import { validar } from "./integracao";
import { DISCIPLINE_DND_MIME } from "./drag-and-drop";
import type { Aula, DiaSemana, Grade } from "./tipos";

vi.mock("./integracao", async (importOriginal) => ({
  ...await importOriginal<typeof import("./integracao")>(),
  validar: vi.fn(),
}));

const horario = { inicio: "07:00", fim: "08:00" };
const bloco = { id: 3, ...horario };
const grade: Grade = {
  id: "g", quadroId: 40, turmaId: 10, versao: 1, dataCriacao: "2026-01-01",
  curso: "ADS", periodoLetivo: "2026", blocos: [bloco], horarios: [horario],
  intervalos: [], disciplinaIds: ["1"], salaIds: ["8"], aulas: [],
};
const disciplinas = [{
  id: "1", disciplina: "Banco", professor: "Ana", sala: "",
  professores: [{ id: 11, nome: "Ana" }],
}];
const salas = [{ id: "8", nome: "Sala A", capacidade: 30, recursos: [] }];
const valido = { valido: true, mensagem: "OK", sugestoes: [] };
const motivo = "Professor indisponível no horário.";

function aula(id: string, dia: DiaSemana): Aula {
  return {
    id, dia, inicio: bloco.inicio, fim: bloco.fim, disciplinaId: "1",
    disciplina: "Banco", salaId: "8", sala: "Sala A", professorId: 11, professor: "Ana",
  };
}

function rejeicao(...dias: string[]) {
  return {
    valido: false, mensagem: motivo,
    sugestoes: dias.map(diaSemana => ({ diaSemana, sala: { id: 8 }, blocoHorario: { id: bloco.id } })),
  };
}

function abrir(aulas: Aula[] = []) {
  const salvar = vi.fn().mockResolvedValue([]);
  const tela = (atuais: Aula[]) => <TelaAlocacao grades={[{ ...grade, aulas: atuais }]}
    gradeInicialId="g" disciplinas={disciplinas} salas={salas} salvarAlocacao={salvar} />;
  const view = render(tela(aulas));
  fireEvent.click(screen.getByRole("button", { name: "Editar" }));
  return { salvar, atualizarGrade: (atuais: Aula[]) => view.rerender(tela(atuais)) };
}

function arrastar(coluna: number, aulaId?: string) {
  const linha = within(screen.getByRole("table")).getAllByRole("row")[1];
  const celula = within(linha).getAllByRole("cell")[coluna + 1];
  fireEvent.drop(celula, {
    dataTransfer: { getData: (tipo: string) => tipo === DISCIPLINE_DND_MIME ? JSON.stringify({ id: "1", aulaId }) : "" },
  });
}

function confirmarNovaAula() {
  fireEvent.click(screen.getByRole("button", { name: "Selecione uma sala" }));
  fireEvent.click(screen.getByRole("button", { name: "Sala A" }));
  fireEvent.click(screen.getByRole("button", { name: "Professor" }));
  fireEvent.click(screen.getByRole("button", { name: "Ana" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
}

describe("sugestões na edição da grade", () => {
  beforeEach(() => vi.mocked(validar).mockReset().mockResolvedValue(valido));

  it("filtra horários salvos, novos e movidos e considera as células liberadas no rascunho", async () => {
    const { salvar } = abrir([aula("21", "terca"), aula("22", "quinta"), aula("23", "sabado")]);
    arrastar(2);
    confirmarNovaAula();
    await waitFor(() => expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument());
    arrastar(4, "22");
    await waitFor(() => expect(screen.getByText(/Banco movida para Sexta/)).toBeInTheDocument());

    const sabado = within(screen.getByRole("table")).getAllByRole("cell")[6];
    fireEvent.click(within(sabado).getByRole("button", { name: "Ver detalhes de Banco" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    vi.mocked(validar).mockResolvedValueOnce(rejeicao("TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"));
    arrastar(0);
    confirmarNovaAula();
    const alternativa = await screen.findByRole("button", { name: "Quinta 07:00 - Sala A" });
    expect(screen.getByRole("button", { name: "Sábado 07:00 - Sala A" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^(Terça|Quarta|Sexta) 07:00/ })).not.toBeInTheDocument();

    fireEvent.click(alternativa);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(validar).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), "8", "quinta", horario, undefined));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledWith("g", expect.arrayContaining([
      expect.objectContaining({ id: "21", dia: "terca" }),
      expect.objectContaining({ dia: "quarta" }),
      expect.objectContaining({ id: "22", dia: "sexta" }),
      expect.objectContaining({ dia: "quinta" }),
    ])));
  });

  it("preserva o motivo de um movimento rejeitado quando todas as sugestões estão ocupadas", async () => {
    abrir([aula("21", "terca"), aula("22", "quinta")]);
    vi.mocked(validar).mockResolvedValueOnce(rejeicao("TERÇA", "QUINTA"));
    arrastar(0, "22");

    expect(await screen.findByRole("alert")).toHaveTextContent(motivo);
    expect(screen.getByText("Nenhuma sugestão disponível para esta alocação.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^(Terça|Quinta) 07:00/ })).not.toBeInTheDocument();
    expect(validar).toHaveBeenCalledWith(expect.anything(), expect.anything(), "8", "segunda", horario, "22");
  });

  it("revalida a sugestão para uma aula existente e preserva o ID da alocação movida", async () => {
    const { salvar } = abrir([aula("22", "quinta")]);
    vi.mocked(validar).mockResolvedValueOnce(rejeicao("QUINTA", "SEXTA"));
    arrastar(0, "22");

    const alternativa = await screen.findByRole("button", { name: "Sexta 07:00 - Sala A" });
    expect(screen.queryByRole("button", { name: "Quinta 07:00 - Sala A" })).not.toBeInTheDocument();
    fireEvent.click(alternativa);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(validar).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), "8", "sexta", horario, "22"));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledWith("g", [aula("22", "sexta")]));
  });

  it("retira a alternativa da lista se o horário passa a estar ocupado", async () => {
    const { atualizarGrade } = abrir();
    vi.mocked(validar).mockResolvedValueOnce(rejeicao("TERÇA"));
    arrastar(0);
    confirmarNovaAula();
    const alternativa = await screen.findByRole("button", { name: "Terça 07:00 - Sala A" });

    atualizarGrade([aula("21", "terca")]);
    expect(alternativa).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(motivo);
    expect(screen.getByText("Nenhuma sugestão disponível para esta alocação.")).toBeInTheDocument();
  });

  it("não sobrescreve uma aula que chega à célula enquanto a sugestão é revalidada", async () => {
    const { atualizarGrade, salvar } = abrir();
    vi.mocked(validar).mockResolvedValueOnce(rejeicao("TERÇA"));
    arrastar(0);
    confirmarNovaAula();
    fireEvent.click(await screen.findByRole("button", { name: "Terça 07:00 - Sala A" }));
    let resolver!: (valor: typeof valido) => void;
    vi.mocked(validar).mockImplementationOnce(() => new Promise(resolve => { resolver = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    atualizarGrade([aula("21", "terca")]);
    await act(async () => resolver(valido));
    expect(screen.getByRole("alert")).toHaveTextContent("Já tem uma disciplina alocada nesse local");
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao quadro horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledWith("g", [aula("21", "terca")]));
  });
});
