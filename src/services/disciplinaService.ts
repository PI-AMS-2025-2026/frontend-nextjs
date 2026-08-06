import { Disciplina, DisciplinaPayload } from '@/models/disciplina';
import { aoInativarCurso } from './cursoService';

/**
 * Service de Disciplinas — mesmo padrão de mock em localStorage dos outros
 * services. Ao integrar com API real, troque o corpo das funções por fetch,
 * mantendo as assinaturas.
 */

const STORAGE_KEY = 'disciplinas:mock-data';
const SIMULATED_DELAY = 400;

function gerarMock(): Disciplina[] {
  // cursoId 1 = "Análise e Desenvolvimento de Sistemas" (ver cursoService.ts)
  const base: Array<Omit<Disciplina, 'id'>> = [
    { nome: 'Algoritmos e Lógica de Programação', cargaHoraria: 80, tipo: '50/50', periodo: 'Manhã', modalidade: 'Presencial', codigo: 102, cor: '#f97316', cursoId: 1, tipoSala: 'Laboratório', status: 'ativo' },
    { nome: 'Programação Orientada a Objetos', cargaHoraria: 80, tipo: 'Prática', periodo: 'Manhã', modalidade: 'EAD', codigo: 119, cor: '#8b5cf6', cursoId: 1, tipoSala: 'Laboratório', status: 'inativo' },
    { nome: 'Desenvolvimento Web', cargaHoraria: 60, tipo: 'Prática', periodo: 'Tarde', modalidade: 'Presencial', codigo: 100, cor: '#3b82f6', cursoId: 1, tipoSala: 'Sala', status: 'inativo' },
    { nome: 'Banco de Dados', cargaHoraria: 80, tipo: '50/50', periodo: 'Manhã', modalidade: 'Presencial', codigo: 112, cor: '#14b8a6', cursoId: 1, tipoSala: 'Laboratório', status: 'ativo' },
    { nome: 'Engenharia de Software', cargaHoraria: 60, tipo: 'Teórica', periodo: 'Tarde', modalidade: 'Presencial', codigo: 145, cor: '#ec4899', cursoId: 1, tipoSala: 'Laboratório', status: 'ativo' },
    { nome: 'Redes', cargaHoraria: 80, tipo: '50/50', periodo: 'Manhã', modalidade: 'Presencial', codigo: 194, cor: '#f97316', cursoId: 1, tipoSala: 'Laboratório', status: 'ativo' },
    { nome: 'Desenvolvimento Mobile', cargaHoraria: 60, tipo: 'Teórica', periodo: 'Tarde', modalidade: 'Presencial', codigo: 111, cor: '#3b82f6', cursoId: 1, tipoSala: 'Laboratório', status: 'ativo' },
    { nome: 'Sistemas Operacionais', cargaHoraria: 60, tipo: '50/50', periodo: 'Noite', modalidade: 'EAD', codigo: 126, cor: '#22c55e', cursoId: 1, tipoSala: 'Sala', status: 'ativo' },
  ];

  // Replica a base pra simular ~30 registros e testar paginação/scroll,
  // variando o código pra não ferir a unicidade
  const registros: Disciplina[] = [];
  let id = 1;
  for (let volta = 0; volta < 4; volta++) {
    for (const item of base) {
      registros.push({ id: id++, ...item, codigo: item.codigo + volta * 1000 });
      if (registros.length >= 30) break;
    }
    if (registros.length >= 30) break;
  }
  return registros;
}

function carregarEstadoInicial(): Disciplina[] {
  if (typeof window === 'undefined') return gerarMock();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Disciplina[];
  } catch {
    // JSON corrompido — ignora e recria
  }
  return gerarMock();
}

let disciplinas: Disciplina[] = carregarEstadoInicial();

function persistir(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(disciplinas));
  } catch {
    // localStorage indisponível — ignora
  }
}

function existeCodigoDuplicado(codigo: number, ignorarId?: number): boolean {
  return disciplinas.some((d) => d.id !== ignorarId && d.codigo === codigo);
}

function proximoId(): number {
  return disciplinas.reduce((max, d) => Math.max(max, d.id), 0) + 1;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY));
}

/** Lista todas as disciplinas cadastradas */
export async function listar(): Promise<Disciplina[]> {
  return delay([...disciplinas]);
}

/** Cria uma nova disciplina */
export async function criar(payload: DisciplinaPayload): Promise<Disciplina> {
  if (existeCodigoDuplicado(payload.codigo)) {
    throw new Error('Já existe uma disciplina cadastrada com esse código.');
  }

  const nova: Disciplina = { id: proximoId(), ...payload };
  disciplinas = [...disciplinas, nova];
  persistir();
  return delay(nova);
}

/** Edita uma disciplina existente */
export async function editar(id: number, payload: DisciplinaPayload): Promise<Disciplina> {
  if (existeCodigoDuplicado(payload.codigo, id)) {
    throw new Error('Já existe uma disciplina cadastrada com esse código.');
  }

  const existe = disciplinas.some((d) => d.id === id);
  if (!existe) {
    throw new Error('Disciplina não encontrada.');
  }

  const atualizada: Disciplina = { id, ...payload };
  disciplinas = disciplinas.map((d) => (d.id === id ? atualizada : d));
  persistir();
  return delay(atualizada);
}

/**
 * Inativa em massa todas as disciplinas vinculadas a um curso.
 * Não é chamada diretamente pela tela — é registrada abaixo como "ouvinte"
 * do cursoService, então roda automaticamente sempre que um curso é
 * inativado (issue #78, critério 2).
 */
async function inativarPorCurso(cursoId: number): Promise<void> {
  let alterou = false;
  disciplinas = disciplinas.map((d) => {
    if (d.cursoId === cursoId && d.status === 'ativo') {
      alterou = true;
      return { ...d, status: 'inativo' };
    }
    return d;
  });
  if (alterou) {
    persistir();
  }
}

// Registra a cascata: sempre que cursoService inativar um curso, este
// módulo reage inativando as disciplinas correspondentes.
aoInativarCurso((cursoId) => {
  inativarPorCurso(cursoId);
});
