import { api } from "@/lib/api";
import type { CursoRequest, CursoResponse, Id, ListCursoParams, PageResponse } from "@/types/api";
export const cursosService = {
  listar(params?: ListCursoParams) { return api.get<PageResponse<CursoResponse>>("/cursos", params); },
  buscar(id: Id) { return api.get<CursoResponse>(`/cursos/${id}`); },
  criar(data: CursoRequest) { return api.post<CursoResponse>("/cursos", data); },
  atualizar(id: Id, data: CursoRequest) { return api.put<CursoResponse>(`/cursos/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/cursos/${id}`); },
};
