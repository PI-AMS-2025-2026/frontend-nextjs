export type TipoDisciplina = 'Prática' | 'Teórica' | '50/50';
export type PeriodoDisciplina = 'Manhã' | 'Tarde' | 'Noite';
export type ModalidadeDisciplina = 'Presencial' | 'EAD';
export type TipoSala = 'Laboratório' | 'Sala';
export type StatusDisciplina = 'ativo' | 'inativo';

/**
 * Paleta fixa de cores disponíveis para as disciplinas (usadas depois na
 * alocação, onde cada disciplina vira um "quadradinho colorido").
 */
export const CORES_DISCIPLINA = [
  { valor: '#f97316', nome: 'Laranja' },
  { valor: '#8b5cf6', nome: 'Roxo' },
  { valor: '#3b82f6', nome: 'Azul' },
  { valor: '#14b8a6', nome: 'Verde-água' },
  { valor: '#ec4899', nome: 'Rosa' },
  { valor: '#22c55e', nome: 'Verde' },
  { valor: '#ef4444', nome: 'Vermelho' },
  { valor: '#eab308', nome: 'Amarelo' },
] as const;

export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria: number; // em horas
  tipo: TipoDisciplina;
  periodo: PeriodoDisciplina;
  modalidade: ModalidadeDisciplina;
  codigo: number; // único
  cor: string; // hex, uma das CORES_DISCIPLINA
  cursoId: number; // FK -> Curso.id
  tipoSala: TipoSala;
  status: StatusDisciplina;
}

// Payload usado no cadastro/edição (sem id)
export type DisciplinaPayload = Omit<Disciplina, 'id'>;
