import type { TurmaResponse, TurmaRequest, Status } from "@/types/api";

export const PERIODOS = [
  { label: "Matutino", value: 1 },
  { label: "Vespertino", value: 2 },
  { label: "Noturno", value: 3 },
] as const;

export function periodoLabel(periodo: number): string {
  return PERIODOS.find((p) => p.value === periodo)?.label ?? String(periodo);
}

export const ANOS = [2024, 2025, 2026];

export interface TurmaView {
  id: number;
  periodo: number;
  ano: number;
  qtdAlunos: number;
  cursoId: number;
  cursoNome: string;
  status: Status;
}

export function mapTurmaResponseToView(t: TurmaResponse): TurmaView {
  return {
    id: t.id,
    periodo: t.periodo,
    ano: t.ano,
    qtdAlunos: t.numeroAlunos,
    cursoId: t.curso.id,
    cursoNome: t.curso.nome,
    status: t.curso.status,
  };
}