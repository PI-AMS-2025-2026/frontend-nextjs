import type { CursoResponse } from "@/types/api";

export function unidadePeriodoCurso(periodicidade?: string | null) {
    const valor = periodicidade?.trim().toLocaleLowerCase("pt-BR") ?? "";
    if (valor.includes("semestr")) return "semestre";
    if (valor.includes("anual") || valor.includes("ano")) return "ano";
    return "período";
}

export function opcoesPeriodoCurso(curso?: CursoResponse | null) {
    if (!curso || !Number.isInteger(curso.duracao) || curso.duracao < 1) return [];
    const unidade = unidadePeriodoCurso(curso.periodicidade);
    return Array.from({ length: curso.duracao }, (_, index) => {
        const periodo = index + 1;
        return { label: `${periodo}º ${unidade}`, value: String(periodo) };
    });
}

export function rotuloPeriodoTurma(periodicidade: string, periodo: number) {
    return `${periodo}º ${unidadePeriodoCurso(periodicidade)}`;
}
