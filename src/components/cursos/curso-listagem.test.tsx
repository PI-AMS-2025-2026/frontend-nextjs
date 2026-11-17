import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CursosListagem } from "./curso-listagem";
import { cursosService } from "@/services/cursos.service";
import type { CursoResponse } from "@/types/api";

vi.mock("@/services/cursos.service", () => ({ cursosService: { listarTodos: vi.fn(), criar: vi.fn(), atualizar: vi.fn() } }));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

const registro = (id: number, nome: string): CursoResponse => ({ id, nome, periodicidade: "Semestral", duracao: 6, status: "ATIVO", createdAt: "2026-01-01", updatedAt: "2026-01-01" });
function preencher(nome: string) {
  fireEvent.change(screen.getByPlaceholderText("Digite aqui..."), { target: { value: nome } });
  fireEvent.click(screen.getByRole("button", { name: "Selecione..." }));
  fireEvent.click(screen.getByRole("button", { name: "Semestral" }));
  fireEvent.change(screen.getByPlaceholderText("4 a 10 semestres"), { target: { value: "6" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
}
describe("gestão de cursos pela API", () => {
  beforeEach(() => vi.clearAllMocks());
  it("cria e mantém os dados ao recarregar a tela", async () => {
    let cursos = [registro(1, "ADS")];
    vi.mocked(cursosService.listarTodos).mockImplementation(async () => [...cursos]);
    vi.mocked(cursosService.criar).mockImplementation(async (dados) => {
      const novo = { ...registro(2, dados.nome), ...dados }; cursos = [...cursos, novo]; return novo;
    });
    const tela = render(<CursosListagem />);
    await screen.findByText("ADS");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    preencher("Logística");
    await screen.findByText("Curso cadastrado com sucesso!");
    expect(cursosService.criar).toHaveBeenCalledWith({ nome: "Logística", periodicidade: "Semestral", duracao: 6, status: "ATIVO" });
    tela.unmount(); render(<CursosListagem />);
    expect(await screen.findByText("Logística")).toBeInTheDocument();
  });
  it("mantém o formulário aberto e mostra a rejeição da API para duplicidade", async () => {
    vi.mocked(cursosService.listarTodos).mockResolvedValue([registro(1, "ADS")]);
    vi.mocked(cursosService.criar).mockRejectedValue(new Error("Já existe um curso com o mesmo nome, periodicidade e duração"));
    render(<CursosListagem />); await screen.findByText("ADS");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" })); preencher("ADS");
    expect(await screen.findByRole("alert")).toHaveTextContent("Já existe um curso");
    expect(screen.getByPlaceholderText("Digite aqui...")).toHaveValue("ADS");
  });
  it("edita um curso e usa os valores devolvidos pela API", async () => {
    vi.mocked(cursosService.listarTodos).mockResolvedValue([registro(1, "ADS")]);
    vi.mocked(cursosService.atualizar).mockResolvedValue(registro(1, "ADS atualizado"));
    render(<CursosListagem />); await screen.findByText("ADS");
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByPlaceholderText("Digite aqui..."), { target: { value: "ADS atualizado" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(cursosService.atualizar).toHaveBeenCalledWith(1, expect.objectContaining({ nome: "ADS atualizado" })));
    expect(await screen.findByText("ADS atualizado")).toBeInTheDocument();
  });
});
