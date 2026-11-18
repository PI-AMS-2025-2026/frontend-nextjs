import type {
  PeriodoAtividadeQuadroRequest,
  TipoPeriodoAtividadeQuadro,
} from "@/types/api";

export type PeriodoForm = PeriodoAtividadeQuadroRequest;

export const formularioInicial: PeriodoForm = {
  ano: 2026,
  periodo: 1,
  tipoPeridoAtividadeQuadro: "SEMESTRAL",
  dataInicio: "2026-02-09",
  dataFim: "2026-12-23",
  status: "ATIVO",
};

export function formatarData(data: string) {
  if (!data) return "-";

  const [ano, mes, dia] = data.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function rotuloTipoPeriodo(tipo: TipoPeriodoAtividadeQuadro) {
  switch (tipo) {
    case "SEMESTRAL":
      return "Semestral";
    case "ANUAL":
      return "Anual";
    default:
      return tipo;
  }
}
