import { api } from "@/lib/api";
import type { DiaSemana} from "@/types/api";
export const enumsService = {

  diasSemana() { return api.get<DiaSemana[]>("/dias-semana"); },
};
