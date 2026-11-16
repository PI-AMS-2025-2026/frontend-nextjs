import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { cursosService } from "@/services/cursos.service";
import { turmasService } from "@/services/turmas.service";
import { TurmasListagem } from "@/components/turmas/TurmasListagem/turmas-listagem";

vi.mock("@/services/turmas.service", () => ({
  turmasService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), buscar: vi.fn(), deletar: vi.fn() },
}));

vi.mock("@/services/cursos.service", () => ({
  cursosService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), buscar: vi.fn(), deletar: vi.fn() },
}));

const turma = {
  id: 7,
  codigo: "T-07",
  periodo: 2,
  ano: 2026,
  numeroAlunos: 34,
  curso: { id: 3, nome: "ADS", periodicidade: "Semestral", duracao: 6, status: "ATIVO" as const, createdAt: "", updatedAt: "" },
  status: "INATIVO" as const,
  createdAt: "",
  updatedAt: "",
};

const response = { content: [turma], page: 0, size: 10, totalElements: 1, totalPages: 1 };
const turmasApi = vi.mocked(turmasService);
const cursosApi = vi.mocked(cursosService);

describe("TurmasListagem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    turmasApi.listar.mockResolvedValue(response);
    turmasApi.criar.mockResolvedValue(turma);
    turmasApi.atualizar.mockResolvedValue(turma);
    cursosApi.listar.mockResolvedValue({ content: [turma.curso], page: 0, size: 100, totalElements: 1, totalPages: 1 });
  });

  it("carrega a página e o status diretamente do backend", async () => {
    render(<TurmasListagem />);

    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(screen.getByText("Inativo")).toBeInTheDocument();
    expect(turmasApi.listar).toHaveBeenCalledWith({ page: 0, size: 10, busca: undefined, periodo: undefined, ano: undefined, status: undefined });
  });

  it("envia filtros e paginação para o backend", async () => {
    render(<TurmasListagem />);
    await screen.findByText("7");
    fireEvent.change(screen.getByLabelText("Ano"), { target: { value: "2025" } });

    await waitFor(() => expect(turmasApi.listar).toHaveBeenLastCalledWith({
      page: 0,
      size: 10,
      busca: undefined,
      periodo: undefined,
      ano: 2025,
      status: undefined,
    }));
  });

  it("cria uma turma enviando IDs, enums e campos no formato esperado pelo serviço", async () => {
    render(<TurmasListagem />);
    await screen.findByText("7");
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/ }));
    await waitFor(() => expect(cursosApi.listar).toHaveBeenCalled());

    await waitFor(() => expect(screen.getByRole("button", { name: "Curso da turma" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Curso da turma" }));
    fireEvent.click(await screen.findByRole("button", { name: "ADS" }));
    fireEvent.click(screen.getByRole("button", { name: "Período da turma" }));
    fireEvent.click(screen.getByRole("button", { name: "3º semestre" }));
    fireEvent.change(screen.getByPlaceholderText("Ex: 40"), { target: { value: "40" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: 2026"), { target: { value: "2026" } });
    fireEvent.click(screen.getByLabelText("Inativo"));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(turmasApi.criar).toHaveBeenCalledWith({
      periodo: 3,
      ano: 2026,
      numeroAlunos: 40,
      curso: { id: 3 },
      status: "INATIVO",
    }));
  });
});
