export type Status = "Ativo" | "Inativo";

export interface Turma {
    id: string;
    periodo: string;
    periodoId: string;
    ano: number;
    qtdAlunos: number;
    curso: string;
    cursoId: string;
    status: Status;
}

// O backend armazena o semestre/período letivo como inteiro (1..duração do curso).
export const PERIODOS = Array.from({ length: 12 }, (_, index) => String(index + 1));

export const CURSOS = ["ADS", "PG", "GE"] as const;

export const ANOS = [2024, 2025, 2026];

const TURMAS_BASE: Omit<Turma, "id" | "periodoId" | "cursoId">[] = [
    { periodo: "1", ano: 2026, qtdAlunos: 40, curso: "ADS", status: "Ativo" },
    { periodo: "2", ano: 2026, qtdAlunos: 40, curso: "PG", status: "Inativo" },
    { periodo: "3", ano: 2026, qtdAlunos: 35, curso: "ADS", status: "Ativo" },
    { periodo: "1", ano: 2025, qtdAlunos: 38, curso: "GE", status: "Ativo" },
    { periodo: "2", ano: 2025, qtdAlunos: 42, curso: "PG", status: "Inativo" },
    { periodo: "3", ano: 2025, qtdAlunos: 30, curso: "GE", status: "Ativo" },
    { periodo: "1", ano: 2024, qtdAlunos: 45, curso: "ADS", status: "Ativo" },
    { periodo: "2", ano: 2024, qtdAlunos: 40, curso: "GE", status: "Inativo" },
];

export function gerarTurmasMock(): Turma[] {
    return TURMAS_BASE.map((t, i) => ({
        id: String(i + 1),
        periodoId: t.periodo,
        cursoId: String(CURSOS.indexOf(t.curso as (typeof CURSOS)[number]) + 1),
        ...t,
    }));
}

const STORAGE_KEY = "fatec-turmas-listagem";

export function carregarTurmasSalvas(): Turma[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Turma[];
    } catch {
        return null;
    }
}

export function salvarTurmas(turmas: Turma[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(turmas));
    } catch {
        // localStorage indisponível — ignora
    }
}
