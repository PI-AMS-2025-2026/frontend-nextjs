import { api } from "@/lib/api";
import type { DisciplinaRequest, DisciplinaResponse, Id, ListDisciplinaParams, PageResponse } from "@/types/api";
export const disciplinasService = {
  listar(params?: ListDisciplinaParams) { return api.get<PageResponse<DisciplinaResponse>>("/disciplinas", params); },
  buscar(id: Id) { return api.get<DisciplinaResponse>(`/disciplinas/${id}`); },
  criar(data: DisciplinaRequest) { return api.post<DisciplinaResponse>("/disciplinas", data); },
  atualizar(id: Id, data: DisciplinaRequest) { return api.put<DisciplinaResponse>(`/disciplinas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/disciplinas/${id}`); },
};
