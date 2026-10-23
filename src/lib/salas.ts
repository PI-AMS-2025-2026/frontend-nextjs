export interface Recurso {
    id: string;
    nome: string;
    categoria: string;
    cor: string;
}

export interface Sala {
    id: string;
    codigo: string;
    capacidade: number;
    tipo: string;
    recursos: Recurso[];
}

const CORES_RECURSO = ["#BA1A1A", "#0099AA", "#4471E6", "#F5A623"];

const RECURSOS_BASE: { nome: string; categoria: string }[] = [
    { nome: "Ar-condicionado", categoria: "Climatização" },
    { nome: "Projetor", categoria: "Equipamento" },
    { nome: 'TV 55"', categoria: "Equipamento" },
    { nome: "Computadores (30)", categoria: "Equipamento" },
];

function gerarRecursos(quantidade: number): Recurso[] {
    return RECURSOS_BASE.slice(0, quantidade).map((r, i) => ({
        id: crypto.randomUUID(),
        nome: r.nome,
        categoria: r.categoria,
        cor: CORES_RECURSO[i % CORES_RECURSO.length],
    }));
}

export function gerarSalasMock(): Sala[] {
    const salas: Sala[] = [];

    for (let i = 1; i <= 30; i++) {
        const informatica = i % 2 === 1;
        salas.push({
            id: String(i),
            codigo: `Sala ${String(i).padStart(2, "0")}`,
            capacidade: 40,
            tipo: informatica ? "Informática" : "Sala de aula",
            recursos: gerarRecursos(informatica ? 4 : 2),
        });
    }

    return salas;
}

const STORAGE_KEY = "fatec-salas-listagem";

export function carregarSalasSalvas(): Sala[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Sala[];
    } catch {
        return null;
    }
}

export function salvarSalas(salas: Sala[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(salas));
    } catch {
        // localStorage indisponível — ignora
    }
}