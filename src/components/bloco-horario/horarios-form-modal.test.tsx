import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HorarioFormModal } from "./horarios-form-modal";

describe("formulário de blocos integrado", () => {
  it("valida intervalo e envia o bloco de manhã que termina às 13h", async () => {
    const confirmar = vi.fn().mockResolvedValue(undefined);
    render(<HorarioFormModal open mode="cadastrar" onClose={vi.fn()} onConfirm={confirmar} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(confirmar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "12:10" } });
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "11:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(confirmar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "13:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(confirmar).toHaveBeenCalledWith({ horaInicio: "12:10", horaFim: "13:00" }));
  });

  it("carrega edição e informa falha de persistência", async () => {
    const confirmar = vi.fn().mockRejectedValue(new Error("Bloco duplicado"));
    render(<HorarioFormModal open mode="editar" horario={{ id: 1, horaInicio: "07:40:00", horaFim: "08:30:00", duracao: 50, createdAt: "", updatedAt: "" }} onClose={vi.fn()} onConfirm={confirmar} />);
    expect(screen.getByLabelText("Início")).toHaveValue("07:40");
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(await screen.findByText("Bloco duplicado")).toBeInTheDocument();
  });
});
