// Valores do enum no backend (GET /dias-semana), com acento em TERÇA e SÁBADO
export const DIAS_SEMANA: { label: string; value: string }[] = [
    { label: "Segunda", value: "SEGUNDA" },
    { label: "Terça", value: "TERÇA" },
    { label: "Quarta", value: "QUARTA" },
    { label: "Quinta", value: "QUINTA" },
    { label: "Sexta", value: "SEXTA" },
    { label: "Sábado", value: "SÁBADO" },
    { label: "Domingo", value: "DOMINGO" },
];

function semAcento(valor: string) {
    return valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

/** Compara dias ignorando acento (TERÇA == TERCA). */
export function mesmoDia(a: string, b: string) {
    return semAcento(a) === semAcento(b);
}

export function rotuloDia(dia: string) {
    return DIAS_SEMANA.find((d) => mesmoDia(d.value, dia))?.label ?? dia;
}

// Aceita "08:00" ou "08:00:00" e devolve "08:00"
export function formatarHora(hora: string) {
    return hora.slice(0, 5);
}
