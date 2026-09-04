import { DataTable } from "@/components/ui/table"
import { PencilIcon, CircleCheckIcon, CircleMinusIcon } from "lucide-react"
import { Turma } from "../../app/coordenador/estrutura-academica/turmas/types"

// -------------------------------------------------------
// Tabela de Turmas
// Componente de apresentação: recebe tudo via props e não
// guarda nenhum estado próprio.
// -------------------------------------------------------
type TurmasTableProps = {
  turmas: Turma[]
  onEditar: (turma: Turma) => void
}

export function TurmasTable({ turmas, onEditar }: TurmasTableProps) {
  return (
    <DataTable<Turma>
      data={turmas}
      getRowKey={(turma) => turma.id}
      columns={[
        { key: "id", label: "ID" },
        { key: "periodo", label: "Período" },
        { key: "ano", label: "Ano" },
        { key: "qtdAlunos", label: "Qtd Alunos" },
        {
          key: "curso",
          label: "Curso",
          render: (turma) => (
            <span className="block max-w-[200px] truncate" title={turma.curso}>
              {turma.curso}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (turma) =>
            turma.status === "Ativo" ? (
              <span className="inline-flex items-center gap-2 text-[#21C11E] font-medium">
                <CircleCheckIcon className="h-5 w-5" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-[#FF0000] font-medium">
                <CircleMinusIcon className="h-5 w-5" />
                Inativo
              </span>
            ),
        },
      ]}
      actions={[
        {
          label: "Editar",
          icon: <PencilIcon className="size-4" />,
          onClick: (turma) => onEditar(turma),
        },
      ]}
    />
  )
}