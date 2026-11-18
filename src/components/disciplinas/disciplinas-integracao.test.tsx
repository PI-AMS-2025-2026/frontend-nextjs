import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DisciplinasListagem } from "./disciplinas-listagem";
import { disciplinasService } from "@/services/disciplinas.service";
import { cursosService } from "@/services/cursos.service";
import { tiposSalaService } from "@/services/tipos-sala.service";

vi.mock("@/services/disciplinas.service", () => ({ disciplinasService: { listarTodos: vi.fn(), criar: vi.fn(), atualizar: vi.fn() } }));
vi.mock("@/services/cursos.service", () => ({ cursosService: { listarTodos: vi.fn() } }));
vi.mock("@/services/tipos-sala.service", () => ({ tiposSalaService: { listar: vi.fn() } }));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

const registro = { id: 9, nome: "Banco de Dados", cargaHoraria: 40, tipoDisciplina: "Teórica", periodo: 4, modalidade: "Presencial", codDisciplina: "BD02", cor: "#f5a623", curso: { id: 2, nome: "ADS", periodicidade: "Semestral", duracao: 6, status: "ATIVO", createdAt: "", updatedAt: "" }, tipoSala: { id: 3, nome: "Laboratório" }, createdAt: "", updatedAt: "" } as const;

describe("disciplinas integradas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(disciplinasService.listarTodos).mockResolvedValue([registro]);
    vi.mocked(cursosService.listarTodos).mockResolvedValue([registro.curso as never]);
    vi.mocked(tiposSalaService.listar).mockResolvedValue([registro.tipoSala]);
  });

  it("lista dados da API com código textual e etapa curricular numérica", async () => {
    render(<DisciplinasListagem />);
    expect(await screen.findByText("Banco de Dados")).toBeInTheDocument();
    expect(screen.getByText("BD02")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "4" })).toBeInTheDocument();
    expect(disciplinasService.listarTodos).toHaveBeenCalled();
  });

  it("preserva o código e a etapa ao editar pelo backend", async () => {
    vi.mocked(disciplinasService.atualizar).mockResolvedValue(registro);
    render(<DisciplinasListagem />);
    await screen.findByText("Banco de Dados");
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByDisplayValue("BD02")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Curso vinculado" })).toHaveTextContent(registro.curso.nome);
    expect(screen.getByRole("button", { name: "Tipo de sala" })).toHaveTextContent(registro.tipoSala.nome);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(disciplinasService.atualizar).toHaveBeenCalledWith(9, expect.objectContaining({ codDisciplina: "BD02", periodo: 4, curso: { id: 2 }, tipoSala: { id: 3 } })));
  });

  it("seleciona opções com nomes longos e envia os IDs no cadastro e na edição", async () => {
    const curso = { ...registro.curso, id: 12, nome: "Curso de Análise e Desenvolvimento de Sistemas de Informação" };
    const tipoSala = { id: 17, nome: "Laboratório para atividades práticas de redes e infraestrutura" };
    vi.mocked(cursosService.listarTodos).mockResolvedValue([registro.curso, curso]);
    vi.mocked(tiposSalaService.listar).mockResolvedValue([registro.tipoSala, tipoSala]);
    vi.mocked(disciplinasService.criar).mockResolvedValue({ ...registro, id: 10, curso, tipoSala });
    vi.mocked(disciplinasService.atualizar).mockResolvedValue({ ...registro, curso, tipoSala });

    function selecionar(campo: string, opcao: string) {
      const seletor = screen.getByRole("button", { name: campo });
      fireEvent.click(seletor);
      expect(seletor).toHaveAttribute("aria-expanded", "true");
      fireEvent.click(screen.getByRole("button", { name: opcao }));
      expect(seletor).toHaveTextContent(opcao);
      expect(seletor).toHaveAttribute("aria-expanded", "false");
    }

    render(<DisciplinasListagem />);
    await screen.findByText("Banco de Dados");
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    selecionar("Curso vinculado", curso.nome);
    selecionar("Tipo de sala", tipoSala.nome);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(disciplinasService.atualizar).toHaveBeenCalledWith(9, expect.objectContaining({ curso: { id: 12 }, tipoSala: { id: 17 } })));
    await screen.findByText("Disciplina editada com sucesso!");
    fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/ }));
    fireEvent.change(screen.getByPlaceholderText("Digite aqui..."), { target: { value: "Nova disciplina" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Carga horária" }), { target: { value: "40" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Código da disciplina" }), { target: { value: "BD03" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Período curricular" }), { target: { value: "4" } });
    selecionar("Tipo da disciplina", "Teórica");
    selecionar("Modalidade", "Presencial");
    selecionar("Curso vinculado", curso.nome);
    selecionar("Tipo de sala", tipoSala.nome);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(disciplinasService.criar).toHaveBeenCalledWith(expect.objectContaining({ curso: { id: 12 }, tipoSala: { id: 17 } })));
  });

  it("exibe falha de carregamento sem apresentar dados fictícios", async () => {
    vi.mocked(disciplinasService.listarTodos).mockRejectedValue(new Error("API indisponível"));
    render(<DisciplinasListagem />);
    expect(await screen.findByRole("alert")).toHaveTextContent("API indisponível");
    expect(screen.queryByText("Banco de Dados")).not.toBeInTheDocument();
  });

  it("rejeita carga inferior a 20 e mantém erro de duplicidade retornado pela API", async () => {
    vi.mocked(disciplinasService.criar).mockRejectedValue(new Error("Já existe uma disciplina cadastrada com o código BD02"));
    render(<DisciplinasListagem />);
    await screen.findByText("Banco de Dados");
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/ }));
    fireEvent.change(screen.getByPlaceholderText("Digite aqui..."), { target: { value: "Nova disciplina" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Carga horária" }), { target: { value: "19" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Código da disciplina" }), { target: { value: "BD02" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Período curricular" }), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(screen.getByText(/20 e 160 horas/)).toBeInTheDocument();
    expect(disciplinasService.criar).not.toHaveBeenCalled();
  });
});
