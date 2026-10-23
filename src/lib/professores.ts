export type Status = "Ativo" | "Inativo";

export interface Professor {
    id: string;
    nome: string;
    email: string;
    status: Status;
}

const NOMES_MOCK = [
    "Robson",
    "Ana Paula",
    "Micaella",
    "Paulo",
    "Roberto",
    "Joel",
    "Fernanda",
    "Lucas",
    "Carla",
    "Bruno",
];

export function gerarProfessoresMock(): Professor[] {
    return Array.from({ length: 30 }, (_, i) => {
        const nome = NOMES_MOCK[i % NOMES_MOCK.length];
        const sufixo = i >= NOMES_MOCK.length ? String(Math.floor(i / NOMES_MOCK.length) + 1) : "";
        const emailBase = nome.toLowerCase().replace(/\s+/g, "").slice(0, 8);

        return {
            id: String(i + 1),
            nome: sufixo ? `${nome} ${sufixo}` : nome,
            email: `${emailBase}${sufixo}@email.com`,
            status: i % 2 === 0 ? "Ativo" : "Inativo",
        };
    });
}