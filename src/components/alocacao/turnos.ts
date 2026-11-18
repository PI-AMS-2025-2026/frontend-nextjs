export type Turno = "todos" | "manha" | "tarde" | "noite";

export function pertenceAoTurno(inicio: string, turno: Turno): boolean {
  if (turno === "todos") return true;
  const partes = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(inicio);
  if (!partes) return false;
  const [, hora, minuto, segundo = "0"] = partes;
  const h = Number(hora),
    m = Number(minuto),
    s = Number(segundo);
  if (h > 23 || m > 59 || s > 59) return false;
  const tempo = h * 3600 + m * 60 + s;
  if (turno === "manha") return tempo >= 7 * 3600 && tempo < 13 * 3600;
  const faixas = {
    tarde: [13 * 3600, 18 * 3600],
    noite: [19 * 3600, 22 * 3600],
  } as const;
  const [inicioFaixa, fimFaixa] = faixas[turno];
  return tempo >= inicioFaixa && tempo <= fimFaixa;
}
