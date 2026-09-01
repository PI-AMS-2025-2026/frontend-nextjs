// -------------------------------------------------------
// Tipos da tela de Salas
// -------------------------------------------------------

export type Recurso = {
  nome: string
  categoria: string
}

export type Sala = {
  id: number
  codigo: string
  capacidade: number
  tipo: string
  recursos: Recurso[]
}
