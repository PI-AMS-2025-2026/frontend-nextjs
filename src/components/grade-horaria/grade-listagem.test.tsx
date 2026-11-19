import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradeListagem } from "./grade-listagem";
import { periodoAtividadeQuadroService, quadroHorariosService, turmasService } from "@/services";
import type { CursoResponse, PeriodoAtividadeQuadroResponse, QuadroHorarioResponse } from "@/types/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/use-auth", () => ({
    useAuth: () => ({ user: { curso: { id: 1, nome: "ADS" } }, isLoading: false }),
}));
vi.mock("@/services", () => ({
    periodoAtividadeQuadroService: { listar: vi.fn() },
    quadroHorariosService: { listar: vi.fn() },
    turmasService: { listar: vi.fn() },
}));

const curso: CursoResponse = { id: 1, nome: "ADS", periodicidade: "Semestral", duracao: 6, status: "ATIVO", createdAt: "", updatedAt: "" };
const primeiroPeriodo: PeriodoAtividadeQuadroResponse = {
    id: 9, ano: 2026, periodo: 1, tipoPeridoAtividadeQuadro: "SEMESTRAL", status: "ATIVO",
    dataInicio: "2026-01-01", dataFim: "2026-06-30", createdAt: "", updatedAt: "",
};
const segundoPeriodo: PeriodoAtividadeQuadroResponse = {
    ...primeiroPeriodo, id: 10, periodo: 2, dataInicio: "2026-07-01", dataFim: "2026-12-31",
};
const quadros: QuadroHorarioResponse[] = [
    { id: 21, versao: 1, periodoAtividadeQuadro: primeiroPeriodo, dataCriacao: "2026-02-01" },
    { id: 22, versao: 2, periodoAtividadeQuadro: segundoPeriodo, dataCriacao: "2026-08-01" },
    { id: 23, versao: 3, periodoAtividadeQuadro: segundoPeriodo, dataCriacao: "2026-08-02" },
].map(quadro => ({ ...quadro, curso, turma: { id: 12 }, status: "ATIVO" as const, createdAt: "", updatedAt: "" }));

function pagina<T>(content: T[]) {
    return { content, page: 0, size: 1000, totalElements: content.length, totalPages: 1 };
}

async function abrirListagem() {
    render(<GradeListagem />);
    await screen.findByRole("cell", { name: "01" });
    return screen.getByLabelText("Versão");
}

describe("filtro de versão da listagem de quadros", () => {
    beforeEach(() => {
        vi.mocked(quadroHorariosService.listar).mockResolvedValue(pagina(quadros));
        vi.mocked(periodoAtividadeQuadroService.listar).mockResolvedValue(pagina([primeiroPeriodo, segundoPeriodo]));
        vi.mocked(turmasService.listar).mockResolvedValue(pagina([]));
    });

    it("ignora um valor negativo sem alterar o filtro exibido", async () => {
        const campo = await abrirListagem();
        expect(campo).toHaveAttribute("type", "number");
        expect(campo).toHaveAttribute("min", "0");
        fireEvent.change(campo, { target: { value: "-1" } });
        expect(campo).toHaveValue(null);
        expect(screen.getByRole("cell", { name: "01" })).toBeInTheDocument();

        fireEvent.change(campo, { target: { value: "2" } });
        fireEvent.change(campo, { target: { value: "-2.5" } });
        expect(campo).toHaveValue(2);
        expect(screen.getByRole("cell", { name: "02" })).toBeInTheDocument();
        expect(screen.queryByRole("cell", { name: "01" })).not.toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("continua aceitando zero, decimais não negativos e a limpeza do campo", async () => {
        const campo = await abrirListagem();
        fireEvent.change(campo, { target: { value: "0" } });
        expect(campo).toHaveValue(0);
        fireEvent.change(campo, { target: { value: "1.5" } });
        expect(campo).toHaveValue(1.5);
        fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
        expect(campo).toHaveValue(null);
        expect(screen.getByRole("cell", { name: "01" })).toBeInTheDocument();
        expect(screen.getByRole("cell", { name: "03" })).toBeInTheDocument();
    });

    it("bloqueia notação científica digitada ou colada", async () => {
        const campo = await abrirListagem();
        fireEvent.change(campo, { target: { value: "2" } });

        expect(fireEvent.keyDown(campo, { key: "e" })).toBe(false);
        expect(fireEvent.keyDown(campo, { key: "E", shiftKey: true })).toBe(false);
        expect(fireEvent.paste(campo, { clipboardData: { getData: () => "2E3" } })).toBe(false);
        fireEvent.change(campo, { target: { value: "2e3" } });

        expect(campo).toHaveValue(2);
        expect(screen.getByRole("cell", { name: "02" })).toBeInTheDocument();
    });
});
