export interface Horario {
    id: string;
    inicio: string;
    fim: string;
}

const STORAGE_KEY = "horarios";

function paraMinutos(hora: string) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
}

export function calcDuracao(inicio: string, fim: string) {
    // o +1440 % 1440 cobre horário que vira a meia-noite (22:00 -> 02:00)
    const diff = (paraMinutos(fim) - paraMinutos(inicio) + 1440) % 1440;
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;

    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
}

export function carregarHorariosSalvos(): Horario[] | null {
    if (typeof window === "undefined") return null;
    try {
        const bruto = window.localStorage.getItem(STORAGE_KEY);
        if (!bruto) return null;
        const dados = JSON.parse(bruto);
        return Array.isArray(dados) ? (dados as Horario[]) : null;
    } catch {
        return null;
    }
}

export function salvarHorarios(horarios: Horario[]) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(horarios));
    } catch {
        // storage cheio ou bloqueado, ignora
    }
}

export function gerarHorariosMock(): Horario[] {
    return [
        { inicio: "07:00", fim: "07:50" },
        { inicio: "07:50", fim: "08:40" },
        { inicio: "08:40", fim: "09:30" },
        { inicio: "09:50", fim: "10:40" },
        { inicio: "10:40", fim: "11:30" },
        { inicio: "11:30", fim: "12:20" },
    ].map((h) => ({ ...h, id: crypto.randomUUID() }));
}