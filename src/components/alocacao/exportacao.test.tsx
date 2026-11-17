import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TelaAlocacao } from "./alocacao";
import type { Aula, Grade } from "./tipos";

vi.mock("./alocacao-listagem", () => ({ default: ({ onAbrir }: { onAbrir: (id: string) => void }) => <button onClick={() => onAbrir("grade")}>Abrir</button> }));
vi.mock("../ui/discipline-list", () => ({ default: () => null }));
vi.mock("../ui/timetable", () => ({ default: ({ aulas, onAulaClick }: { aulas: Aula[]; onAulaClick: (aula: Aula) => void }) => <button onClick={() => onAulaClick(aulas[0])}>Abrir aula</button> }));
vi.mock("./integracao", () => ({ exportarGrade: vi.fn(), carregarDados: vi.fn(), erroAlocacao: vi.fn(), interpretarSugestao: vi.fn(), salvarGrade: vi.fn(), validar: vi.fn() }));
import { exportarGrade } from "./integracao";

describe("exportação na tela de alocação", () => {
  it("orienta salvar quando existe alteração não salva", () => {
    const grade: Grade = { id: "grade", quadroId: 42, cursoId: 5, turmaId: 10, turma: "A", versao: 1,
      dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", horarios: [{ inicio: "07:00", fim: "08:00" }],
      intervalos: [], disciplinaIds: [], salaIds: [], aulas: [{ id: "1", disciplinaId: "1", salaId: "1", dia: "segunda", inicio: "07:00", fim: "08:00", disciplina: "Banco", professor: "Ana", sala: "A" }] };
    render(<TelaAlocacao grades={[grade]} disciplinas={[]} salas={[]} salvarAlocacao={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir aula" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Exportar" }));
    expect(screen.getByText(/Salve as alterações antes de exportar/)).toBeInTheDocument();
    expect(exportarGrade).not.toHaveBeenCalled();
  });
});
