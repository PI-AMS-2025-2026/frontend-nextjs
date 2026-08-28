import { api } from "@/lib/api";
import type { Id, ListRecursoParams, PageResponse, RecursoRequest, RecursoResponse } from "@/types/api";
export const recursosService = {
  listar(params?: ListRecursoParams) { return api.get<PageResponse<RecursoResponse>>("/recursos", params); },
  buscar(id: Id) { return api.get<RecursoResponse>(`/recursos/${id}`); },
  criar(data: RecursoRequest) { return api.post<RecursoResponse>("/recursos", data); },
  atualizar(id: Id, data: RecursoRequest) { return api.put<RecursoResponse>(`/recursos/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/recursos/${id}`); },
};
