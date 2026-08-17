import { GradeHoraria, GradeHorariaPayload } from "@/models/grade-horaria";

const STORAGE_KEY = "grades-horarias:mock-data";
const SIMULATED_DELAY = 400;

const PERIODOS_MOCK = ["Matutino", "Vespertino", "Noturno"];

function gerarMock(): GradeHoraria[] {
  const base: Array<Omit<GradeHoraria, "id">> = [
    { versao: 1, dataCriacao: "2024-05-01", cursoNome: "AMS-ADS", periodoLetivo: "1º Semestre de 2024", periodo: "Vespertino", status: "ativo" },
    { versao: 2, dataCriacao: "2022-12-13", cursoNome: "GTI", periodoLetivo: "1º Semestre de 2024", periodo: "Matutino", status: "ativo" },
    { versao: 3, dataCriacao: "2026-05-13", cursoNome: "Meio Ambiente", periodoLetivo: "1º Semestre de 2024", periodo: "Noturno", status: "ativo" },
    { versao: 4, dataCriacao: "2025-01-25", cursoNome: "Administração", periodoLetivo: "1º Semestre de 2024", periodo: "Matutino", status: "ativo" },
    { versao: 5, dataCriacao: "2024-08-01", cursoNome: "Mecatronica", periodoLetivo: "1º Semestre de 2024", periodo: "Vespertino", status: "ativo" },
    { versao: 6, dataCriacao: "2024-10-15", cursoNome: "AMS-ADS", periodoLetivo: "1º Semestre de 2024", periodo: "Noturno", status: "ativo" },
  ];

  // Duplica a base pra simular 30 registros e testar a paginação (igual
  // "Mostrando 1 a 6 de 30 registros" no protótipo)
  const registros: GradeHoraria[] = [];
  let id = 1;
  for (let volta = 0; volta < 5; volta++) {
    for (const item of base) {
      registros.push({ id: id++, ...item, versao: item.versao + volta * 6 });
    }
  }
  return registros;
}

function carregarEstadoInicial(): GradeHoraria[] {
  if (typeof window === "undefined") return gerarMock();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GradeHoraria[];
  } catch {
    // JSON corrompido — ignora e recria
  }
  return gerarMock();
}

let grades: GradeHoraria[] = carregarEstadoInicial();

function persistir(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
  } catch {
    // localStorage indisponível — ignora
  }
}

function proximoId(): number {
  return grades.reduce((max, g) => Math.max(max, g.id), 0) + 1;
}

function proximaVersao(): number {
  return grades.reduce((max, g) => Math.max(max, g.versao), 0) + 1;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY));
}

export async function listar(): Promise<GradeHoraria[]> {
  return delay([...grades]);
}

export async function buscarPorId(id: number): Promise<GradeHoraria | undefined> {
  return delay(grades.find((g) => g.id === id));
}

export async function criar(payload: GradeHorariaPayload): Promise<GradeHoraria> {
  // "periodo" (turno) não vem do formulário — é mockado aqui, igual descrito no modelo
  const periodo = PERIODOS_MOCK[grades.length % PERIODOS_MOCK.length];
  const nova: GradeHoraria = { id: proximoId(), ...payload, periodo };
  grades = [...grades, nova];
  persistir();
  return delay(nova);
}

export async function editar(id: number, payload: GradeHorariaPayload): Promise<GradeHoraria> {
  const atual = grades.find((g) => g.id === id);
  if (!atual) throw new Error("Grade horária não encontrada.");

  const atualizada: GradeHoraria = { id, ...payload, periodo: atual.periodo };
  grades = grades.map((g) => (g.id === id ? atualizada : g));
  persistir();
  return delay(atualizada);
}

/** Cria uma cópia de uma grade existente, com nova versão. */
export async function copiar(id: number): Promise<GradeHoraria> {
  const original = grades.find((g) => g.id === id);
  if (!original) throw new Error("Grade horária não encontrada.");

  const copia: GradeHoraria = {
    ...original,
    id: proximoId(),
    versao: proximaVersao(),
  };
  grades = [...grades, copia];
  persistir();
  return delay(copia);
}