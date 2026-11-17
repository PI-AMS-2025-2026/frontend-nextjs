import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CursoFormModal } from "@/components/cursos/curso-form-modal";

function preencherFormulario(periodicidade: "Anual" | "Semestral", duracao: string) {
    const confirmar = vi.fn();
    render(
        <CursoFormModal
            open
            onClose={vi.fn()}
            mode="cadastrar"
            onConfirm={confirmar}
        />,
    );

    fireEvent.change(screen.getByPlaceholderText("Digite aqui..."), { target: { value: "ADS" } });
    fireEvent.click(screen.getByRole("button", { name: "Selecione..." }));
    fireEvent.click(screen.getByRole("button", { name: periodicidade }));
    fireEvent.change(screen.getByPlaceholderText(periodicidade === "Anual" ? "1 a 4 anos" : "4 a 10 semestres"), {
        target: { value: duracao },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    return confirmar;
}

describe("validação da duração do curso", () => {
    it.each([
        ["Anual", "0", "entre 1 e 4 anos"],
        ["Anual", "5", "entre 1 e 4 anos"],
        ["Semestral", "3", "entre 4 e 10 semestres"],
        ["Semestral", "11", "entre 4 e 10 semestres"],
    ] as const)("rejeita duração %s de %s", (periodicidade, duracao, faixa) => {
        const confirmar = preencherFormulario(periodicidade, duracao);

        expect(screen.getByText(new RegExp(faixa))).toBeInTheDocument();
        expect(confirmar).not.toHaveBeenCalled();
    });

    it.each([
        ["Anual", "1"],
        ["Anual", "4"],
        ["Semestral", "4"],
        ["Semestral", "10"],
    ] as const)("aceita duração inclusiva %s de %s", (periodicidade, duracao) => {
        const confirmar = preencherFormulario(periodicidade, duracao);

        expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ periodicidade, duracao }));
    });
});
