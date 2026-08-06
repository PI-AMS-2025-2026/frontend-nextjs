import { Curso, CursoPayload } from '@/models/curso';

/**
 * Service de Cursos.
 *
 * Este é um mock persistido em localStorage (só pra sobreviver a um F5 durante os testes). Ao integrar com API real,
 * troque o corpo das funções por chamadas fetch, mantendo as assinaturas.
 *
 * IMPORTANTE: não existe função de excluir. A issue #78 definiu que cursos
 * só podem ser ativados/inativados (nunca removidos) — então "excluir" aqui
 * é, na prática, editar o status para 'inativo'.
 */

const STORAGE_KEY = 'cursos:mock-data';
const SIMULATED_DELAY = 400;

function gerarMock(): Curso[] {
  const base: Array<Omit<Curso, 'id'>> = [
    { nome: 'Análise e Desenvolvimento de Sistemas', periodicidade: 'Semestral', duracao: '2 anos', status: 'ativo' },
    { nome: 'Gestão Empresarial', periodicidade: 'Semestral', duracao: '2 anos', status: 'inativo' },
    { nome: 'Logística', periodicidade: 'Semestral', duracao: '2 anos', status: 'ativo' },
    { nome: 'Marketing', periodicidade: 'Semestral', duracao: '2 anos', status: 'inativo' },
    { nome: 'Sistemas para Internet', periodicidade: 'Semestral', duracao: '2 anos', status: 'ativo' },
    { nome: 'Gestão da Produção Industrial', periodicidade: 'Semestral', duracao: '2 anos', status: 'inativo' },
  ];

  return base.map((item, index) => ({ id: index + 1, ...item }));
}

function carregarEstadoInicial(): Curso[] {
  if (typeof window === 'undefined') return gerarMock();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Curso[];
  } catch {
    // JSON corrompido — ignora e recria
  }
  return gerarMock();
}

let cursos: Curso[] = carregarEstadoInicial();

function persistir(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cursos));
  } catch {
    // localStorage indisponível — ignora
  }
}

/**
 * "Ouvintes" chamados quando um curso é inativado. O disciplinaService se
 * registra aqui (veja o final de disciplinaService.ts) para inativar em
 * cascata as disciplinas vinculadas. Isso evita que este arquivo precise
 * importar disciplinaService diretamente — quem depende de quem fica claro:
 * Disciplina conhece Curso, Curso não precisa conhecer Disciplina.
 */
type OuvinteInativacao = (cursoId: number) => void;
const ouvintesDeInativacao: OuvinteInativacao[] = [];

export function aoInativarCurso(callback: OuvinteInativacao): void {
  ouvintesDeInativacao.push(callback);
}

function proximoId(): number {
  return cursos.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY));
}

/** Lista todos os cursos cadastrados */
export async function listar(): Promise<Curso[]> {
  return delay([...cursos]);
}

/** Cria um novo curso */
export async function criar(payload: CursoPayload): Promise<Curso> {
  const novoCurso: Curso = { id: proximoId(), ...payload };
  cursos = [...cursos, novoCurso];
  persistir();
  return delay(novoCurso);
}

/** Edita um curso existente (inclui trocar o status ativo/inativo) */
export async function editar(id: number, payload: CursoPayload): Promise<Curso> {
  const atual = cursos.find((c) => c.id === id);
  if (!atual) {
    throw new Error('Curso não encontrado.');
  }

  const atualizado: Curso = { id, ...payload };
  cursos = cursos.map((c) => (c.id === id ? atualizado : c));
  persistir();

  // Dispara a cascata só na transição ativo -> inativo
  if (atual.status === 'ativo' && payload.status === 'inativo') {
    ouvintesDeInativacao.forEach((cb) => cb(id));
  }

  return delay(atualizado);
}
