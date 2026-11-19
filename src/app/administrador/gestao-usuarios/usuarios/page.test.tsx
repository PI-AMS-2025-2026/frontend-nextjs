import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastroUsuario from "@/app/administrador/gestao-usuarios/usuarios/page";
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

const usuario = {
    id: 31, nome: "Ana Silva", email: "ana@teste.com", tipoUsuario: "ADMINISTRADOR",
    status: "ATIVO", createdAt: "", updatedAt: "",
} as const;
const paginaUsuario = { page: 0, size: 10, totalElements: 1, totalPages: 1, content: [usuario] };

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

    it("permite cancelar ou fechar a confirmação sem inativar o usuário", async () => {
        usuariosApi.listar.mockResolvedValue(paginaUsuario);
        render(<CadastroUsuario />);
        const acao = await screen.findByRole("button", { name: "Inativar usuário" });
        fireEvent.click(acao);
        const dialogo = screen.getByRole("dialog", { name: "Inativar usuário" });
        expect(dialogo).toHaveTextContent(usuario.nome);
        fireEvent.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
        expect(dialogo).not.toBeInTheDocument();

        fireEvent.click(acao);
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(usuariosApi.deletar).not.toHaveBeenCalled();
    });

    it("apresenta falha no modal, impede envio duplicado e atualiza o status ao tentar novamente", async () => {
        usuariosApi.listar.mockResolvedValue(paginaUsuario);
        let rejeitar!: (erro: ApiError) => void;
        usuariosApi.deletar.mockImplementationOnce(() => new Promise((_, reject) => { rejeitar = reject; }));
        usuariosApi.deletar.mockImplementationOnce(async () => {
            usuariosApi.listar.mockResolvedValue({ ...paginaUsuario, content: [{ ...usuario, status: "INATIVO" }] });
        });
        render(<CadastroUsuario />);
        fireEvent.click(await screen.findByRole("button", { name: "Inativar usuário" }));
        const dialogo = screen.getByRole("dialog");
        const confirmar = within(dialogo).getByRole("button", { name: "Inativar" });
        fireEvent.click(confirmar);
        expect(confirmar).toBeDisabled();
        fireEvent.click(confirmar);
        expect(usuariosApi.deletar).toHaveBeenCalledTimes(1);
        expect(usuariosApi.deletar).toHaveBeenCalledWith(usuario.id);

        rejeitar(new ApiError("Usuário vinculado a uma operação em andamento.", 409));
        expect(await within(dialogo).findByRole("alert")).toHaveTextContent("Usuário vinculado");
        fireEvent.click(within(dialogo).getByRole("button", { name: "Inativar" }));
        expect(await screen.findByText("Usuário inativado com sucesso!")).toBeInTheDocument();
        expect(await screen.findByRole("cell", { name: "Inativo" })).toBeInTheDocument();
        expect(dialogo).not.toBeInTheDocument();
        expect(usuariosApi.deletar).toHaveBeenCalledTimes(2);
    });
});
