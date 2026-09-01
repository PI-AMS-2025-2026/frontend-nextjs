import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { WrenchIcon, PencilIcon, TrashIcon } from "lucide-react"

import { PRIMARY, PRIMARY_FG } from "../constants"
import { Sala } from "../types"

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
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#D9D9D9]">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow
              className="border-0 hover:bg-transparent"
              style={{ backgroundColor: PRIMARY }}
            >
              <TableHead
                className="text-base font-bold py-4 pl-6 rounded-tl-lg"
                style={{ color: PRIMARY_FG }}
              >
                Código
              </TableHead>

              <TableHead
                className="text-base font-bold py-4"
                style={{ color: PRIMARY_FG }}
              >
                Capacidade
              </TableHead>

              <TableHead
                className="text-base font-bold py-4"
                style={{ color: PRIMARY_FG }}
              >
                Tipo
              </TableHead>

              <TableHead
                className="text-right rounded-tr-lg text-base font-bold py-4 pr-6"
                style={{ color: PRIMARY_FG }}
              >
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {salas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhuma sala encontrada.
                </TableCell>
              </TableRow>
            ) : (
              salas.map((sala, index) => (
                <TableRow
                  key={sala.id}
                  className={`
                    ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                    border-b border-[#D9D9D9]
                    hover:bg-[#EAF6FB]
                    transition-colors
                    cursor-pointer
                  `}
                >
                  <TableCell className="py-4 pl-6">
                    {sala.codigo}
                  </TableCell>

                  <TableCell className="py-4">
                    {sala.capacidade}
                  </TableCell>

                  <TableCell
                    className="max-w-[200px] truncate py-4"
                    title={sala.tipo}
                  >
                    {sala.tipo}
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onVerRecursos(sala)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                            style={{ color: PRIMARY }}
                          >
                            <WrenchIcon className="size-4 group-hover:text-white transition-colors" />
                          </button>
                        </TooltipTrigger>

                        <TooltipContent
                          side="top"
                          sideOffset={8}
                          style={{
                            backgroundColor: PRIMARY,
                            color: PRIMARY_FG,
                          }}
                        >
                          Ver Recursos
                        </TooltipContent>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}