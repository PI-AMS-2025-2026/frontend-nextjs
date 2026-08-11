import { api } from "@/lib/api";
import type { Id, ListQuadroHorarioParams, PageResponse, QuadroHorarioRequest, QuadroHorarioResponse } from "@/types/api";
export const quadroHorariosService = {
  listar(params?: ListQuadroHorarioParams) { return api.get<PageResponse<QuadroHorarioResponse>>("/quadro-horarios", params); },
  buscar(id: Id) { return api.get<QuadroHorarioResponse>(`/quadro-horarios/${id}`); },
  criar(data: QuadroHorarioRequest) { return api.post<QuadroHorarioResponse>("/quadro-horarios", data); },
  atualizar(id: Id, data: QuadroHorarioRequest) { return api.put<QuadroHorarioResponse>(`/quadro-horarios/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/quadro-horarios/${id}`); },
  copiar(id: Id, data: QuadroHorarioRequest) { return api.post<QuadroHorarioResponse>(`/quadro-horarios/${id}/copiar`, data); },
};
