import { api } from "@/lib/api";
import type { CursoRequest, CursoResponse, Id, ListCursoParams, PageResponse } from "@/types/api";
export const cursosService = {
  listar(params?: ListCursoParams) { return api.get<PageResponse<CursoResponse>>("/cursos", params); },
  async listarTodos(params: Omit<ListCursoParams, "page" | "size"> = {}) {
    const cursos: CursoResponse[] = [];
    let page = 0;
    let totalPages = 1;
    do {
      const resposta = await api.get<PageResponse<CursoResponse>>("/cursos", { ...params, page, size: 100 });
      cursos.push(...resposta.content);
      totalPages = resposta.totalPages;
      page += 1;
    } while (page < totalPages);
    return cursos;
  },
  buscar(id: Id) { return api.get<CursoResponse>(`/cursos/${id}`); },
  criar(data: CursoRequest) { return api.post<CursoResponse>("/cursos", data); },
  atualizar(id: Id, data: CursoRequest) { return api.put<CursoResponse>(`/cursos/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/cursos/${id}`); },
};
