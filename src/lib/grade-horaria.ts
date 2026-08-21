export type StatusGrade = "Ativo" | "Inativo";
export type Turno = "Matutino" | "Vespertino" | "Noturno";

export interface GradeHoraria {
    id: string;
    versao: number;
    dataCriacao: string; // ISO "yyyy-mm-dd"
    cursoVinculado: string;
    periodoLetivo: string;
    turno: Turno;
    status: StatusGrade;
}

export const CURSOS_DISPONIVEIS = [
    "AMS-ADS",
    "GTI",
    "Meio Ambiente",
    "Administração",
    "Mecatronica",
];

export const PERIODOS_LETIVOS = [
    "1º Semestre de 2024",
    "2º Semestre de 2024",
    "1º Semestre de 2025",
    "2º Semestre de 2025",
];

export const DIAS_SEMANA = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
] as const;

const HORARIOS_POR_TURNO: Record<Turno, string[]> = {
    Matutino: [
        "07:00 - 07:50",
        "07:50 - 08:40",
        "08:50 - 09:40",
        "09:40 - 10:30",
        "10:40 - 11:30",
        "11:30 - 12:20",
    ],
    Vespertino: [
        "13:20 - 14:10",
        "14:10 - 15:00",
        "15:10 - 16:00",
        "16:00 - 16:50",
        "17:00 - 17:50",
        "17:50 - 18:40",
    ],
    Noturno: [
        "19:00 - 19:50",
        "19:50 - 20:40",
        "20:50 - 21:40",
        "21:40 - 22:30",
    ],
};

export function horariosDoTurno(turno: Turno): string[] {
    return HORARIOS_POR_TURNO[turno];
}

const TURNOS: Turno[] = ["Matutino", "Vespertino", "Noturno"];

/** Gera uma lista mock de grades horárias para popular a listagem inicialmente. */
export function gerarGradesMock(): GradeHoraria[] {
    const base: { versao: number; dataCriacao: string; curso: string }[] = [
        { versao: 1, dataCriacao: "2024-05-01", curso: "AMS-ADS" },
        { versao: 2, dataCriacao: "2022-12-13", curso: "GTI" },
        { versao: 3, dataCriacao: "2026-05-13", curso: "Meio Ambiente" },
        { versao: 4, dataCriacao: "2025-01-25", curso: "Administração" },
        { versao: 5, dataCriacao: "2024-08-01", curso: "Mecatronica" },
        { versao: 6, dataCriacao: "2024-10-15", curso: "AMS-ADS" },
    ];

    const grades: GradeHoraria[] = [];
    let id = 1;

    for (let ciclo = 0; ciclo < 5; ciclo++) {
        base.forEach((item, index) => {
            grades.push({
                id: String(id),
                versao: item.versao + ciclo * 10,
                dataCriacao: item.dataCriacao,
                cursoVinculado: item.curso,
                periodoLetivo: PERIODOS_LETIVOS[(index + ciclo) % PERIODOS_LETIVOS.length],
                turno: TURNOS[(index + ciclo) % TURNOS.length],
                status: index % 5 === 4 ? "Inativo" : "Ativo",
            });
            id++;
        });
    }

    return grades.slice(0, 30);
}

const STORAGE_KEY = "fatec-grade-horaria-listagem";

/**
 * Lê as grades salvas no localStorage do navegador.
 * Retorna null se não houver nada salvo ainda ou se rodar no servidor (SSR).
 */
export function carregarGradesSalvas(): GradeHoraria[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as GradeHoraria[];
    } catch {
        return null;
    }
}

/** Salva a lista atual de grades no localStorage do navegador. */
export function salvarGrades(grades: GradeHoraria[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — ignora silenciosamente
    }
}

/** Formata uma data ISO ("yyyy-mm-dd") para exibição no padrão brasileiro (dd/mm/aaaa). */
export function formatarDataBR(iso: string): string {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split("-");
    if (!ano || !mes || !dia) return iso;
    return `${dia}/${mes}/${ano}`;
}