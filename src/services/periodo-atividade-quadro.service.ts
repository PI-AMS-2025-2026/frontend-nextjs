import { api } from "@/lib/api";
import type { Id, ListPeriodoAtividadeQuadroParams, PageResponse, PeriodoAtividadeQuadroRequest, PeriodoAtividadeQuadroResponse } from "@/types/api";
export const periodoAtividadeQuadroService = {
  listar(params?: ListPeriodoAtividadeQuadroParams) { return api.get<PageResponse<PeriodoAtividadeQuadroResponse>>("/periodos-atividade-quadro", params); },
  buscar(id: Id) { return api.get<PeriodoAtividadeQuadroResponse>(`/periodos-atividade-quadro/${id}`); },
  criar(data: PeriodoAtividadeQuadroRequest) { return api.post<PeriodoAtividadeQuadroResponse>("/periodos-atividade-quadro", data); },
  atualizar(id: Id, data: PeriodoAtividadeQuadroRequest) { return api.put<PeriodoAtividadeQuadroResponse>(`/periodos-atividade-quadro/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/periodos-atividade-quadro/${id}`); },
  tipos() { return api.get<string[]>("/periodos-atividade-quadro/tipos"); },
};
