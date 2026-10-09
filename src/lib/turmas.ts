export type Status = "Ativo" | "Inativo";

export interface Turma {
    id: string;
    periodo: string;
    ano: number;
    qtdAlunos: number;
    curso: string;
    status: Status;
}

export const PERIODOS = ["Matutino", "Vespertino", "Noturno"];

export const CURSOS = ["ADS", "PG", "GE"] as const;

export const ANOS = [2024, 2025, 2026];

const TURMAS_BASE: Omit<Turma, "id">[] = [
    { periodo: "Matutino", ano: 2026, qtdAlunos: 40, curso: "ADS", status: "Ativo" },
    { periodo: "Vespertino", ano: 2026, qtdAlunos: 40, curso: "PG", status: "Inativo" },
    { periodo: "Noturno", ano: 2026, qtdAlunos: 35, curso: "ADS", status: "Ativo" },
    { periodo: "Matutino", ano: 2025, qtdAlunos: 38, curso: "GE", status: "Ativo" },
    { periodo: "Vespertino", ano: 2025, qtdAlunos: 42, curso: "PG", status: "Inativo" },
    { periodo: "Noturno", ano: 2025, qtdAlunos: 30, curso: "GE", status: "Ativo" },
    { periodo: "Matutino", ano: 2024, qtdAlunos: 45, curso: "ADS", status: "Ativo" },
    { periodo: "Vespertino", ano: 2024, qtdAlunos: 40, curso: "GE", status: "Inativo" },
];

export function gerarTurmasMock(): Turma[] {
    return TURMAS_BASE.map((t, i) => ({
        id: String(i + 1),
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
