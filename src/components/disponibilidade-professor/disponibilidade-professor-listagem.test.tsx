import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { blocoHorariosService, disponibilidadesProfessoresService, professoresService } from "@/services";
import { DisponibilidadeProfessorListagem } from "./disponibilidade-professor-listagem";

vi.mock("@/services", () => ({
  blocoHorariosService: { listar: vi.fn() },
  disponibilidadesProfessoresService: { listar: vi.fn(), sincronizarGrade: vi.fn() },
  professoresService: { listar: vi.fn() },
}));

const professor = { id: 12, nome: "Ana Mária", email: "ana@teste.com", status: "ATIVO", createdAt: "", updatedAt: "" } as const;
const blocoManha = { id: 21, horaInicio: "08:00:00", horaFim: "08:50:00", duracao: 50, createdAt: "", updatedAt: "" };
const blocoTarde = { id: 22, horaInicio: "13:00:00", horaFim: "13:50:00", duracao: 50, createdAt: "", updatedAt: "" };
const disponibilidade = {
  id: 31, professor, diaSemana: "SEGUNDA", blocoHorario: blocoManha, createdAt: "", updatedAt: "",
} as const;
const profs = vi.mocked(professoresService);
const disp = vi.mocked(disponibilidadesProfessoresService);

function pagina<T>(content: T[]) {
  return { content, page: 0, size: 1000, totalElements: content.length, totalPages: 1 };
}

async function selecionarProfessor() {
  render(<DisponibilidadeProfessorListagem />);
  const campo = await screen.findByRole("combobox", { name: "Professor" });
  fireEvent.change(campo, { target: { value: "ana" } });
  fireEvent.click(await screen.findByRole("option", { name: /ana@teste\.com/ }));
  await screen.findByRole("table");
  await waitFor(() => expect(disp.listar).toHaveBeenCalledWith({ professor: professor.id, page: 0, size: 1000 }));
}

describe("grade de disponibilidade semanal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    profs.listar.mockResolvedValue(pagina([professor]));
    vi.mocked(blocoHorariosService.listar).mockResolvedValue(pagina([blocoManha, blocoTarde]));
    disp.listar.mockResolvedValue(pagina([disponibilidade]));
    disp.sincronizarGrade.mockResolvedValue([disponibilidade]);
  });

  it("carrega a grade do professor e permite marcar vários horários antes de salvar", async () => {
    await selecionarProfessor();

    expect(screen.getByRole("button", { name: "Remover disponibilidade Segunda, 08:00 a 08:50" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar disponibilidade Quarta, 08:00 a 08:50" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar disponibilidade Sexta, 13:00 a 13:50" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar grade" }));

    await waitFor(() => expect(disp.sincronizarGrade).toHaveBeenCalledWith(professor.id, {
      horarios: [
        { diaSemana: "SEGUNDA", blocoHorarioId: blocoManha.id },
        { diaSemana: "QUARTA", blocoHorarioId: blocoManha.id },
        { diaSemana: "SEXTA", blocoHorarioId: blocoTarde.id },
      ],
    }));
  });

  it("replica o padrão de segunda nos dias úteis em um atalho", async () => {
    await selecionarProfessor();
    fireEvent.click(screen.getByRole("button", { name: "Aplicar aos dias úteis" }));

    expect(screen.getByRole("button", { name: "Remover disponibilidade Terça, 08:00 a 08:50" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Remover disponibilidade Quarta, 08:00 a 08:50" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Adicionar disponibilidade Sábado, 08:00 a 08:50" })).toHaveAttribute("aria-pressed", "false");
  });

  it("pede confirmação antes de remover uma disponibilidade existente", async () => {
    await selecionarProfessor();
    fireEvent.click(screen.getByRole("button", { name: "Remover disponibilidade Segunda, 08:00 a 08:50" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar grade" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Remover horários da grade?");
    expect(disp.sincronizarGrade).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar remoções" }));
    await waitFor(() => expect(disp.sincronizarGrade).toHaveBeenCalledWith(professor.id, { horarios: [] }));
  });
});
