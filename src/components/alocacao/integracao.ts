import { api, ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import type { AlocacaoRequest, AlocacaoResponse, DisciplinaResponse, ProfessorDisciplinaResponse, ProfessorResponse, QuadroHorarioResponse, SalaResponse, PageResponse, TurmaResponse } from "@/types/api";
import type { Aula, DiaSemana, Discipline, Grade, Horario, Sala } from "./tipos";

type Motor = { quadroHorario: { id: number }; blocos: { id: number; horaInicio: string; horaFim: string }[]; turmas: { id: number; codigo: string }[] };
type Sugestao = { sala: { id: number }; diaSemana: string; blocoHorario: { id: number } };
type Sugestoes = { sugestoes: Sugestao[]; mensagem?: string; motivo?: string };
const lista = <T,>(value: PageResponse<T> | T[]): T[] => Array.isArray(value) ? value : value.content;
async function todasPaginas<T>(endpoint: string): Promise<T[]> {
  const itens: T[] = [];
  let pagina = 0;
  while (true) {
    const resposta = await api.get<PageResponse<T> | T[]>(endpoint, { page: pagina, size: 100 });
    if (Array.isArray(resposta)) return resposta;
    itens.push(...resposta.content);
    if (++pagina >= resposta.totalPages) return itens;
  }
}
const tempo = (value: string) => value.slice(0, 5);
const dias: Record<DiaSemana, string> = { segunda: "SEGUNDA", terca: "TERÇA", quarta: "QUARTA", quinta: "QUINTA", sexta: "SEXTA", sabado: "SÁBADO" };
const diaVisual = (value: string): DiaSemana | undefined => (Object.keys(dias) as DiaSemana[]).find(key => dias[key].normalize("NFD").replace(/[\u0300-\u036f]/g, "") === value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
export function erroAlocacao(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409 && error.message) return error.message;
    return ({ 400: "Dados inválidos para esta operação.", 401: "Sua sessão expirou. Entre novamente.", 403: "Você não tem permissão para esta operação.", 404: "Os dados solicitados não foram encontrados." } as Record<number, string>)[error.status] ?? "Não foi possível concluir a operação. Tente novamente.";
  }
  return error instanceof Error && error.message.startsWith("ALOCACAO:") ? error.message.slice(9) : "Não foi possível conectar ao serviço. Tente novamente.";
}
export async function carregarDados(quadroId?: number) {
  const [quadros, disciplinas, salas, professores, vinculos] = await Promise.all([
    quadroId ? api.get<QuadroHorarioResponse>(`/quadros-horarios/${quadroId}`).then(q => [q]) : api.get<PageResponse<QuadroHorarioResponse> | QuadroHorarioResponse[]>("/quadros-horarios", { size: 1000 }),
    todasPaginas<DisciplinaResponse>("/disciplinas"),
    todasPaginas<SalaResponse>("/salas"),
    todasPaginas<ProfessorResponse>("/professores"),
    todasPaginas<ProfessorDisciplinaResponse>("/professores-disciplinas"),
  ]);
  const ds: Discipline[] = lista(disciplinas).map(d => {
    const ids = new Set(lista(vinculos).filter(v => v.disciplinaId === d.id).map(v => v.professorId));
    const opcoes = lista(professores).filter(p => ids.has(p.id) && p.status === "ATIVO").map(p => ({ id: p.id, nome: p.nome }));
    return { id: String(d.id), disciplina: d.nome, cor: d.cor, professor: opcoes.length ? "Selecione o professor" : "Sem professor vinculado", professores: opcoes, sala: "" };
  });
  const ss: Sala[] = lista(salas).map(s => ({ id: String(s.id), nome: s.codigo, capacidade: s.capacidade, recursos: [] }));
  const grades = (await Promise.all(lista(quadros).map(async quadro => {
    if (!quadro.turma || quadro.status !== "ATIVO") return [];
    const turmaDetalhe = await api.get<TurmaResponse>(`/turmas/${quadro.turma.id}`);
    const motor = await api.get<Motor>(`/motor-quadro/quadros/${quadro.id}`);
    const alocacoes = lista(await api.get<PageResponse<AlocacaoResponse> | AlocacaoResponse[]>("/alocacoes", { id_quadro_horario: quadro.id, size: 1000 }));
    const blocos = motor.blocos.map(b => ({ id: b.id, inicio: tempo(b.horaInicio), fim: tempo(b.horaFim) }));
    return motor.turmas.map(turma => ({ id: `${quadro.id}:${turma.id}`, quadroId: quadro.id, cursoId: quadro.curso.id, turmaId: turma.id, turma: turma.codigo, versao: quadro.versao, dataCriacao: quadro.dataCriacao.slice(0, 10), curso: quadro.curso.nome, periodoLetivo: `${quadro.periodoAtividadeQuadro.periodo}º período de ${quadro.periodoAtividadeQuadro.ano}`, blocos, horarios: blocos.map(({inicio, fim}) => ({inicio, fim})), intervalos: [], disciplinaIds: lista(disciplinas).filter(d => d.curso.id === quadro.curso.id && d.periodo === turmaDetalhe.periodo).map(d => String(d.id)), salaIds: ss.map(s => s.id), aulas: alocacoes.filter(a => a.turma.id === turma.id).flatMap(a => { const dia = diaVisual(a.diaSemana); if (!dia) return []; return [{ id: String(a.id), disciplinaId: String(a.disciplina.id), salaId: String(a.sala.id), dia, inicio: tempo(a.blocoHorario.horaInicio), fim: tempo(a.blocoHorario.horaFim), disciplina: a.disciplina.nome, professor: a.professor?.nome ?? "Professor não vinculado", professorId: a.professor?.id, sala: a.sala.codigo, cor: a.disciplina.cor }]; }) } satisfies Grade));
  }))).flat();
  return { grades, disciplinas: ds, salas: ss };
}
function dados(grade: Grade, disciplina: Discipline, salaId: string, dia: DiaSemana, horario: Horario) {
  const bloco = grade.blocos?.find(b => b.inicio === horario.inicio && b.fim === horario.fim);
  if (!disciplina.professorId) throw new Error("ALOCACAO:A disciplina não possui professor vinculado.");
  if (!bloco?.id || !grade.turmaId || !grade.quadroId || !Number(salaId)) throw new Error("ALOCACAO:Não foi possível identificar a turma, sala ou horário.");
  return { turma: { id: grade.turmaId }, disciplina: { id: Number(disciplina.id) }, sala: { id: Number(salaId) }, professor: { id: disciplina.professorId }, diaSemana: dias[dia], horario: { id: bloco.id }, quadroHorario: { id: grade.quadroId } };
}
export async function validar(grade: Grade, disciplina: Discipline, salaId: string, dia: DiaSemana, horario: Horario, alocacaoId?: string) {
  const payload = dados(grade, disciplina, salaId, dia, horario);
  const idExistente = alocacaoId && /^\d+$/.test(alocacaoId) ? Number(alocacaoId) : undefined;
  const resultado = await api.post<{ valido: boolean; mensagem: string }>("/alocacoes/validar-carga-horaria", { professor: payload.professor, diaSemana: payload.diaSemana, horario: payload.horario, alocacaoId: idExistente });
  if (resultado.valido) return { valido: true, mensagem: resultado.mensagem, sugestoes: [] as Sugestao[] };
  try {
    const sugestoes = await api.post<Sugestoes>("/alocacoes/sugestoes", { ...payload, alocacaoId: idExistente });
    return { valido: false, mensagem: resultado.mensagem, sugestoes: sugestoes.sugestoes ?? [] };
  } catch {
    return { valido: false, mensagem: resultado.mensagem, sugestoes: [] as Sugestao[] };
  }
}
export function interpretarSugestao(grade: Grade, sugestao: Sugestao) {
  const dia = diaVisual(sugestao.diaSemana);
  const bloco = grade.blocos?.find(b => b.id === sugestao.blocoHorario?.id);
  const salaId = sugestao.sala?.id;
  if (!dia || !bloco || !salaId) return null;
  return { dia, horario: { inicio: bloco.inicio, fim: bloco.fim }, salaId: String(salaId) };
}
export async function salvarGrade(grade: Grade, aulas: Aula[], disciplinas: Discipline[]) {
  const usuarioId = authService.getUser()?.id;
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) throw new Error("ALOCACAO:Usuário autenticado não identificado. Entre novamente.");
  const antigos = grade.aulas;
  const request = (a: Aula): AlocacaoRequest => { const disciplina = disciplinas.find(d => d.id === a.disciplinaId); if (!disciplina) throw new Error("ALOCACAO:Disciplina não encontrada."); const { horario, ...resto } = dados(grade, { ...disciplina, professorId: a.professorId }, a.salaId, a.dia, a); return { ...resto, diaSemana: resto.diaSemana as AlocacaoRequest["diaSemana"], blocoHorario: horario, usuarioAlteracao: { id: usuarioId } }; };
  const removidas = antigos.filter(a => !aulas.some(b => b.id === a.id));
  const novas = aulas.filter(a => !antigos.some(b => b.id === a.id)).map(request);
  const alteradas = aulas.flatMap(a => { const anterior = antigos.find(b => b.id === a.id); return anterior && (anterior.dia !== a.dia || anterior.inicio !== a.inicio || anterior.fim !== a.fim || anterior.salaId !== a.salaId || anterior.disciplinaId !== a.disciplinaId || anterior.professorId !== a.professorId) ? [{ id: a.id, payload: request(a) }] : []; });
  for (const a of removidas) await api.delete(`/alocacoes/${a.id}`);
  for (const a of alteradas) await api.put(`/alocacoes/${a.id}`, a.payload);
  if (novas.length) await api.post("/alocacoes/lote", novas);
}
export async function exportarGrade(grade: Grade) {
  if (!grade.quadroId) throw new Error("ALOCACAO:Não foi possível identificar o quadro selecionado.");
  const blob = await api.getBlob(`/motor-quadro/quadros/${grade.quadroId}/exportar/pdf`);
  if (!(blob instanceof Blob) || !blob.size || blob.type.split(";")[0] !== "application/pdf") {
    throw new Error("ALOCACAO:O serviço não retornou um PDF válido. Tente novamente.");
  }
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `quadro-horario-${grade.quadroId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
