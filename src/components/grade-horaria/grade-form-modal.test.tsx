import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GradeFormModal } from "./grade-form-modal";
import type { PeriodoAtividadeQuadroResponse, TurmaResponse } from "@/types/api";

describe("quadro por turma", () => {
  it("exige turma e envia a turma selecionada junto ao período", () => {
    const confirmar = vi.fn();
    const turmas = [{ id: 7, codigo: "ADS-A", ano: 2026, periodo: 2 }] as TurmaResponse[];
    const periodos = [{ id: 9, ano: 2026, periodo: 1, tipoPeridoAtividadeQuadro: "SEMESTRAL", status: "ATIVO", dataInicio: "2026-01-01", dataFim: "2026-06-30", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00" }] as PeriodoAtividadeQuadroResponse[];
    render(<GradeFormModal open onClose={vi.fn()} mode="cadastrar" turmas={turmas} periodos={periodos} cursoNome="ADS" onConfirm={confirmar} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(confirmar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Turma" }));
    fireEvent.click(screen.getByRole("button", { name: "ADS-A · 2026 · 2º período" }));
    fireEvent.click(screen.getByRole("button", { name: "Selecione..." }));
    fireEvent.click(screen.getByRole("button", { name: "1º período de 2026" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ turmaId: 7, periodoAtividadeQuadroId: 9 }));
  });
});
