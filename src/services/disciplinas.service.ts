import { api } from "@/lib/api";
import type { DisciplinaRequest, DisciplinaResponse, Id, ListDisciplinaParams, PageResponse } from "@/types/api";
export const disciplinasService = {
  listar(params?: ListDisciplinaParams) { return api.get<PageResponse<DisciplinaResponse>>("/disciplinas", params); },
  async listarTodos(params: Omit<ListDisciplinaParams, "page" | "size"> = {}) {
    const disciplinas: DisciplinaResponse[] = [];
    let page = 0;
    let totalPages = 1;
    do {
      const resposta = await api.get<PageResponse<DisciplinaResponse>>("/disciplinas", {
        ...params,
        page,
        size: 100,
      });
      disciplinas.push(...resposta.content);
      totalPages = resposta.totalPages;
      page += 1;
    } while (page < totalPages);
    return disciplinas;
  },
  buscar(id: Id) { return api.get<DisciplinaResponse>(`/disciplinas/${id}`); },
  criar(data: DisciplinaRequest) { return api.post<DisciplinaResponse>("/disciplinas", data); },
  atualizar(id: Id, data: DisciplinaRequest) { return api.put<DisciplinaResponse>(`/disciplinas/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/disciplinas/${id}`); },
};
