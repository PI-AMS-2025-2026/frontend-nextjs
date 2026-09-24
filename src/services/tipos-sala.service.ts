import { api } from "@/lib/api";

import type {
  Id,
  PageResponse,
  TipoSalaRequest,
  TipoSalaResponse,
} from "@/types/api";

export const tipoSalaService = {
  listar() {
    return api.get<
      PageResponse<TipoSalaResponse>
    >("/tipo-sala", {
      page: 0,
      size: 100,
    });
  },

  buscar(id: Id) {
    return api.get<TipoSalaResponse>(
      `/tipo-sala/${id}`,
    );
  },

  criar(data: TipoSalaRequest) {
    return api.post<TipoSalaResponse>(
      "/tipo-sala",
      data,
    );
  },

  atualizar(
    id: Id,
    data: TipoSalaRequest,
  ) {
    return api.put<TipoSalaResponse>(
      `/tipo-sala/${id}`,
      data,
    );
  },

  deletar(id: Id) {
    return api.delete<void>(
      `/tipo-sala/${id}`,
    );
  },
};