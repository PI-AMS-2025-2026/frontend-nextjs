export interface Horario {
    id: string;
    inicio: string; // "HH:MM"
    fim: string; // "HH:MM"
}

/**
 * Calcula a duração entre dois horários no formato "HH:MM".
 * Considera virada de dia (fim menor que início) somando 24h.
 */
export function calcDuracao(inicio: string, fim: string): string {
    if (!inicio || !fim) return "--:--";

    const [hIni, mIni] = inicio.split(":").map(Number);
    const [hFim, mFim] = fim.split(":").map(Number);

    if ([hIni, mIni, hFim, mFim].some((n) => Number.isNaN(n))) return "--:--";

    let totalMin = hFim * 60 + mFim - (hIni * 60 + mIni);
    if (totalMin < 0) totalMin += 24 * 60;

    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}

/** Gera uma lista mock de horários para popular a listagem inicialmente. */
export function gerarHorariosMock(): Horario[] {
    const blocos: [string, string][] = [
        ["08:00", "09:40"],
        ["09:50", "11:30"],
        ["13:20", "15:00"],
        ["15:10", "16:50"],
        ["17:00", "18:40"],
        ["19:00", "20:40"],
        ["20:50", "22:30"],
    ];

    const horarios: Horario[] = [];
    let id = 1;

    // Repete os blocos para simular várias turmas/dias e ter páginas suficientes
    for (let turma = 0; turma < 4; turma++) {
        for (const [inicio, fim] of blocos) {
            const offsetMin = turma * 5;
            const [hI, mI] = inicio.split(":").map(Number);
            const [hF, mF] = fim.split(":").map(Number);

            const totalIniMin = hI * 60 + mI + offsetMin;
            const totalFimMin = hF * 60 + mF + offsetMin;

            const iniStr = `${pad(Math.floor(totalIniMin / 60) % 24)}:${pad(totalIniMin % 60)}`;
            const fimStr = `${pad(Math.floor(totalFimMin / 60) % 24)}:${pad(totalFimMin % 60)}`;

            horarios.push({ id: String(id++), inicio: iniStr, fim: fimStr });

            if (horarios.length >= 24) break;
        }
        if (horarios.length >= 24) break;
    }

    return horarios;
}

const STORAGE_KEY = "fatec-horarios-listagem";

/**
 * Lê os horários salvos no localStorage do navegador.
 * Retorna null se não houver nada salvo ainda ou se rodar no servidor (SSR).
 */
export function carregarHorariosSalvos(): Horario[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Horario[];
    } catch {
        return null;
    }
}

/** Salva a lista atual de horários no localStorage do navegador. */
export function salvarHorarios(horarios: Horario[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(horarios));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — ignora silenciosamente
    }
}