import { api } from "@/lib/api";
import type { Id, ListQuadroHorarioParams, PageResponse, QuadroHorarioRequest, QuadroHorarioResponse } from "@/types/api";
export const quadroHorariosService = {
  listar(params?: ListQuadroHorarioParams) { return api.get<PageResponse<QuadroHorarioResponse>>("/quadros-horarios", params); },
  buscar(id: Id) { return api.get<QuadroHorarioResponse>(`/quadros-horarios/${id}`); },
  criar(data: QuadroHorarioRequest) { return api.post<QuadroHorarioResponse>("/quadros-horarios", data); },
  atualizar(id: Id, data: QuadroHorarioRequest) { return api.put<QuadroHorarioResponse>(`/quadros-horarios/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/quadros-horarios/${id}`); },
  copiar(id: Id, data: QuadroHorarioRequest) { return api.post<QuadroHorarioResponse>(`/quadros-horarios/${id}/copiar`, data); },
};
