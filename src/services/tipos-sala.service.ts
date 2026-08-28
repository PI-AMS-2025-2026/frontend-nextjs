import { api } from "@/lib/api";
import type { Id, TipoSalaRequest, TipoSalaResponse } from "@/types/api";
export const tiposSalaService = {
  listar(nome?: string) { return api.get<TipoSalaResponse[]>("/tipos-sala", { nome }); },
  buscar(id: Id) { return api.get<TipoSalaResponse>(`/tipos-sala/${id}`); },
  criar(data: TipoSalaRequest) { return api.post<TipoSalaResponse>("/tipos-sala", data); },
  atualizar(id: Id, data: TipoSalaRequest) { return api.put<TipoSalaResponse>(`/tipos-sala/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/tipos-sala/${id}`); },
};
