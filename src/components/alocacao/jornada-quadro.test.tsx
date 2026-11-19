import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Alocacao from "./alocacao";
vi.mock("./selecao-quadro", () => ({ SelecaoQuadro: ({ aoSelecionar }: { aoSelecionar: (id: number) => void }) => <button onClick={() => aoSelecionar(40)}>Selecionar quadro</button> }));
vi.mock("../ui/timetable", () => ({ default: () => <div>Grade vazia</div> }));
vi.mock("../ui/discipline-list", () => ({ default: () => null }));
vi.mock("./integracao", () => ({ carregarDados: vi.fn(), erroAlocacao: vi.fn(), exportarGrade: vi.fn(), interpretarSugestao: vi.fn(), salvarGrade: vi.fn(), validar: vi.fn() }));
import { carregarDados, erroAlocacao, salvarGrade } from "./integracao";
it("abre a grade vazia do quadro selecionado e permite retornar à seleção", async () => {
  vi.mocked(carregarDados).mockResolvedValue({ grades: [{ id: "40:10", quadroId: 40, cursoId: 5, turmaId: 10, turma: "A", versao: 1, dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", blocos: [], horarios: [], intervalos: [], disciplinaIds: [], salaIds: [], aulas: [] }], disciplinas: [], salas: [] });
  render(<Alocacao />);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar quadro" }));
  expect(await screen.findByText("Grade vazia")).toBeInTheDocument();
  await waitFor(() => expect(carregarDados).toHaveBeenCalledWith(40));
  fireEvent.click(screen.getByRole("button", { name: "Voltar para a listagem de grades" }));
  expect(screen.getByRole("button", { name: "Selecionar quadro" })).toBeInTheDocument();
});

it("mantém o rascunho se a gravação falhar e o quadro não puder ser atualizado", async () => {
  const aula = { id: "10", disciplinaId: "1", salaId: "8", dia: "segunda" as const, inicio: "07:00",
    fim: "08:00", disciplina: "Banco", professor: "Ana", professorId: 11, sala: "A-101", cor: undefined };
  const dados: Awaited<ReturnType<typeof carregarDados>> = {
    grades: [{ id: "40:10", quadroId: 40, cursoId: 5, turmaId: 10, turma: "A", versao: 1,
      dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", blocos: [], horarios: [], intervalos: [], disciplinaIds: ["1"],
      salaIds: ["8"], aulas: [aula] }],
    disciplinas: [], salas: [],
  };
  const baseAtualizada = { ...dados, grades: [{ ...dados.grades[0], aulas: [] }] };
  vi.mocked(carregarDados).mockReset().mockResolvedValueOnce(dados)
    .mockRejectedValueOnce(new Error("Recarregamento indisponível"))
    .mockResolvedValueOnce(baseAtualizada)
    .mockResolvedValue(dados);
  vi.mocked(salvarGrade).mockRejectedValueOnce(new Error("Falha de gravação")).mockResolvedValueOnce(undefined);
  vi.mocked(erroAlocacao).mockReturnValue("Banco · Sala A-101: sala incompatível.");

  render(<Alocacao />);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar quadro" }));
  fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(await screen.findByText(/Sala A-101.*rascunho continua aberto/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() => expect(salvarGrade).toHaveBeenLastCalledWith(baseAtualizada.grades[0], [aula], [], true));
  expect(await screen.findByText(/Alocação salva com sucesso/)).toBeInTheDocument();
});
