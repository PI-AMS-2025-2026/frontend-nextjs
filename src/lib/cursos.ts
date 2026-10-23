export type Periodicidade = "Semestral" | "Anual" | "Trimestral";
export type StatusCurso = "Ativo" | "Inativo";

export interface Curso {
    id: string;
    nome: string;
    periodicidade: Periodicidade;
    duracao: string; // ex: "2 anos"
    status: StatusCurso;
}

const NOMES_BASE = [
    "Análise e Desenvolvimento de Sistemas",
    "Gestão Empresarial",
    "Logística",
    "Marketing",
    "Sistemas para Internet",
    "Gestão da Produção Industrial",
    "Gestão de Recursos Humanos",
    "Comércio Exterior",
];

const PERIODICIDADES: Periodicidade[] = ["Semestral", "Anual", "Trimestral"];

/** Gera uma lista mock de cursos para popular a listagem inicialmente. */
export function gerarCursosMock(): Curso[] {
    const cursos: Curso[] = [];
    let id = 1;

    for (let ciclo = 0; ciclo < 3; ciclo++) {
        NOMES_BASE.forEach((nome, index) => {
            const status: StatusCurso = index % 2 === 0 ? "Ativo" : "Inativo";
            const periodicidade = PERIODICIDADES[(index + ciclo) % PERIODICIDADES.length];
            const duracao = index % 3 === 0 ? "3 anos" : "2 anos";

            cursos.push({
                id: String(id++),
                nome,
                periodicidade,
                duracao,
                status,
            });
        });
    }

    return cursos;
}

const STORAGE_KEY = "fatec-cursos-listagem";

/**
 * Lê os cursos salvos no localStorage do navegador.
 * Retorna null se não houver nada salvo ainda ou se rodar no servidor (SSR).
 */
export function carregarCursosSalvos(): Curso[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Curso[];
    } catch {
        return null;
    }
}

/** Salva a lista atual de cursos no localStorage do navegador. */
export function salvarCursos(cursos: Curso[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cursos));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — ignora silenciosamente
    }
}