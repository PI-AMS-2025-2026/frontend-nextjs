import type { BlocoHorarioResponse, ProfessorResponse } from "@/types/api";

/**
 * Formato real devolvido por GET /disponibilidades-professores (conferido no
 * Swagger do backend). Difere de DisponibilidadeProfessorResponse em types/api.ts,
 * que declara usuario/diaSemana/blocoHorario.
 */
export interface DisponibilidadeProfessorApi {
    id: number;
    professor?: ProfessorResponse | null;
    dia_semana?: string | null;
    bloco_horario?: BlocoHorarioResponse | null;
}

/** Modelo usado pela tela, já normalizado e sem campos ausentes. */
export interface DisponibilidadeProfessor {
    id: number;
    professor: ProfessorResponse;
    diaSemana: string;
    blocoHorario: BlocoHorarioResponse;
}

/** Descarta registros incompletos em vez de quebrar a tela. */
export function normalizarDisponibilidades(
    registros: DisponibilidadeProfessorApi[],
): DisponibilidadeProfessor[] {
    const validos: DisponibilidadeProfessor[] = [];

    for (const r of registros) {
        if (!r.professor || !r.dia_semana || !r.bloco_horario) {
            console.warn("Disponibilidade ignorada por vir incompleta da API:", r);
            continue;
        }
        validos.push({
            id: r.id,
            professor: r.professor,
            diaSemana: r.dia_semana,
            blocoHorario: r.bloco_horario,
        });
    }

    return validos;
}
