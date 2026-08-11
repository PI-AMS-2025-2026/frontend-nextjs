export type Id = number;
export type DateTime = string;
export type DateOnly = string;

export type Status = "ATIVO" | "INATIVO";
export type TipoUsuario = "ADMINISTRADOR" | "COORDENADOR";
export type DiaSemana =
  | "DOMINGO"
  | "SEGUNDA"
  | "TERCA"
  | "QUARTA"
  | "QUINTA"
  | "SEXTA"
  | "SABADO";

export interface LongDTO {
  id: Id;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CursoRequest {
  nome: string;
  periodicidade: string;
  status: Status;
  duracao: number;
}
export interface CursoResponse extends CursoRequest {
  id: Id;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha?: string;
  status: Status;
  tipoUsuario: TipoUsuario;
  curso?: LongDTO;
}
export interface UsuarioResponse {
  id: Id;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  status: Status;
  curso?: CursoResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface TurmaRequest {
  periodo: number;
  ano: number;
  numeroAlunos: number;
  curso: LongDTO;
}
export interface TurmaResponse {
  id: Id;
  codigo: string;
  periodo: number;
  ano: number;
  numeroAlunos: number;
  curso: CursoResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface TipoSalaRequest { nome: string }
export interface TipoSalaResponse { id: Id; nome: string }
export interface TipoRecursoRequest { nome: string }
export interface TipoRecursoResponse { id: Id; nome: string }

export interface SalaRequest {
  codigo: string;
  capacidade: number;
  tipoSala: LongDTO;
}
export interface SalaResponse {
  id: Id;
  codigo: string;
  capacidade: number;
  tipoSala: TipoSalaResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface RecursoRequest {
  nome: string;
  tipoRecurso: LongDTO;
}
export interface RecursoResponse {
  id: Id;
  nome: string;
  tipo: TipoRecursoResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface RecursoSalaRequest {
  sala: LongDTO;
  recurso: LongDTO;
  quantidade: number;
}
export interface RecursoSalaResponse {
  id: Id;
  sala: SalaResponse;
  recurso: RecursoResponse;
  quantidade: number;
}

export interface PeriodoAtividadeQuadroRequest {
  ano: number;
  periodo: number;
  dataInicio: DateOnly;
  dataFim: DateOnly;
  status: Status;
}
export interface PeriodoAtividadeQuadroResponse extends PeriodoAtividadeQuadroRequest {
  idPeriodoAtividadeQuadro: Id;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface QuadroHorarioRequest {
  versao: number;
  status: Status;
  curso: LongDTO;
  PeriodoAtividadeQuadro: LongDTO;
}
export interface QuadroHorarioResponse {
  id: Id;
  versao: number;
  dataCriacao: DateTime;
  status: Status;
  curso: CursoResponse;
  periodoAtividadeQuadro: PeriodoAtividadeQuadroResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface ProfessorRequest {
  nome: string;
  email: string;
  cidade?: string;
  status: Status;
}
export interface ProfessorResponse extends ProfessorRequest {
  id: Id;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface DisciplinaRequest {
  nome: string;
  cargaHoraria: number;
  tipoDisciplina: string;
  periodo: number;
  modalidade: string;
  codDisciplina: string;
  cor?: string;
  curso: LongDTO;
  tipoSala: LongDTO;
}
export interface DisciplinaResponse {
  id: Id;
  nome: string;
  cargaHoraria: number;
  tipoDisciplina: string;
  periodo: number;
  modalidade: string;
  codDisciplina: string;
  cor?: string;
  curso: CursoResponse;
  tipoSala: TipoSalaResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface ProfessorDisciplinaRequest {
  professor: LongDTO;
  disciplina: LongDTO;
}
export interface ProfessorDisciplinaResponse {
  id: Id;
  professor: ProfessorResponse;
  disciplina: DisciplinaResponse;
}

export interface BlocoHorarioRequest {
  horaInicio: string;
  horaFim: string;
}
export interface BlocoHorarioResponse extends BlocoHorarioRequest {
  id: Id;
  duracao: number;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface DisponibilidadeProfessorRequest {
  professor: LongDTO;
  diaSemana: LongDTO;
  blocoHorario: LongDTO;
}
export interface DisponibilidadeProfessorResponse {
  id: Id;
  usuario: ProfessorResponse;
  diaSemana: DiaSemana;
  blocoHorario: BlocoHorarioResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface AlocacaoRequest {
  turma: LongDTO;
  disciplina: LongDTO;
  sala: LongDTO;
  professor: LongDTO;
  diaSemana: DiaSemana;
  horario: LongDTO;
  quadroHorario: LongDTO;
  justificativaAlteracao?: string;
  usuarioAlteracao: LongDTO;
}
export interface AlocacaoResponse {
  id: Id;
  turma: TurmaResponse;
  disciplina: DisciplinaResponse;
  sala: SalaResponse;
  professor: ProfessorResponse;
  diaSemana: DiaSemana;
  blocoHorario: BlocoHorarioResponse;
  quadroHorario: QuadroHorarioResponse;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface LoginRequest {
  email: string;
  senha: string;
}
export interface LoginResponse { token: string }

export interface HistoricoVersaoAlocacaoResponse {
  id: Id;
  dataAlteracao: DateOnly;
  justificativa: string;
  campoAlterado: string;
  valorAntigo: string;
  valorNovo: string;
  alocacao: AlocacaoResponse;
  usuario: UsuarioResponse;
}

export interface ListUsuarioParams {
  nome?: string;
  email?: string;
  status?: Status;
  tipo_usuario?: TipoUsuario;
  tipo_usuario_nome?: string;
  page?: number;
  size?: number;
}
export interface ListTurmaParams { curso?: Id; ano?: number; periodo?: number; codigo?: string; page?: number; size?: number }
export interface ListSalaParams { tipo_sala?: Id; capacidade?: number; page?: number; size?: number }
export interface ListRecursoParams { nome?: string; tipo_recurso?: Id; page?: number; size?: number }
export interface ListRecursoSalaParams { salaId?: Id; recursoId?: Id; page?: number; size?: number }
export interface ListQuadroHorarioParams { curso?: Id; periodo_atividade_quadro?: Id; status?: Status; page?: number; size?: number }
export interface ListProfessorParams { nome?: string; email?: string; cidade?: string; status?: Status; page?: number; size?: number }
export interface ListProfessorDisciplinaParams { usuario?: Id; disciplina?: Id; page?: number; size?: number }
export interface ListPeriodoAtividadeQuadroParams { ano?: number; periodo?: number; status?: Status; dataInicio?: DateOnly; dataFim?: DateOnly; page?: number; size?: number }
export interface ListDisponibilidadeProfessorParams { professor?: Id; dia_semana?: DiaSemana; bloco_horario?: Id; page?: number; size?: number }
export interface ListDisciplinaParams { nome?: string; curso?: Id; tipo_sala?: Id; page?: number; size?: number }
export interface ListCursoParams { nome?: string; periodicidade?: string; status?: Status; duracao?: number; page?: number; size?: number }
export interface ListBlocoHorarioParams { hora_inicio?: string; hora_fim?: string; duracao?: number; page?: number; size?: number }
export interface ListAlocacaoParams { turma?: Id; disciplina?: Id; sala?: Id; usuario?: Id; dia_semana?: DiaSemana; horario?: Id; quadro_horario?: Id; page?: number; size?: number }
export interface ListHistoricoParams { alocacao?: Id; usuario?: Id; page?: number; size?: number }
