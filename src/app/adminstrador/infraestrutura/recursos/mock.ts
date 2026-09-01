import { Recurso } from "./types"

// -------------------------------------------------------
// Mock de recursos (simula dados vindos do backend)
// -------------------------------------------------------
const ITENS_MOCK: Array<Pick<Recurso, "nome" | "tipo">> = [
  { nome: "Projetor", tipo: "Equipamento" },
  { nome: "Ar-Condicionado", tipo: "Climatização" },
  { nome: "TV 55\"", tipo: "Equipamento" },
  { nome: "Computador", tipo: "Equipamento" },
  { nome: "Quadro branco", tipo: "Equipamento" },
  { nome: "Ventilador", tipo: "Climatização" },
]

export const RECURSOS_MOCK: Recurso[] = Array.from({ length: 30 }, (_, i) => {
  const base = ITENS_MOCK[i % ITENS_MOCK.length]
  return {
    id: i + 1,
    nome: base.nome,
    tipo: base.tipo,
  }
})
