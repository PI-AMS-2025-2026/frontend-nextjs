import {
  HORARIOS_PADRAO,
  INTERVALOS_PADRAO,
  DIAS,
  chaveCelula,
  type Aula,
  type Discipline,
  type Grade,
  type Sala,
} from "./tipos";

// Fixtures para a demonstração. No projeto, estes dados vêm dos cadastros do administrador.
export const DISCIPLINAS_EXEMPLO: Discipline[] = [
  {
    id: "disc-1",
    disciplina: "Algoritmos e Programação",
    professor: "Ana Souza",
    cor: "#4751D5",
  },
  {
    id: "disc-2",
    disciplina: "Engenharia de Software",
    professor: "Carlos Oliveira",
    cor: "#8044C3",
  },
  {
    id: "disc-3",
    disciplina: "Banco de Dados",
    professor: "Marina Santos",
    cor: "#639F23",
  },
  {
    id: "disc-4",
    disciplina: "Matemática Discreta",
    professor: "Paulo Lima",
    cor: "#E99414",
  },
  {
    id: "disc-5",
    disciplina: "Sistemas Operacionais",
    professor: "Juliana Costa",
    cor: "#D84391",
  },
];

export const SALAS_EXEMPLO: Sala[] = [
  {
    id: "sala-1",
    nome: "Sala 01 - Laboratório de Informática",
    capacidade: 30,
    recursos: ["30 computadores", "1 televisão", "2 ventiladores"],
  },
  {
    id: "sala-5",
    nome: "Sala 05 - Sala de aula",
    capacidade: 40,
    recursos: ["40 carteiras", "1 televisão", "3 ventiladores"],
  },
  {
    id: "sala-3",
    nome: "Sala 03 - Laboratório de Informática",
    capacidade: 30,
    recursos: ["30 computadores", "1 televisão"],
  },
];

const cadastros = [
  {
    id: "grade-1",
    versao: 1,
    dataCriacao: "2024-10-10",
    curso: "GTI",
    periodoLetivo: "1º Semestre de 2024",
  },
  {
    id: "grade-2",
    versao: 1,
    dataCriacao: "2025-11-21",
    curso: "ADS",
    periodoLetivo: "2º Semestre de 2025",
  },
  {
    id: "grade-3",
    versao: 1,
    dataCriacao: "2024-09-30",
    curso: "ADM",
    periodoLetivo: "1º Semestre de 2024",
  },
  {
    id: "grade-4",
    versao: 2,
    dataCriacao: "2023-12-15",
    curso: "GTI",
    periodoLetivo: "2º Semestre de 2023",
  },
  {
    id: "grade-5",
    versao: 1,
    dataCriacao: "2025-10-21",
    curso: "ADS",
    periodoLetivo: "1º Semestre de 2025",
  },
  {
    id: "grade-6",
    versao: 2,
    dataCriacao: "2024-08-28",
    curso: "Eventos",
    periodoLetivo: "2º Semestre de 2024",
  },
  {
    id: "grade-7",
    versao: 1,
    dataCriacao: "2026-02-03",
    curso: "ADS",
    periodoLetivo: "1º Semestre de 2026",
  },
  {
    id: "grade-8",
    versao: 2,
    dataCriacao: "2026-08-04",
    curso: "GTI",
    periodoLetivo: "2º Semestre de 2026",
  },
];

export const GRADES_EXEMPLO: Grade[] = cadastros.map((grade) => ({
  ...grade,
  horarios: HORARIOS_PADRAO,
  intervalos: INTERVALOS_PADRAO,
  disciplinaIds: DISCIPLINAS_EXEMPLO.map((disciplina) => disciplina.id),
  salaIds: SALAS_EXEMPLO.map((sala) => sala.id),
  aulas: [],
}));

export const STORAGE_KEY = "fatec:alocacao:demo:v1";
type RegistroSalvo = { versao: 1; grades: Record<string, unknown> };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return !!valor && typeof valor === "object" && !Array.isArray(valor);
}

function lerRegistro(): RegistroSalvo {
  const vazio: RegistroSalvo = { versao: 1, grades: {} };
  const texto = localStorage.getItem(STORAGE_KEY);
  if (!texto) return vazio;
  const registro: unknown = JSON.parse(texto);
  return ehObjeto(registro) &&
    registro.versao === 1 &&
    ehObjeto(registro.grades)
    ? { versao: 1, grades: registro.grades }
    : vazio;
}

export function carregarAlocacoesLocais(
  grades: Grade[],
  disciplinas: Discipline[],
  salas: Sala[],
): Grade[] {
  let registro: RegistroSalvo;
  try {
    registro = lerRegistro();
  } catch {
    return grades;
  }
  return grades.map((grade) => {
    const salvas = registro.grades[grade.id];
    if (!Array.isArray(salvas)) return grade;
    const aulas: Aula[] = [];
    const ids = new Set<string>();
    const celulas = new Set<string>();
    for (const valor of salvas) {
      if (
        !ehObjeto(valor) ||
        typeof valor.id !== "string" ||
        !valor.id ||
        ids.has(valor.id)
      )
        continue;
      const disciplina = disciplinas.find(
        (item) =>
          item.id === valor.disciplinaId &&
          grade.disciplinaIds.includes(item.id),
      );
      const sala = salas.find(
        (item) => item.id === valor.salaId && grade.salaIds.includes(item.id),
      );
      const dia = DIAS.find((item) => item.key === valor.dia)?.key;
      const horario = grade.horarios.find(
        (item) => item.inicio === valor.inicio && item.fim === valor.fim,
      );
      if (!disciplina || !sala || !dia || !horario) continue;
      const chave = chaveCelula(dia, horario);
      if (celulas.has(chave)) continue;
      aulas.push({
        id: valor.id,
        disciplinaId: disciplina.id,
        salaId: sala.id,
        dia,
        ...horario,
        disciplina: disciplina.disciplina,
        professor: disciplina.professor,
        sala: sala.nome,
        cor: disciplina.cor,
      });
      ids.add(valor.id);
      celulas.add(chave);
    }
    return { ...grade, aulas };
  });
}

export async function salvarAlocacaoLocal(gradeId: string, aulas: Aula[]) {
  let registro: RegistroSalvo;
  try {
    registro = lerRegistro();
  } catch {
    registro = { versao: 1, grades: {} };
  }
  // A falha no setItem deve chegar à tela, para não mostrar um sucesso falso.
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      versao: 1,
      grades: { ...registro.grades, [gradeId]: aulas },
    }),
  );
}
