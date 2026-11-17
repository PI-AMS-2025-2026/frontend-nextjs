import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CadastroUsuario from "./page";
import { cursosService } from "@/services/cursos.service";
import { usuariosService } from "@/services/usuarios.service";

vi.mock("@/services/cursos.service", () => ({ cursosService: { listarTodos: vi.fn() } }));
vi.mock("@/services/usuarios.service", () => ({ usuariosService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), deletar: vi.fn() } }));

describe("catálogo no cadastro de coordenador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.mocked(usuariosService.listar).mockResolvedValue({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
    vi.mocked(cursosService.listarTodos).mockResolvedValue([
      { id: 1, nome: "ADS", periodicidade: "Semestral", duracao: 6, status: "ATIVO", createdAt: "", updatedAt: "" },
      { id: 2, nome: "ADS", periodicidade: "Anual", duracao: 4, status: "ATIVO", createdAt: "", updatedAt: "" },
    ]);
    vi.mocked(usuariosService.criar).mockResolvedValue({} as never);
  });
  it("pede cursos ativos e envia o ID correto quando os nomes coincidem", async () => {
    render(<CadastroUsuario />);
    await waitFor(() => expect(cursosService.listarTodos).toHaveBeenCalledWith({ status: "ATIVO" }));
    fireEvent.click(await screen.findByRole("button", { name: /Cadastrar/i }));
    fireEvent.change(screen.getByPlaceholderText("Digite o nome..."), { target: { value: "Coordenador" } });
    fireEvent.change(screen.getByPlaceholderText("Digite o email..."), { target: { value: "coord@teste.com" } });
    fireEvent.change(screen.getByPlaceholderText("Digite a senha..."), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Administrador" }));
    fireEvent.click(screen.getByRole("button", { name: "Coordenador" }));
    fireEvent.click(screen.getByRole("button", { name: "Selecione o curso..." }));
    fireEvent.click(await screen.findByRole("button", { name: "ADS — Anual, 4 anos" }));
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(usuariosService.criar).toHaveBeenCalledWith(expect.objectContaining({ curso: { id: 2 }, tipoUsuario: "COORDENADOR" })));
  });
});
