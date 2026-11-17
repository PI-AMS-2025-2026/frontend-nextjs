import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TelaAlocacao } from "./alocacao";
import { pertenceAoTurno, type Turno } from "./turnos";
import type { Grade } from "./tipos";

const blocos = ["06:59", "07:00", "11:30", "12:00", "12:01", "12:10", "13:00", "18:00", "18:01", "19:00", "22:00", "22:01"];
const turno = (valor: string) => { fireEvent.click(screen.getByRole("button", { name: "Turno" })); fireEvent.click(screen.getByRole("button", { name: valor })); };
const grade: Grade = { id: "grade", quadroId: 42, cursoId: 5, turmaId: 10, turma: "ADS", versao: 1, dataCriacao: "2026-01-01", curso: "ADS", periodoLetivo: "2026", horarios: blocos.map(inicio => ({ inicio, fim: inicio === "11:30" ? "12:30" : inicio })), intervalos: [], disciplinaIds: [], salaIds: [], aulas: [{ id: "a", disciplinaId: "d", salaId: "s", dia: "segunda", inicio: "11:30", fim: "12:30", disciplina: "Banco", professor: "Ana", sala: "A" }] };

describe("turnos", () => {
  it.each<[string, Turno[]]>([
    ["06:59", []], ["07:00", ["manha"]], ["12:00", ["manha"]], ["12:00:01", ["manha"]], ["12:10", ["manha"]], ["12:59:59", ["manha"]], ["13:00", ["tarde"]], ["18:00", ["tarde"]], ["18:01", []], ["19:00", ["noite"]], ["22:00", ["noite"]], ["22:01", []], ["25:00", []],
  ])("classifica o início %s sem duplicar turnos", (inicio, esperado) => {
    expect((["manha", "tarde", "noite"] as Turno[]).filter(t => pertenceAoTurno(inicio, t))).toEqual(esperado);
  });
  it("filtra a tabela na visualização e edição e preserva aulas ao trocar de turno", () => {
    render(<TelaAlocacao grades={[grade]} gradeInicialId="grade" disciplinas={[]} salas={[]} salvarAlocacao={vi.fn()} />);
    turno("Manhã");
    let tabela = within(screen.getByRole("table"));
    expect(tabela.getByText("11:30 - 12:30")).toBeInTheDocument();
    expect(tabela.getByText("12:10 - 12:10")).toBeInTheDocument();
    expect(tabela.getByText("Banco")).toBeInTheDocument();
    expect(tabela.queryByText("13:00 - 13:00")).not.toBeInTheDocument();
    turno("Tarde");
    tabela = within(screen.getByRole("table"));
    expect(tabela.getByText("13:00 - 13:00")).toBeInTheDocument();
    expect(tabela.queryByText("12:10 - 12:10")).not.toBeInTheDocument();
    expect(tabela.queryByText("Banco")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    turno("Manhã");
    expect(within(screen.getByRole("table")).getByText("Banco")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Alocar por seleção" }));
    fireEvent.click(screen.getByRole("button", { name: "Selecione o bloco" }));
    expect(screen.getByRole("button", { name: "11:30 - 12:30" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "13:00 - 13:00" })).not.toBeInTheDocument();
  });
  it("mantém os dias visíveis quando o turno não tem blocos", () => {
    render(<TelaAlocacao grades={[{ ...grade, horarios: [{ inicio: "07:00", fim: "08:00" }] }]} gradeInicialId="grade" disciplinas={[]} salas={[]} salvarAlocacao={vi.fn()} />);
    turno("Noite");
    expect(screen.getByText("Nenhum bloco de horário disponível neste turno.")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("SEGUNDA")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).queryByText("07:00 - 08:00")).not.toBeInTheDocument();
  });
});
