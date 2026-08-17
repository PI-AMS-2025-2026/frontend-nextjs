export type StatusGrade = "ativo" | "inativo";

export interface GradeHoraria {
  id: number;
  versao: number; // exibido com zero à esquerda (01, 02...)
  dataCriacao: string; // formato yyyy-mm-dd (o que o <input type="date"> usa)
  cursoNome: string; // mock — nome do curso vinculado (issue não pede FK real ainda)
  periodoLetivo: string; // ex: "1º Semestre de 2024"
  periodo: string; // turno (Matutino/Vespertino/Noturno) — só aparece na Visualização, não é editável no form
  status: StatusGrade;
}

// Payload de cadastro/edição — não inclui "periodo" porque esse campo não
// existe no formulário (só é exibido, mockado, na tela de Visualização).
export type GradeHorariaPayload = Omit<GradeHoraria, "id" | "periodo">;

/** Mock de cursos (issue #combinada: lista fixa só pra essa tela por enquanto) */
export const CURSOS_MOCK = ["AMS-ADS", "GTI", "Meio Ambiente", "Administração", "Mecatronica"];

/** Mock de períodos letivos disponíveis pro select */
export const PERIODOS_LETIVOS_MOCK = [
  "1º Semestre de 2024",
  "2º Semestre de 2024",
  "1º Semestre de 2025",
  "2º Semestre de 2025",
];

/** Formata a versão com zero à esquerda, ex: 1 -> "01" */
export function formatarVersao(versao: number): string {
  return String(versao).padStart(2, "0");
}

/** Formata data yyyy-mm-dd (formato do <input type="date">) pra dd/mm/aaaa */
export function formatarData(dataIso: string): string {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("-");
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}