import { api } from "@/lib/api";
import type { Id, ListRecursoSalaParams, PageResponse, RecursoSalaRequest, RecursoSalaResponse } from "@/types/api";
export const recursoSalaService = {
  listar(params?: ListRecursoSalaParams) { return api.get<PageResponse<RecursoSalaResponse>>("/recursos-salas", params); },
  buscar(id: Id) { return api.get<RecursoSalaResponse>(`/recursos-salas/${id}`); },
  criar(data: RecursoSalaRequest) { return api.post<RecursoSalaResponse>("/recursos-salas", data); },
  atualizar(id: Id, data: RecursoSalaRequest) { return api.put<RecursoSalaResponse>(`/recursos-salas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/recursos-salas/${id}`); },
};
