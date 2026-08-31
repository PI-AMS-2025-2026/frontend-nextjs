import { api } from "@/lib/api";
import type { Id, ListProfessorDisciplinaParams, PageResponse, ProfessorDisciplinaRequest, ProfessorDisciplinaResponse } from "@/types/api";
export const professoresDisciplinasService = {
  listar(params?: ListProfessorDisciplinaParams) { return api.get<PageResponse<ProfessorDisciplinaResponse>>("/professores-disciplinas", params); },
  buscar(id: Id) { return api.get<ProfessorDisciplinaResponse>(`/professores-disciplinas/${id}`); },
  criar(data: ProfessorDisciplinaRequest) { return api.post<ProfessorDisciplinaResponse>("/professores-disciplinas", data); },
  atualizar(id: Id, data: ProfessorDisciplinaRequest) { return api.put<ProfessorDisciplinaResponse>(`/professores-disciplinas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/professores-disciplinas/${id}`); },
};
