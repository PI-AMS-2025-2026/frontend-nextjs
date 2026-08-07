import { Recurso, Sala } from "./types"

// -------------------------------------------------------
// Mock de salas (simula dados vindos do backend)
// -------------------------------------------------------
const TIPOS_MOCK = ["Informática", "Sala de aula", "Laboratório", "Auditório"]

const RECURSOS_POOL: Recurso[][] = [
  [
    { nome: "Ar-condicionado", categoria: "Climatização" },
    { nome: "Projetor", categoria: "Equipamento" },
    { nome: "TV 55\"", categoria: "Equipamento" },
    { nome: "Computadores (30)", categoria: "Equipamento" },
  ],
  [
    { nome: "Quadro branco", categoria: "Mobiliário" },
    { nome: "Projetor", categoria: "Equipamento" },
    { nome: "Ar-condicionado", categoria: "Climatização" },
  ],
  [
    { nome: "Computadores (40)", categoria: "Equipamento" },
    { nome: "Ar-condicionado", categoria: "Climatização" },
  ],
]

export const SALAS_MOCK: Sala[] = Array.from({ length: 30 }, (_, i) => {
  const numero = String(i + 1).padStart(2, "0")
  return {
    id: i + 1,
    codigo: `Sala ${numero}`,
    capacidade: 40,
    tipo: TIPOS_MOCK[i % TIPOS_MOCK.length],
    recursos: RECURSOS_POOL[i % RECURSOS_POOL.length],
  }
})
