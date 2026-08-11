import { api } from "@/lib/api";
import type { DisponibilidadeProfessorRequest, DisponibilidadeProfessorResponse, Id, ListDisponibilidadeProfessorParams, PageResponse } from "@/types/api";
export const disponibilidadesProfessoresService = {
  listar(params?: ListDisponibilidadeProfessorParams) { return api.get<PageResponse<DisponibilidadeProfessorResponse>>("/disponibilidades-professores", params); },
  buscar(id: Id) { return api.get<DisponibilidadeProfessorResponse>(`/disponibilidades-professores/${id}`); },
  criar(data: DisponibilidadeProfessorRequest) { return api.post<DisponibilidadeProfessorResponse>("/disponibilidades-professores", data); },
  atualizar(id: Id, data: DisponibilidadeProfessorRequest) { return api.put<DisponibilidadeProfessorResponse>(`/disponibilidades-professores/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/disponibilidades-professores/${id}`); },
};
