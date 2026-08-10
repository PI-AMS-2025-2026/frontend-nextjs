// -------------------------------------------------------
// Tipos da tela de Professores
// -------------------------------------------------------

export type Status = "Ativo" | "Inativo"

export type Professor = {
  id: number
  nome: string
  email: string
  status: Status
}
