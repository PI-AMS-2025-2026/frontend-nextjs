import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PeriodoModal } from "./periodo-modal";
import { formularioInicial, rotuloTipoPeriodo } from "./periodo-data";
import type { PeriodoAtividadeQuadroResponse } from "@/types/api";

describe("contrato da tela de períodos", () => {
  it("envia SEMESTRAL ao cadastrar", async () => {
    const confirmar = vi.fn().mockResolvedValue(undefined);
    render(<PeriodoModal open mode="cadastrar" onClose={vi.fn()} onConfirm={confirmar} />);
    fireEvent.click(screen.getByRole("button", { name: "CONFIRMAR" }));
    await waitFor(() => expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ tipoPeridoAtividadeQuadro: "SEMESTRAL" })));
    expect(rotuloTipoPeriodo("SEMESTRAL")).toBe("Semestral");
  });

  it("preserva dados anuais na edição e exibe erro retornado", async () => {
    const confirmar = vi.fn().mockRejectedValue(new Error("Período duplicado"));
    const periodo = { ...formularioInicial, id: 12, tipoPeridoAtividadeQuadro: "ANUAL", createdAt: "", updatedAt: "" } as PeriodoAtividadeQuadroResponse;
    render(<PeriodoModal open mode="editar" periodo={periodo} onClose={vi.fn()} onConfirm={confirmar} />);
    fireEvent.click(screen.getByRole("button", { name: "CONFIRMAR" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Período duplicado");
    expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ tipoPeridoAtividadeQuadro: "ANUAL", ano: periodo.ano }));
  });
});
