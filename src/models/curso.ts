export type Periodicidade = 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual';

export type StatusCurso = 'ativo' | 'inativo';

export interface Curso {
  id: number;
  nome: string;
  periodicidade: Periodicidade;
  duracao: string; // texto livre, ex: "3 anos" (é assim que aparece no protótipo)
  status: StatusCurso;
}

// Payload usado no cadastro/edição (sem id)
export type CursoPayload = Omit<Curso, 'id'>;
