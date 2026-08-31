import { api } from "@/lib/api";
import type { HistoricoVersaoAlocacaoResponse, Id, ListHistoricoParams, PageResponse } from "@/types/api";
export const historicosAlteracoesService = {
  listar(params?: ListHistoricoParams) { return api.get<PageResponse<HistoricoVersaoAlocacaoResponse>>("/historicos-alteracoes", params); },
  buscar(id: Id) { return api.get<HistoricoVersaoAlocacaoResponse>(`/historicos-alteracoes/${id}`); },
};
