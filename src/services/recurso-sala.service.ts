import { api } from "@/lib/api";
import type { Id, ListRecursoSalaParams, PageResponse, RecursoSalaRequest, RecursoSalaResponse } from "@/types/api";
export const recursoSalaService = {
  listar(params?: ListRecursoSalaParams) { return api.get<PageResponse<RecursoSalaResponse>>("/recurso-sala", params); },
  buscar(id: Id) { return api.get<RecursoSalaResponse>(`/recurso-sala/${id}`); },
  criar(data: RecursoSalaRequest) { return api.post<RecursoSalaResponse>("/recurso-sala", data); },
  atualizar(id: Id, data: RecursoSalaRequest) { return api.put<RecursoSalaResponse>(`/recurso-sala/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/recurso-sala/${id}`); },
};
