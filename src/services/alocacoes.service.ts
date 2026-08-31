import { api } from "@/lib/api";
import type { AlocacaoRequest, AlocacaoResponse, Id, ListAlocacaoParams, PageResponse } from "@/types/api";
export const alocacoesService = {
  listar(params?: ListAlocacaoParams) { return api.get<PageResponse<AlocacaoResponse>>("/alocacoes", params); },
  buscar(id: Id) { return api.get<AlocacaoResponse>(`/alocacoes/${id}`); },
  criar(data: AlocacaoRequest) { return api.post<AlocacaoResponse>("/alocacoes", data); },
  criarLote(data: AlocacaoRequest[]) { return api.post<AlocacaoResponse[]>("/alocacoes/lote", data); },
  atualizar(id: Id, data: AlocacaoRequest) { return api.put<AlocacaoResponse>(`/alocacoes/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/alocacoes/${id}`); },
};
