export type Recurso = {
    nome: string;
    categoria: string;
};

export type Sala = {
    id: string;
    codigo: string;
    capacidade: number;
    tipo: string;
    recursos: Recurso[];
};

const TIPOS_MOCK = ["Informática", "Sala de aula", "Laboratório", "Auditório"];

const RECURSOS_POOL: Recurso[][] = [
    [
        { nome: "Ar-condicionado", categoria: "Climatização" },
        { nome: "Projetor", categoria: "Equipamento" },
        { nome: 'TV 55"', categoria: "Equipamento" },
        { nome: "Computadores (30)", categoria: "Equipamento" },
    ],
    [
        { nome: "Quadro branco", categoria: "Mobiliário" },
        { nome: "Projetor", categoria: "Equipamento" },
        { nome: "Ar-condicionado", categoria: "Climatização" },
    ],
    [
        { nome: "Computadores (40)", categoria: "Equipamento" },
        { nome: "Ar-condicionado", categoria: "Climatização" },
    ],
];

// Tela somente leitura (visão do Coordenador) — não há cadastro/edição,
// então não há persistência em localStorage aqui, diferente de Turmas/Recursos.
export function gerarSalasMock(): Sala[] {
    return Array.from({ length: 30 }, (_, i) => {
        const numero = String(i + 1).padStart(2, "0");
        return {
            id: String(i + 1),
            codigo: `Sala ${numero}`,
            capacidade: 40,
            tipo: TIPOS_MOCK[i % TIPOS_MOCK.length],
            recursos: RECURSOS_POOL[i % RECURSOS_POOL.length],
        };
    });
}
