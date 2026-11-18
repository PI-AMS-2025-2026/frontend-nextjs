import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdministratorDashboard } from "./administrator-dashboard";
import { professoresService } from "@/services/professores.service";
import { usuariosService } from "@/services/usuarios.service";
import { cursosService } from "@/services/cursos.service";
vi.mock("@/services/professores.service", () => ({ professoresService: { listar: vi.fn().mockResolvedValue({ totalElements: 42 }) } }));
vi.mock("@/services/usuarios.service", () => ({ usuariosService: { listar: vi.fn().mockRejectedValue(new Error("indisponível")) } }));
vi.mock("@/services/cursos.service", () => ({ cursosService: { listar: vi.fn().mockResolvedValue({ totalElements: 17 }) } }));

describe("dashboard integrado", () => {
  it("exibe totais reais e mantém resultados mesmo com falha parcial", async () => {
    render(<AdministratorDashboard />);
    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(await screen.findByText("17")).toBeInTheDocument();
    expect(await screen.findByText("Não foi possível carregar o total.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quadro horário/ })).toHaveAttribute("href", "/adminstrador/grade-planejamento");
    expect(vi.mocked(professoresService.listar)).toHaveBeenCalledWith({ size: 1 });
    expect(vi.mocked(usuariosService.listar)).toHaveBeenCalledWith({ size: 1 });
    expect(vi.mocked(cursosService.listar)).toHaveBeenCalledWith({ size: 1 });
  });
});
