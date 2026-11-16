import { describe, expect, it } from "vitest";

import { opcoesPeriodoCurso, rotuloPeriodoTurma, unidadePeriodoCurso } from "@/lib/turma-periodo";
import type { CursoResponse } from "@/types/api";

const curso = (periodicidade: string, duracao: number): CursoResponse => ({
  id: 1,
  nome: "Curso de teste",
  periodicidade,
  duracao,
  status: "ATIVO",
  createdAt: "",
  updatedAt: "",
});

describe("período de turma interpretado conforme o curso", () => {
  it("oferece uma opção para cada semestre da duração semestral", () => {
    expect(opcoesPeriodoCurso(curso("Semestral", 6))).toHaveLength(6);
    expect(opcoesPeriodoCurso(curso("Semestral", 6))[5]).toEqual({ label: "6º semestre", value: "6" });
  });

  it("rotula períodos anuais como anos do curso", () => {
    expect(unidadePeriodoCurso("Anual")).toBe("ano");
    expect(rotuloPeriodoTurma("Anual", 2)).toBe("2º ano");
    expect(opcoesPeriodoCurso(curso("Anual", 2))).toEqual([
      { label: "1º ano", value: "1" },
      { label: "2º ano", value: "2" },
    ]);
  });
});
