import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PeriodoList } from "./periodo-list";
import { periodoAtividadeQuadroService } from "@/services/periodo-atividade-quadro.service";
vi.mock("@/services/periodo-atividade-quadro.service", () => ({ periodoAtividadeQuadroService: { listar: vi.fn() } }));

describe("listagem de períodos integrada", () => {
  it("converte paginação da interface para página da API e informa falha", async () => {
    vi.mocked(periodoAtividadeQuadroService.listar).mockResolvedValueOnce({ content: [], totalElements: 21, totalPages: 3, page: 0, size: 10 });
    render(<PeriodoList />);
    const proxima = await screen.findByRole("button", { name: "Próxima página" });
    await waitFor(() => expect(proxima).toBeEnabled());
    expect(periodoAtividadeQuadroService.listar).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 10 }));
    vi.mocked(periodoAtividadeQuadroService.listar).mockRejectedValueOnce(new Error("Falha ao consultar períodos"));
    fireEvent.click(proxima);
    await waitFor(() => expect(periodoAtividadeQuadroService.listar).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })));
    expect(await screen.findByText("Falha ao consultar períodos")).toBeInTheDocument();
  });
});
