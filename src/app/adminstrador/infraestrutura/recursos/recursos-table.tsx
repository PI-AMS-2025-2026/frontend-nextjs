import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PencilIcon, TrashIcon } from "lucide-react"
import { Recurso } from "./types"
import { PRIMARY, PRIMARY_FG } from "./constants"

// -------------------------------------------------------
// Tabela de Recursos
// Componente de apresentação: recebe tudo via props e não
// guarda nenhum estado próprio.
// -------------------------------------------------------
type RecursosTableProps = {
  recursos: Recurso[]
  isTipoCustomizado: (tipo: string) => boolean
  onEditar: (recurso: Recurso) => void
  onExcluir: (recurso: Recurso) => void
}

export function RecursosTable({
  recursos,
  isTipoCustomizado,
  onEditar,
  onExcluir,
}: RecursosTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D9D9D9]">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow
            className="border-0 hover:bg-transparent"
            style={{ backgroundColor: PRIMARY }}
          >
            <TableHead className="text-base font-bold py-4 pl-6 rounded-tl-lg" style={{ color: PRIMARY_FG }}>
              Nome
            </TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>
              Tipo
            </TableHead>
            <TableHead className="text-right rounded-tr-lg text-base font-bold py-4 pr-6" style={{ color: PRIMARY_FG }}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recursos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                Nenhum recurso encontrado.
              </TableCell>
            </TableRow>
          ) : (
            recursos.map((recurso, index) => (
              <TableRow
                key={recurso.id}
                className={`
                  ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                  border-b border-[#D9D9D9]
                  hover:bg-[#EAF6FB]
                  transition-colors
                  cursor-pointer
                `}
              >
                <TableCell className="py-4 pl-6">{recurso.nome}</TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center gap-2">
                    {recurso.tipo}
                    {isTipoCustomizado(recurso.tipo) && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: "#4471E6", color: "#FFFFFF" }}
                      >
                        Novo
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditar(recurso)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                      style={{ color: PRIMARY }}
                    >
                      <PencilIcon className="size-4 group-hover:text-white transition-colors" />
                    </button>
                    <button
                      onClick={() => onExcluir(recurso)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#FF0000] hover:border-[#FF0000] group transition-colors"
                      style={{ color: "#FF0000" }}
                    >
                      <TrashIcon className="size-4 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
