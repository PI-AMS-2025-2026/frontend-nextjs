import { api } from "@/lib/api";
import type { Id, ListPeriodoAtividadeQuadroParams, PageResponse, PeriodoAtividadeQuadroRequest, PeriodoAtividadeQuadroResponse } from "@/types/api";
export const periodoAtividadeQuadroService = {
  listar(params?: ListPeriodoAtividadeQuadroParams) { return api.get<PageResponse<PeriodoAtividadeQuadroResponse>>("/periodo_atividade_quadro", params); },
  buscar(id: Id) { return api.get<PeriodoAtividadeQuadroResponse>(`/periodo_atividade_quadro/${id}`); },
  criar(data: PeriodoAtividadeQuadroRequest) { return api.post<PeriodoAtividadeQuadroResponse>("/periodo_atividade_quadro", data); },
  atualizar(id: Id, data: PeriodoAtividadeQuadroRequest) { return api.put<PeriodoAtividadeQuadroResponse>(`/periodo_atividade_quadro/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/periodo_atividade_quadro/${id}`); },
  tipos() { return api.get<string[]>("/periodo_atividade_quadro/tipos"); },
};
