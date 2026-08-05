import { Horario, HorarioPayload } from '@/models/horario';

/**
 * Serviço responsável pelas operações de CRUD de Horários.
 *
 * A implementação atual utiliza dados mockados, persistidos no `localStorage`
 * do navegador (apenas para o mock não "perder" as alterações a cada F5
 * durante o desenvolvimento/testes). Isso substitui um backend real.
 *
 * Para integrar com uma API real, basta substituir o corpo de cada função por
 * uma chamada `fetch` (ou seu client HTTP preferido) para os endpoints
 * correspondentes, por exemplo:
 *
 *   export async function listar(): Promise<Horario[]> {
 *     const res = await fetch('/api/horarios');
 *     return res.json();
 *   }
 *
 * mantendo as mesmas assinaturas (Promise<Horario[]>, Promise<Horario>, etc.)
 * para que os componentes não precisem ser alterados. Quando isso acontecer,
 * pode remover toda a parte de `localStorage` abaixo — ela existe só porque
 * este mock não tem persistência real.
 */

const STORAGE_KEY = 'horarios:mock-data';

// Latência simulada para os modais de loading/sucesso ficarem realistas
const SIMULATED_DELAY = 400;

/** Calcula a duração (HH:mm) entre dois horários no formato HH:mm. */
export function calcularDuracao(horaInicio: string, horaFim: string): string {
  if (!horaInicio || !horaFim) {
    return '';
  }
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFim, mFim] = horaFim.split(':').map(Number);
  if ([hIni, mIni, hFim, mFim].some((n) => Number.isNaN(n))) {
    return '';
  }

  const minutosIni = hIni * 60 + mIni;
  const minutosFim = hFim * 60 + mFim;
  const diff = minutosFim - minutosIni;

  if (diff <= 0) {
    return '';
  }

  const horas = Math.floor(diff / 60);
  const minutos = diff % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function gerarMock(): Horario[] {
  const base: Array<Omit<Horario, 'id' | 'duracao'>> = [
    { horaInicio: '08:00', horaFim: '09:40' },
    { horaInicio: '09:40', horaFim: '10:00' },
    { horaInicio: '10:00', horaFim: '11:40' },
    { horaInicio: '13:20', horaFim: '15:00' },
    { horaInicio: '15:10', horaFim: '16:50' },
    { horaInicio: '17:00', horaFim: '18:40' },
    { horaInicio: '19:00', horaFim: '20:40' },
    { horaInicio: '20:50', horaFim: '22:30' },
    { horaInicio: '22:30', horaFim: '22:50' },
    { horaInicio: '00:00', horaFim: '01:40' },
  ];

  // Duplica a base para simular ~30 registros e testar a paginação
  const registros: Horario[] = [];
  let id = 1;
  for (let volta = 0; volta < 3; volta++) {
    for (const item of base) {
      registros.push({
        id: id++,
        ...item,
        duracao: calcularDuracao(item.horaInicio, item.horaFim),
      });
    }
  }
  return registros;
}

/** Lê o estado salvo no localStorage, se existir; senão gera o mock inicial. */
function carregarEstadoInicial(): Horario[] {
  if (typeof window === 'undefined') {
    // Executando no servidor (SSR) — não há localStorage, usa o mock padrão.
    return gerarMock();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Horario[];
    }
  } catch {
    // Se o JSON salvo estiver corrompido, ignora e recria o mock.
  }
  return gerarMock();
}

// Estado em memória do mock (inicializado a partir do localStorage, quando existente)
let horarios: Horario[] = carregarEstadoInicial();

/** Salva o estado atual no localStorage para sobreviver a um refresh da página. */
function persistir(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(horarios));
  } catch {
    // Armazenamento indisponível (modo privado, quota excedida, etc.) — ignora silenciosamente.
  }
}

function existeDuplicado(payload: HorarioPayload, ignorarId?: number): boolean {
  return horarios.some(
    (h) => h.id !== ignorarId && h.horaInicio === payload.horaInicio && h.horaFim === payload.horaFim
  );
}

function proximoId(): number {
  return horarios.reduce((max, h) => Math.max(max, h.id), 0) + 1;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY));
}

/** Lista todos os horários cadastrados */
export async function listar(): Promise<Horario[]> {
  // API real: const res = await fetch('/api/horarios'); return res.json();
  return delay([...horarios]);
}

/** Cria um novo horário */
export async function criar(payload: HorarioPayload): Promise<Horario> {
  if (existeDuplicado(payload)) {
    throw new Error('Já existe um horário cadastrado com esse início e fim.');
  }

  const novoHorario: Horario = {
    id: proximoId(),
    ...payload,
    duracao: calcularDuracao(payload.horaInicio, payload.horaFim),
  };

  // API real: const res = await fetch('/api/horarios', { method: 'POST', body: JSON.stringify(payload) });
  horarios = [...horarios, novoHorario];
  persistir();
  return delay(novoHorario);
}

/** Edita um horário existente */
export async function editar(id: number, payload: HorarioPayload): Promise<Horario> {
  if (existeDuplicado(payload, id)) {
    throw new Error('Já existe um horário cadastrado com esse início e fim.');
  }

  const index = horarios.findIndex((h) => h.id === id);
  if (index === -1) {
    throw new Error('Horário não encontrado.');
  }

  const atualizado: Horario = {
    id,
    ...payload,
    duracao: calcularDuracao(payload.horaInicio, payload.horaFim),
  };

  // API real: await fetch(`/api/horarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  horarios = horarios.map((h) => (h.id === id ? atualizado : h));
  persistir();
  return delay(atualizado);
}

/** Exclui um horário pelo id */
export async function excluir(id: number): Promise<void> {
  // API real: await fetch(`/api/horarios/${id}`, { method: 'DELETE' });
  horarios = horarios.filter((h) => h.id !== id);
  persistir();
  return delay(undefined);
}

/** Exclui vários horários de uma vez (usado na seleção múltipla) */
export async function excluirVarios(ids: number[]): Promise<void> {
  // API real: await fetch('/api/horarios/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  const idsSet = new Set(ids);
  horarios = horarios.filter((h) => !idsSet.has(h.id));
  persistir();
  return delay(undefined);
}
