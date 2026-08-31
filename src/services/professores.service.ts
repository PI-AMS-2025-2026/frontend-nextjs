import { api } from "@/lib/api";
import type { Id, ListProfessorParams, PageResponse, ProfessorRequest, ProfessorResponse } from "@/types/api";
export const professoresService = {
  listar(params?: ListProfessorParams) { return api.get<PageResponse<ProfessorResponse>>("/professores", params); },
  buscar(id: Id) { return api.get<ProfessorResponse>(`/professores/${id}`); },
  criar(data: ProfessorRequest) { return api.post<ProfessorResponse>("/professores", data); },
  atualizar(id: Id, data: ProfessorRequest) { return api.put<ProfessorResponse>(`/professores/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/professores/${id}`); },
};
