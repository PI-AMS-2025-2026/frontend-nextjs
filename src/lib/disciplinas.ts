

export type TipoDisciplina = "Teórica" | "Prática" | "50/50";
export type Periodo = "Manhã" | "Tarde" | "Noite";
export type Modalidade = "Presencial" | "EAD";
export type TipoSala = "Laboratório" | "Sala";
export type StatusDisciplina = "Ativo" | "Inativo";

export interface Disciplina {
    id: string;
    nome: string;
    cargaHoraria: number;
    tipo: TipoDisciplina;
    periodo: Periodo;
    modalidade: Modalidade;
    codigo: number;
    cor: string;
    cursoVinculado: string;
    tipoSala: TipoSala;
    status: StatusDisciplina;
}

export const CORES_DISCIPLINA = [
    { nome: "Laranja", hex: "#f5a623" },
    { nome: "Roxo", hex: "#9b59b6" },
    { nome: "Azul", hex: "#4a6cf7" },
    { nome: "Turquesa", hex: "#1abc9c" },
    { nome: "Rosa", hex: "#e84393" },
    { nome: "Verde", hex: "#2ecc71" },
] as const;

export const CURSOS_DISPONIVEIS = [
    "Análise e Desenvolvimento de Sistemas",
    "Gestão Empresarial",
    "Logística",
    "Marketing",
    "Sistemas para Internet",
    "Gestão da Produção Industrial",
];

const NOMES_BASE: { nome: string; codigo: number }[] = [
    { nome: "Algoritmos e Lógica de Programação", codigo: 102 },
    { nome: "Programação Orientada a Objetos", codigo: 119 },
    { nome: "Desenvolvimento Web", codigo: 100 },
    { nome: "Banco de Dados", codigo: 112 },
    { nome: "Engenharia de Software", codigo: 145 },
    { nome: "Redes", codigo: 194 },
    { nome: "Desenvolvimento Mobile", codigo: 111 },
    { nome: "Sistemas Operacionais", codigo: 126 },
];

const TIPOS: TipoDisciplina[] = ["50/50", "Prática", "Teórica"];
const PERIODOS: Periodo[] = ["Manhã", "Tarde", "Noite"];
const MODALIDADES: Modalidade[] = ["Presencial", "EAD"];
const TIPOS_SALA: TipoSala[] = ["Laboratório", "Sala"];

export function gerarDisciplinasMock(): Disciplina[] {
    const disciplinas: Disciplina[] = [];
    let id = 1;

    for (let ciclo = 0; ciclo < 4; ciclo++) {
        NOMES_BASE.forEach((base, index) => {
            const status: StatusDisciplina = index % 3 === 1 ? "Inativo" : "Ativo";
            disciplinas.push({
                id: String(id),
                nome: base.nome,
                cargaHoraria: index % 3 === 0 ? 80 : 60,
                tipo: TIPOS[(index + ciclo) % TIPOS.length],
                periodo: PERIODOS[(index + ciclo) % PERIODOS.length],
                modalidade: MODALIDADES[(index + ciclo) % MODALIDADES.length],
                codigo: base.codigo + ciclo,
                cor: CORES_DISCIPLINA[(index + ciclo) % CORES_DISCIPLINA.length].hex,
                cursoVinculado: CURSOS_DISPONIVEIS[index % CURSOS_DISPONIVEIS.length],
                tipoSala: TIPOS_SALA[(index + ciclo) % TIPOS_SALA.length],
                status,
            });
            id++;
        });
    }

    return disciplinas;
}

const STORAGE_KEY = "fatec-disciplinas-listagem";

export function carregarDisciplinasSalvas(): Disciplina[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Disciplina[];
    } catch {
        return null;
    }
}

export function salvarDisciplinas(disciplinas: Disciplina[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(disciplinas));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — ignora silenciosamente
    }
}