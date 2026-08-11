import { api } from "@/lib/api";
import type { Id, PageResponse, UsuarioRequest, UsuarioResponse, ListUsuarioParams, TipoUsuario } from "@/types/api";

export const usuariosService = {
  listar(params?: ListUsuarioParams) { return api.get<PageResponse<UsuarioResponse>>("/usuarios", params); },
  buscar(id: Id) { return api.get<UsuarioResponse>(`/usuarios/${id}`); },
  criar(data: UsuarioRequest) { return api.post<UsuarioResponse>("/usuarios", data); },
  atualizar(id: Id, data: UsuarioRequest) { return api.put<UsuarioResponse>(`/usuarios/${id}`, data); },
  deletar(id: Id) { return api.delete<void>(`/usuarios/${id}`); },
  tipos() { return api.get<TipoUsuario[]>("/usuarios/tipos"); },
};
