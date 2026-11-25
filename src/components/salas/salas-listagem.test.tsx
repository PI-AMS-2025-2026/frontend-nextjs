import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SalasListagem } from "./salas-listagem";
import { salasService } from "@/services/salas.service";
import { tiposSalaService } from "@/services/tipos-sala.service";
import { recursoSalaService } from "@/services/recurso-sala.service";

vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
const navigation = vi.hoisted(() => ({ pathname: "/administrador/salas" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
vi.mock("@/services/salas.service", () => ({ salasService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), deletar: vi.fn() } }));
vi.mock("@/services/tipos-sala.service", () => ({ tiposSalaService: { listar: vi.fn(), criar: vi.fn() } }));
vi.mock("@/services/recurso-sala.service", () => ({ recursoSalaService: { listar: vi.fn() } }));

describe("filtro por tipo na listagem de salas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/administrador/salas";
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

  it("mantém as ações de gestão para o administrador", async () => {
    vi.mocked(salasService.listar).mockResolvedValue({
      content: [{ id: 23, codigo: "LAB-1", capacidade: 30, tipoSala: { id: 5, nome: "Laboratório" } } as never],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });
    render(<SalasListagem />);

    expect(await screen.findByRole("button", { name: "Cadastrar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Recursos" })).toBeInTheDocument();
  });

  it("deixa a listagem do coordenador somente para consulta", async () => {
    navigation.pathname = "/coordenador/listagens/sala";
    vi.mocked(salasService.listar).mockResolvedValue({
      content: [{ id: 23, codigo: "LAB-1", capacidade: 30, tipoSala: { id: 5, nome: "Laboratório" } } as never],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });
    render(<SalasListagem />);

    expect(await screen.findByText("Visualize as salas da instituição")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cadastrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Ver Recursos" }));
    expect(await screen.findByText("Recursos — LAB-1")).toBeInTheDocument();
  });
});
