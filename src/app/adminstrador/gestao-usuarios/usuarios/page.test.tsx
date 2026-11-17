import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastroUsuario from "@/app/adminstrador/gestao-usuarios/usuarios/page";
import { cursosService } from "@/services/cursos.service";
import { usuariosService } from "@/services/usuarios.service";
import { ApiError } from "@/lib/api";

vi.mock("@/services/usuarios.service", () => ({
    usuariosService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), deletar: vi.fn() },
}));

vi.mock("@/services/cursos.service", () => ({
    cursosService: { listar: vi.fn(), listarTodos: vi.fn() },
}));

const usuariosApi = vi.mocked(usuariosService);
const cursosApi = vi.mocked(cursosService);

describe("formulário de usuários", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
        usuariosApi.listar.mockResolvedValue({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
        cursosApi.listarTodos.mockResolvedValue([
            { id: 7, nome: "ADS", periodicidade: "Semestral", duracao: 6, status: "ATIVO", createdAt: "", updatedAt: "" },
        ]);
    });

    it("mostra os erros de campos obrigatórios junto ao formulário", async () => {
        render(<CadastroUsuario />);
        fireEvent.click(await screen.findByRole("button", { name: /Cadastrar/ }));
        fireEvent.click(screen.getByRole("button", { name: "CONFIRMAR" }));

        expect(await screen.findByText("Nome é obrigatório.")).toBeInTheDocument();
        expect(screen.getByText("E-mail é obrigatório.")).toBeInTheDocument();
    });

    it("mostra a razão da API abaixo do curso inválido", async () => {
        usuariosApi.criar.mockRejectedValue(new ApiError("Curso não encontrado com ID: 999", 404));
        render(<CadastroUsuario />);
        fireEvent.click(await screen.findByRole("button", { name: /Cadastrar/ }));

        fireEvent.change(screen.getByPlaceholderText("Digite o nome..."), { target: { value: "Coordenação" } });
        fireEvent.change(screen.getByPlaceholderText("Digite o email..."), { target: { value: "coord@teste.com" } });
        fireEvent.change(screen.getByPlaceholderText("Digite a senha..."), { target: { value: "123456" } });
        fireEvent.click(screen.getByRole("button", { name: "Administrador" }));
        fireEvent.click(screen.getByRole("button", { name: "Coordenador" }));
        fireEvent.click(await screen.findByRole("button", { name: "Selecione o curso..." }));
        fireEvent.click(screen.getByRole("button", { name: "ADS — Semestral, 6 semestres" }));
        fireEvent.click(screen.getByRole("button", { name: "CONFIRMAR" }));

        expect(await screen.findByText("Curso não encontrado com ID: 999")).toBeInTheDocument();
        await waitFor(() => expect(usuariosApi.criar).toHaveBeenCalled());
    });
});
