import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SalasListagem } from "./salas-listagem";
import { salasService } from "@/services/salas.service";
import { tiposSalaService } from "@/services/tipos-sala.service";
import { recursoSalaService } from "@/services/recurso-sala.service";

vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/navigation", () => ({ usePathname: () => "/administrador/salas" }));
vi.mock("@/services/salas.service", () => ({ salasService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), deletar: vi.fn() } }));
vi.mock("@/services/tipos-sala.service", () => ({ tiposSalaService: { listar: vi.fn(), criar: vi.fn() } }));
vi.mock("@/services/recurso-sala.service", () => ({ recursoSalaService: { listar: vi.fn() } }));

describe("filtro por tipo na listagem de salas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salasService.listar).mockResolvedValue({ content: [], page: 0, size: 6, totalElements: 0, totalPages: 0 });
    vi.mocked(tiposSalaService.listar).mockResolvedValue([
      { id: 5, nome: "Laboratório" },
      { id: 8, nome: "Auditório" },
    ]);
    vi.mocked(recursoSalaService.listar).mockResolvedValue({ content: [], page: 0, size: 1000, totalElements: 0, totalPages: 0 });
  });

  it("permite filtrar por tipo existente ou selecionar Todos", async () => {
    render(<SalasListagem />);
    const filtro = await screen.findByRole("combobox", { name: "Tipo" });
    expect(screen.getByRole("option", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Laboratório" })).toBeInTheDocument();

    fireEvent.change(filtro, { target: { value: "5" } });
    await waitFor(() => expect(salasService.listar).toHaveBeenLastCalledWith(expect.objectContaining({ tipo_sala: 5 })));

    fireEvent.change(filtro, { target: { value: "" } });
    await waitFor(() => expect(salasService.listar).toHaveBeenLastCalledWith(expect.not.objectContaining({ tipo_sala: expect.anything() })));
  });
});
