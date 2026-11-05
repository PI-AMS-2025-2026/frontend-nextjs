import { api, ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import type { AlocacaoRequest, AlocacaoResponse, DisciplinaResponse, ProfessorDisciplinaResponse, ProfessorResponse, QuadroHorarioResponse, SalaResponse, PageResponse } from "@/types/api";
import type { Aula, DiaSemana, Discipline, Grade, Horario, Sala } from "./tipos";

type Motor = { quadroHorario: { id: number }; blocos: { id: number; horaInicio: string; horaFim: string }[]; turmas: { id: number; codigo: string }[] };
type Sugestao = { sala: { id: number }; diaSemana: string; blocoHorario: { id: number } };
type Sugestoes = { sugestoes: Sugestao[]; mensagem?: string };
const lista = <T,>(value: PageResponse<T> | T[]): T[] => Array.isArray(value) ? value : value.content;
const tempo = (value: string) => value.slice(0, 5);
const dias: Record<DiaSemana, string> = { segunda: "SEGUNDA", terca: "TERÇA", quarta: "QUARTA", quinta: "QUINTA", sexta: "SEXTA", sabado: "SÁBADO" };
const diaVisual = (value: string): DiaSemana | undefined => (Object.keys(dias) as DiaSemana[]).find(key => dias[key].normalize("NFD").replace(/[\u0300-\u036f]/g, "") === value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
export function erroAlocacao(error: unknown) {
  if (error instanceof ApiError) return ({ 400: "Dados inválidos para esta operação.", 401: "Sua sessão expirou. Entre novamente.", 403: "Você não tem permissão para esta operação.", 404: "Os dados solicitados não foram encontrados.", 409: "Há um conflito com outra alocação. Atualize a grade e tente novamente." } as Record<number, string>)[error.status] ?? "Não foi possível concluir a operação. Tente novamente.";
  return error instanceof Error && error.message.startsWith("ALOCACAO:") ? error.message.slice(9) : "Não foi possível conectar ao serviço. Tente novamente.";
}
export async function carregarDados() {
  const [quadros, disciplinas, salas, professores, vinculos] = await Promise.all([
    api.get<PageResponse<QuadroHorarioResponse> | QuadroHorarioResponse[]>("/quadros-horarios", { size: 1000 }),
    api.get<PageResponse<DisciplinaResponse> | DisciplinaResponse[]>("/disciplinas", { size: 1000 }),
    api.get<PageResponse<SalaResponse> | SalaResponse[]>("/salas", { size: 1000 }),
    api.get<PageResponse<ProfessorResponse> | ProfessorResponse[]>("/professores", { size: 1000 }),
    api.get<PageResponse<ProfessorDisciplinaResponse> | ProfessorDisciplinaResponse[]>("/professores-disciplinas", { size: 1000 }),
  ]);
  const ds: Discipline[] = lista(disciplinas).map(d => { const vinculo = lista(vinculos).find(v => v.disciplinaId === d.id); const professor = lista(professores).find(p => p.id === vinculo?.professorId); return { id: String(d.id), disciplina: d.nome, cor: d.cor, professor: professor?.nome ?? "Professor não vinculado", professorId: professor?.id, sala: "" }; });
  const ss: Sala[] = lista(salas).map(s => ({ id: String(s.id), nome: s.codigo, capacidade: s.capacidade, recursos: [] }));
  const grades = (await Promise.all(lista(quadros).map(async quadro => {
    const motor = await api.get<Motor>(`/motor-quadro/cursos/${quadro.curso.id}`);
    // O motor retorna apenas o quadro atual do curso; não atribuir suas turmas a outra versão.
    if (motor.quadroHorario.id !== quadro.id) return [];
    const alocacoes = lista(await api.get<PageResponse<AlocacaoResponse> | AlocacaoResponse[]>("/alocacoes", { id_quadro_horario: quadro.id, size: 1000 }));
    const blocos = motor.blocos.map(b => ({ id: b.id, inicio: tempo(b.horaInicio), fim: tempo(b.horaFim) }));
    return motor.turmas.map(turma => ({ id: `${quadro.id}:${turma.id}`, quadroId: quadro.id, cursoId: quadro.curso.id, turmaId: turma.id, turma: turma.codigo, versao: quadro.versao, dataCriacao: quadro.dataCriacao.slice(0, 10), curso: quadro.curso.nome, periodoLetivo: `${quadro.periodoAtividadeQuadro.periodo}º período de ${quadro.periodoAtividadeQuadro.ano}`, blocos, horarios: blocos.map(({inicio, fim}) => ({inicio, fim})), intervalos: [], disciplinaIds: lista(disciplinas).filter(d => d.curso.id === quadro.curso.id).map(d => String(d.id)), salaIds: ss.map(s => s.id), aulas: alocacoes.filter(a => a.turma.id === turma.id).flatMap(a => { const dia = diaVisual(a.diaSemana); if (!dia) return []; return [{ id: String(a.id), disciplinaId: String(a.disciplina.id), salaId: String(a.sala.id), dia, inicio: tempo(a.blocoHorario.horaInicio), fim: tempo(a.blocoHorario.horaFim), disciplina: a.disciplina.nome, professor: a.professor?.nome ?? "Professor não vinculado", sala: a.sala.codigo, cor: a.disciplina.cor }]; }) } satisfies Grade));
  }))).flat();
  return { grades, disciplinas: ds, salas: ss };
}
function dados(grade: Grade, disciplina: Discipline, salaId: string, dia: DiaSemana, horario: Horario) {
  const bloco = grade.blocos?.find(b => b.inicio === horario.inicio && b.fim === horario.fim);
  if (!disciplina.professorId) throw new Error("ALOCACAO:A disciplina não possui professor vinculado.");
  if (!bloco?.id || !grade.turmaId || !grade.quadroId || !Number(salaId)) throw new Error("ALOCACAO:Não foi possível identificar a turma, sala ou horário.");
  return { turma: { id: grade.turmaId }, disciplina: { id: Number(disciplina.id) }, sala: { id: Number(salaId) }, professor: { id: disciplina.professorId }, diaSemana: dias[dia], horario: { id: bloco.id }, quadroHorario: { id: grade.quadroId } };
}
export async function validar(grade: Grade, disciplina: Discipline, salaId: string, dia: DiaSemana, horario: Horario) {
  const payload = dados(grade, disciplina, salaId, dia, horario);
  const resultado = await api.post<{ valido: boolean; mensagem: string }>("/alocacoes/validar-carga-horaria", { professor: payload.professor, diaSemana: payload.diaSemana, horario: payload.horario });
  if (resultado.valido) return { valido: true, mensagem: resultado.mensagem, sugestoes: [] as Sugestao[] };
  const sugestoes = await api.post<Sugestoes>("/alocacoes/sugestoes", payload);
  return { valido: false, mensagem: resultado.mensagem, sugestoes: sugestoes.sugestoes ?? [] };
}
export function interpretarSugestao(grade: Grade, sugestao: Sugestao) {
  const dia = diaVisual(sugestao.diaSemana); const horario = grade.blocos?.find(b => b.id === sugestao.blocoHorario?.id);
  return dia && horario ? { dia, horario, salaId: String(sugestao.sala.id) } : null;
}
export async function salvarGrade(grade: Grade, aulas: Aula[], disciplinas: Discipline[]) {
  const usuarioId = authService.getUser()?.id;
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) throw new Error("ALOCACAO:Usuário autenticado não identificado. Entre novamente.");
  const antigos = grade.aulas;
  const request = (a: Aula): AlocacaoRequest => { const disciplina = disciplinas.find(d => d.id === a.disciplinaId); if (!disciplina) throw new Error("ALOCACAO:Disciplina não encontrada."); const { horario, ...resto } = dados(grade, disciplina, a.salaId, a.dia, a); return { ...resto, diaSemana: resto.diaSemana as AlocacaoRequest["diaSemana"], blocoHorario: horario, justificativaAlteracao: "Atualização de alocação", usuarioAlteracao: { id: usuarioId } }; };
  const removidas = antigos.filter(a => !aulas.some(b => b.id === a.id));
  const novas = aulas.filter(a => !antigos.some(b => b.id === a.id)).map(request);
  const alteradas = aulas.flatMap(a => { const anterior = antigos.find(b => b.id === a.id); return anterior && (anterior.dia !== a.dia || anterior.inicio !== a.inicio || anterior.fim !== a.fim || anterior.salaId !== a.salaId || anterior.disciplinaId !== a.disciplinaId) ? [{ id: a.id, payload: request(a) }] : []; });
  for (const a of removidas) await api.delete(`/alocacoes/${a.id}`);
  for (const a of alteradas) await api.put(`/alocacoes/${a.id}`, a.payload);
  if (novas.length) await api.post("/alocacoes/lote", novas);
}
export async function exportarGrade(grade: Grade) { const blob = await api.getBlob(`/motor-quadro/cursos/${grade.cursoId}/exportar/pdf`); if (!(blob instanceof Blob)) throw new Error("Resposta inválida"); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `quadro-horario-${grade.cursoId}.pdf`; link.click(); URL.revokeObjectURL(url); }
