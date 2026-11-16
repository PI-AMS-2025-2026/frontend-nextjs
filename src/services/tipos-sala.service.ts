import { api } from "@/lib/api";
import type { Id, TipoSalaRequest, TipoSalaResponse } from "@/types/api";
export const tiposSalaService = {
  listar(nome?: string) { return api.get<TipoSalaResponse[]>("/tipos-salas", { nome }); },
  buscar(id: Id) { return api.get<TipoSalaResponse>(`/tipos-salas/${id}`); },
  criar(data: TipoSalaRequest) { return api.post<TipoSalaResponse>("/tipos-salas", data); },
  atualizar(id: Id, data: TipoSalaRequest) { return api.put<TipoSalaResponse>(`/tipos-salas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/tipos-salas/${id}`); },
};
