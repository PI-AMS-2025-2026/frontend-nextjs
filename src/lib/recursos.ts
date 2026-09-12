export type Recurso = {
    id: string;
    nome: string;
    tipo: string;
};

// Tipos de recurso padrão, disponíveis mesmo sem nenhum recurso cadastrado.
// Novos tipos digitados em "+Novo tipo" são adicionados em tempo de execução.
export const TIPOS_PADRAO = ["Equipamento", "Climatização"];

const RECURSOS_BASE: Omit<Recurso, "id">[] = [
    { nome: "Projetor", tipo: "Equipamento" },
    { nome: "Ar-Condicionado", tipo: "Climatização" },
    { nome: 'TV 55"', tipo: "Equipamento" },
    { nome: "Computador", tipo: "Equipamento" },
    { nome: "Quadro branco", tipo: "Equipamento" },
    { nome: "Ventilador", tipo: "Climatização" },
];

export function gerarRecursosMock(): Recurso[] {
    return Array.from({ length: 30 }, (_, i) => {
        const base = RECURSOS_BASE[i % RECURSOS_BASE.length];
        return { id: String(i + 1), ...base };
    });
}

const STORAGE_KEY = "fatec-recursos-listagem";

export function carregarRecursosSalvos(): Recurso[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Recurso[];
    } catch {
        return null;
    }
}

export function salvarRecursos(recursos: Recurso[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recursos));
    } catch {
        // localStorage indisponível — ignora
    }
}
