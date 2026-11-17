import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Alocacao from "./alocacao";
vi.mock("./selecao-quadro", () => ({ SelecaoQuadro: ({ aoSelecionar }: { aoSelecionar: (id: number) => void }) => <button onClick={() => aoSelecionar(40)}>Selecionar quadro</button> }));
vi.mock("../ui/timetable", () => ({ default: () => <div>Grade vazia</div> }));
vi.mock("../ui/discipline-list", () => ({ default: () => null }));
vi.mock("./integracao", () => ({ carregarDados: vi.fn(), erroAlocacao: vi.fn(), exportarGrade: vi.fn(), interpretarSugestao: vi.fn(), salvarGrade: vi.fn(), validar: vi.fn() }));
import { carregarDados } from "./integracao";
it("abre a grade vazia do quadro selecionado e permite retornar à seleção", async () => {
  vi.mocked(carregarDados).mockResolvedValue({ grades: [{ id: "40:10", quadroId: 40, cursoId: 5, turmaId: 10, turma: "A", versao: 1, dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", blocos: [], horarios: [], intervalos: [], disciplinaIds: [], salaIds: [], aulas: [] }], disciplinas: [], salas: [] });
  render(<Alocacao />);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar quadro" }));
  expect(await screen.findByText("Grade vazia")).toBeInTheDocument();
  await waitFor(() => expect(carregarDados).toHaveBeenCalledWith(40));
  fireEvent.click(screen.getByRole("button", { name: "Voltar para a listagem de grades" }));
  expect(screen.getByRole("button", { name: "Selecionar quadro" })).toBeInTheDocument();
});
