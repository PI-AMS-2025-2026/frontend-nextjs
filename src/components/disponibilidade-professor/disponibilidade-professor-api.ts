import type { BlocoHorarioResponse, ProfessorResponse } from "@/types/api";

/**
 * Formato real devolvido por GET /disponibilidades-professores (conferido no
 * Swagger do backend). Difere de DisponibilidadeProfessorResponse em types/api.ts,
 * que declara usuario/diaSemana/blocoHorario.
 */
export interface DisponibilidadeProfessorApi {
    id: number;
    professor?: ProfessorResponse | null;
    diaSemana?: string | null;
    blocoHorario?: BlocoHorarioResponse | null;
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
        const diaSemana = r.diaSemana ?? r.dia_semana;
        const blocoHorario = r.blocoHorario ?? r.bloco_horario;

        if (!r.professor || !diaSemana || !blocoHorario) {
            console.warn("Disponibilidade ignorada por vir incompleta da API:", r);
            continue;
        }
        validos.push({
            id: r.id,
            professor: r.professor,
            diaSemana,
            blocoHorario,
        });
    }

    return validos;
}