import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { blocoHorariosService, disponibilidadesProfessoresService, professoresService } from "@/services";
import { DisponibilidadeProfessorListagem } from "./disponibilidade-professor-listagem";

vi.mock("@/services", () => ({
    blocoHorariosService: { listar: vi.fn() },
    disponibilidadesProfessoresService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn() },
    professoresService: { listar: vi.fn() },
}));

const primeiraAna = { id: 11, nome: "Ana Mária", email: "ana1@teste.com", status: "ATIVO", createdAt: "", updatedAt: "" } as const;
const segundaAna = { ...primeiraAna, id: 12, email: "ana2@teste.com" };
const bruno = { ...primeiraAna, id: 13, nome: "Bruno Silva", email: "bruno@teste.com" };
const bloco = { id: 21, horaInicio: "08:00:00", horaFim: "08:50:00", duracao: 50, createdAt: "", updatedAt: "" };
const disponibilidade = {
    id: 31, professor: segundaAna, diaSemana: "SEGUNDA", blocoHorario: bloco, createdAt: "", updatedAt: "",
} as const;
const profs = vi.mocked(professoresService);
const disp = vi.mocked(disponibilidadesProfessoresService);

function pagina<T>(content: T[], page = 0, totalPages = 1) {
    return { content, page, size: 1000, totalElements: 3, totalPages };
}

async function abrirCadastro() {
    render(<DisponibilidadeProfessorListagem />);
    fireEvent.click(await screen.findByRole("button", { name: "Cadastrar" }));
    return screen.getByRole("combobox", { name: "Professor" });
}

function escolherDiaEHorario() {
    fireEvent.click(screen.getByRole("button", { name: "Escolha" }));
    fireEvent.click(screen.getByRole("button", { name: "Terça" }));
    fireEvent.click(screen.getByRole("button", { name: "Selecione um horário" }));
    fireEvent.click(screen.getByRole("button", { name: "08:00 - 08:50" }));
}

describe("seletor de professor em disponibilidade", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        profs.listar.mockImplementation(async ({ page } = {}) => page === 1
            ? pagina([segundaAna, bruno], 1, 2)
            : pagina([primeiraAna], 0, 2));
        vi.mocked(blocoHorariosService.listar).mockResolvedValue(pagina([bloco]));
        disp.listar.mockResolvedValue(pagina([disponibilidade]));
        disp.criar.mockResolvedValue(disponibilidade);
        disp.atualizar.mockResolvedValue(disponibilidade);
    });

    it("busca por nome sem acentos e envia o ID do homônimo escolhido com o mouse", async () => {
        const campo = await abrirCadastro();
        fireEvent.change(campo, { target: { value: "maria" } });

        const lista = await screen.findByRole("listbox", { name: "Professores" });
        const outraAna = await within(lista).findByRole("option", { name: /ana2@teste\.com/ });
        expect(within(lista).getAllByRole("option")).toHaveLength(2);
        expect(within(lista).queryByText("Bruno Silva")).not.toBeInTheDocument();
        expect(profs.listar).toHaveBeenCalledWith({ page: 1, size: 1000 });
        fireEvent.mouseDown(outraAna);
        fireEvent.click(outraAna);
        expect(campo).toHaveValue(segundaAna.nome);
        expect(campo).toHaveAttribute("aria-expanded", "false");

        escolherDiaEHorario();
        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
        await waitFor(() => expect(disp.criar).toHaveBeenCalledWith({
            professor: { id: segundaAna.id }, diaSemana: "TERÇA", blocoHorario: { id: bloco.id },
        }));
    });

    it("mostra lista vazia, recusa texto livre e permite selecionar pelo teclado", async () => {
        const campo = await abrirCadastro();
        fireEvent.change(campo, { target: { value: "Nome inexistente" } });
        expect(screen.getByRole("status")).toHaveTextContent("Nenhum professor encontrado.");

        fireEvent.change(campo, { target: { value: bruno.nome } });
        const opcao = await screen.findByRole("option", { name: /Bruno Silva/ });
        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
        expect(screen.getByRole("alert")).toHaveTextContent("Selecione um professor na lista.");
        expect(disp.criar).not.toHaveBeenCalled();

        fireEvent.keyDown(campo, { key: "ArrowDown" });
        expect(campo).toHaveAttribute("aria-activedescendant", opcao.id);
        fireEvent.keyDown(campo, { key: "Escape" });
        expect(campo).toHaveAttribute("aria-expanded", "false");
        fireEvent.keyDown(campo, { key: "ArrowDown" });
        fireEvent.keyDown(campo, { key: "Enter" });
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(campo).toHaveAttribute("aria-expanded", "false");

        escolherDiaEHorario();
        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
        await waitFor(() => expect(disp.criar).toHaveBeenCalledWith(expect.objectContaining({
            professor: { id: bruno.id },
        })));
    });

    it("preserva o vínculo atual na edição e exige nova seleção após alterar o texto", async () => {
        render(<DisponibilidadeProfessorListagem />);
        fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
        let campo = screen.getByRole("combobox", { name: "Professor" });
        expect(campo).toHaveValue(segundaAna.nome);
        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
        await waitFor(() => expect(disp.atualizar).toHaveBeenCalledWith(disponibilidade.id, {
            professor: { id: segundaAna.id }, diaSemana: "SEGUNDA", blocoHorario: { id: bloco.id },
        }));
        await waitFor(() => expect(campo).not.toBeInTheDocument());
        fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));

        fireEvent.click(screen.getByRole("button", { name: "Editar" }));
        campo = screen.getByRole("combobox", { name: "Professor" });
        fireEvent.change(campo, { target: { value: "Ana" } });
        fireEvent.change(campo, { target: { value: segundaAna.nome } });
        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
        expect(screen.getByRole("alert")).toHaveTextContent("Selecione um professor na lista.");
        expect(disp.atualizar).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("option", { name: /ana1@teste\.com/ }));
        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
        await waitFor(() => expect(disp.atualizar).toHaveBeenLastCalledWith(disponibilidade.id,
            expect.objectContaining({ professor: { id: primeiraAna.id } })));
    });
});
