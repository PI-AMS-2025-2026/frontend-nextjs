import { api } from "@/lib/api";
import type { Id, ListSalaParams, PageResponse, SalaRequest, SalaResponse } from "@/types/api";
export const salasService = {
  listar(params?: ListSalaParams) { return api.get<PageResponse<SalaResponse>>("/salas", params); },
  buscar(id: Id) { return api.get<SalaResponse>(`/salas/${id}`); },
  criar(data: SalaRequest) { return api.post<SalaResponse>("/salas", data); },
  atualizar(id: Id, data: SalaRequest) { return api.put<SalaResponse>(`/salas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/salas/${id}`); },
};
