

export type TipoDisciplina = "Teórica" | "Prática" | "50/50";
export type Periodo = number;
export type Modalidade = "Presencial" | "EAD" | "Híbrida";
export type TipoSala = string;

export interface Disciplina {
    id: string;
    nome: string;
    cargaHoraria: number;
    tipo: TipoDisciplina;
    periodo: Periodo;
    modalidade: Modalidade;
    codigo: string;
    cor: string;
    cursoVinculado: string;
    tipoSala: TipoSala;
}

export const CORES_DISCIPLINA = [
    { nome: "Laranja", hex: "#f5a623" },
    { nome: "Roxo", hex: "#9b59b6" },
    { nome: "Azul", hex: "#4a6cf7" },
    { nome: "Turquesa", hex: "#1abc9c" },
    { nome: "Rosa", hex: "#e84393" },
    { nome: "Verde", hex: "#2ecc71" },
] as const;
