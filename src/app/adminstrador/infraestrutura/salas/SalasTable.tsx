import { DataTable } from "@/components/ui/table"

import { Tooltip } from "@/components/ui/tooltip"

import { WrenchIcon, PencilIcon, TrashIcon } from "lucide-react"

import { PRIMARY, PRIMARY_FG } from "./constants"
import { Sala } from "./types"

type SalasTableProps = {
  salas: Sala[]
  onVerRecursos: (sala: Sala) => void
  onEditar: (sala: Sala) => void
  onExcluir: (sala: Sala) => void
}

export function SalasTable({
  salas,
  onVerRecursos,
  onEditar,
  onExcluir,
}: SalasTableProps) {
  const columns = [
    {
      key: "codigo",
      label: "Código",
    },
    {
      key: "capacidade",
      label: "Capacidade",
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (sala: Sala) => (
        <span className="block max-w-[200px] truncate" title={sala.tipo}>
          {sala.tipo}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (sala: Sala) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip content="Ver Recursos" side="top" variant="secondary" sideOffset={8}>
            <button
              onClick={() => onVerRecursos(sala)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
              style={{ color: PRIMARY }}
            >
              <WrenchIcon className="size-4 group-hover:text-white transition-colors" />
            </button>
          </Tooltip>

          <button
            onClick={() => onEditar(sala)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
            style={{ color: PRIMARY }}
          >
            <PencilIcon className="size-4 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => onExcluir(sala)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#FF0000] hover:border-[#FF0000] group transition-colors"
            style={{ color: "#FF0000" }}
          >
            <TrashIcon className="size-4 group-hover:text-white transition-colors" />
          </button>
        </div>
      ),
    },
  ]

  if (salas.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-[10px] border border-[#C8CDD2] py-8 text-center text-muted-foreground">
        Nenhuma sala encontrada.
      </div>
    )
  }

  return (
    <DataTable
      data={salas}
      columns={columns}
      getRowKey={(sala) => sala.id}
    />
  )
}
