import { api } from "@/lib/api";
import type { Id, ListTurmaParams, PageResponse, TurmaRequest, TurmaResponse } from "@/types/api";
export const turmasService = {
  listar(params?: ListTurmaParams) { return api.get<PageResponse<TurmaResponse>>("/turmas", params); },
  buscar(id: Id) { return api.get<TurmaResponse>(`/turmas/${id}`); },
  criar(data: TurmaRequest) { return api.post<TurmaResponse>("/turmas", data); },
  atualizar(id: Id, data: TurmaRequest) { return api.put<TurmaResponse>(`/turmas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/turmas/${id}`); },
};
