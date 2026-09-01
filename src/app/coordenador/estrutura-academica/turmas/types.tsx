export type Status = "Ativo" | "Inativo"

export interface Turma {
  id: number
  periodo: string
  ano: number
  qtdAlunos: number
  curso: string
  status: Status
}