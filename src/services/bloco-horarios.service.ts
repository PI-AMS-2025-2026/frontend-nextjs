import { api } from "@/lib/api";
import type { BlocoHorarioRequest, BlocoHorarioResponse, Id, ListBlocoHorarioParams, PageResponse } from "@/types/api";
export const blocoHorariosService = {
  listar(params?: ListBlocoHorarioParams) { return api.get<PageResponse<BlocoHorarioResponse>>("/bloco-horarios", params); },
  buscar(id: Id) { return api.get<BlocoHorarioResponse>(`/bloco-horarios/${id}`); },
  criar(data: BlocoHorarioRequest) { return api.post<BlocoHorarioResponse>("/bloco-horarios", data); },
  criarLote(data: BlocoHorarioRequest[]) { return api.post<BlocoHorarioResponse[]>("/bloco-horarios/lote", data); },
  atualizar(id: Id, data: BlocoHorarioRequest) { return api.put<BlocoHorarioResponse>(`/bloco-horarios/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/bloco-horarios/${id}`); },
};
