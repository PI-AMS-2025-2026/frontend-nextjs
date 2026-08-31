import { api } from "@/lib/api";
import type { Id, TipoRecursoRequest, TipoRecursoResponse } from "@/types/api";
export const tiposRecursoService = {
  listar(nome?: string) { return api.get<TipoRecursoResponse[]>("/tipos-recurso", { nome }); },
  buscar(id: Id) { return api.get<TipoRecursoResponse>(`/tipos-recurso/${id}`); },
  criar(data: TipoRecursoRequest) { return api.post<TipoRecursoResponse>("/tipos-recurso", data); },
  atualizar(id: Id, data: TipoRecursoRequest) { return api.put<TipoRecursoResponse>(`/tipos-recurso/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/tipos-recurso/${id}`); },
};
