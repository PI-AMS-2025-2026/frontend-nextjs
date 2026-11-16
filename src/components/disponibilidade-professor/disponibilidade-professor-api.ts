
import type {
    BlocoHorarioResponse,
    ProfessorResponse,
} from "@/types/api";

/**
 * Formato retornado pelo endpoint /bloco-horarios.
 */
export interface BlocoHorarioApi {
    id: number;
    hora_inicio: string;
    hora_fim: string;
    duracao: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Converte os campos snake_case do backend
 * para camelCase utilizado no frontend.
 */
export function normalizarBlocosHorarios(
    registros: BlocoHorarioApi[],
): BlocoHorarioResponse[] {
    return registros.map((bloco) => ({
        id: bloco.id,
        horaInicio: bloco.hora_inicio,
        horaFim: bloco.hora_fim,
        duracao: bloco.duracao,
        created_at: bloco.created_at ?? "",
        updated_at: bloco.updated_at ?? "",
    }));
}

/**
 * Formato retornado por /disponibilidades-professores.
 */
export interface DisponibilidadeProfessorApi {
    id: number;
    professor?: ProfessorResponse | null;
    dia_semana?: string | null;
    bloco_horario?: BlocoHorarioApi | null;
}

/**
 * Modelo normalizado utilizado pela tela.
 */
export interface DisponibilidadeProfessor {
    id: number;
    professor: ProfessorResponse;
    diaSemana: string;
    blocoHorario: BlocoHorarioResponse;
}

/**
 * Normaliza as disponibilidades e seus blocos de horário.
 */
export function normalizarDisponibilidades(
    registros: DisponibilidadeProfessorApi[],
): DisponibilidadeProfessor[] {
    const validos: DisponibilidadeProfessor[] = [];

    for (const registro of registros) {
        if (
            !registro.professor ||
            !registro.dia_semana ||
            !registro.bloco_horario
        ) {
            console.warn(
                "Disponibilidade ignorada por vir incompleta da API:",
                registro,
            );
            continue;
        }

        const [blocoNormalizado] = normalizarBlocosHorarios([
            registro.bloco_horario,
        ]);

        validos.push({
            id: registro.id,
            professor: registro.professor,
            diaSemana: registro.dia_semana,
            blocoHorario: blocoNormalizado,
        });
    }

    return validos;
}
