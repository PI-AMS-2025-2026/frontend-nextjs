import { api } from "@/lib/api";
import type { DiaSemana, TipoUsuario } from "@/types/api";
export const enumsService = {
  tiposUsuario() { return api.get<TipoUsuario[]>("/usuarios/tipos"); },
  tiposPeriodo() { return api.get<string[]>("/periodo_atividade_quadro/tipos"); },
  diasSemana() { return api.get<DiaSemana[]>("/dias-semana"); },
};
