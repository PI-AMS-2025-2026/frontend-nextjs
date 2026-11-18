import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TelaAlocacao } from "./alocacao";
import type { Discipline, Grade } from "./tipos";
vi.mock("./integracao", () => ({ carregarDados: vi.fn(), erroAlocacao: vi.fn(), exportarGrade: vi.fn(), interpretarSugestao: vi.fn(), salvarGrade: vi.fn(), validar: vi.fn() }));
import { validar } from "./integracao";
const grade: Grade = { id: "g", quadroId: 40, turmaId: 10, cursoId: 5, turma: "A", versao: 1, dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", blocos: [{ id: 3, inicio: "07:00", fim: "08:00" }], horarios: [{ inicio: "07:00", fim: "08:00" }], intervalos: [], disciplinaIds: ["1"], salaIds: ["8"], aulas: [] };
const disciplina: Discipline = { id: "1", disciplina: "Banco", professor: "Selecione", sala: "", professores: [{ id: 11, nome: "Ana" }, { id: 12, nome: "Bia" }] };
function abrir(d: Discipline) {
  const salvar = vi.fn().mockResolvedValue([]);
  render(<TelaAlocacao grades={[grade]} gradeInicialId="g" disciplinas={[d]} salas={[{ id: "8", nome: "Sala A", capacidade: 30, recursos: [] }]} salvarAlocacao={salvar} />);
  fireEvent.click(screen.getByRole("button", { name: "Editar" }));
  fireEvent.click(screen.getByRole("button", { name: "Alocar por seleção" }));
  fireEvent.click(screen.getByRole("button", { name: "Selecione uma disciplina" }));
  fireEvent.click(screen.getByRole("button", { name: "Banco" }));
  fireEvent.click(screen.getByRole("button", { name: "Selecione o bloco" }));
  fireEvent.click(screen.getByRole("button", { name: "07:00 - 08:00" }));
  fireEvent.click(screen.getByRole("button", { name: "Alocar" }));
  return salvar;
}
function escolherSala() { fireEvent.click(screen.getByRole("button", { name: "Selecione uma sala" })); fireEvent.click(screen.getByRole("button", { name: "Sala A" })); }
function escolherProfessor(nome: string) { fireEvent.click(screen.getByRole("button", { name: "Professor" })); fireEvent.click(screen.getByRole("button", { name: nome })); }
describe("professor na alocação", () => {
  beforeEach(() => vi.clearAllMocks());
  it("informa ausência de vínculo e impede confirmação", () => {
    abrir({ ...disciplina, professores: [] });
    expect(screen.getByText(/não possui professor ativo vinculado/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  });
  it("exige escolha explícita mesmo quando há apenas um professor", async () => {
    vi.mocked(validar).mockResolvedValue({ valido: true, mensagem: "OK", sugestoes: [] });
    abrir({ ...disciplina, professores: [{ id: 11, nome: "Ana" }] });
    escolherSala();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(screen.getByText("Selecione um professor vinculado à disciplina.")).toBeInTheDocument();
    expect(validar).not.toHaveBeenCalled();
    escolherProfessor("Ana");
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(validar).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ professorId: 11 }), "8", "segunda", expect.anything(), undefined));
  });
  it("permite escolher outro professor quando o primeiro está indisponível", async () => {
    vi.mocked(validar).mockResolvedValueOnce({ valido: false, mensagem: "Professor indisponível", sugestoes: [] }).mockResolvedValueOnce({ valido: true, mensagem: "OK", sugestoes: [] });
    const salvar = abrir(disciplina);
    escolherSala(); escolherProfessor("Ana"); fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Professor indisponível");
    escolherProfessor("Bia"); fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(validar).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ professorId: 12 }), "8", "segunda", expect.anything(), undefined));
    await waitFor(() => expect(screen.queryByText("Escolha a sala")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledWith("g", [expect.objectContaining({ professorId: 12, professor: "Bia" })]));
  });
});
