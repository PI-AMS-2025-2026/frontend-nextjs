import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PencilIcon, FunnelIcon, CircleCheckIcon, CircleMinusIcon } from "lucide-react"
import { Turma } from "./types"
import { PRIMARY, PRIMARY_FG } from "./constants"

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
    <div className="overflow-hidden rounded-xl border border-[#D9D9D9]">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow
            className="border-0 hover:bg-transparent"
            style={{ backgroundColor: PRIMARY }}
          >
            <TableHead
              className="w-[80px] rounded-tl-lg text-base font-bold py-4 pl-6"
              style={{ color: PRIMARY_FG }}
            >ID</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Período</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Ano</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Qtd Alunos</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Curso</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>
              <span className="flex items-center gap-2">
                Status
                <FunnelIcon className="size-4 py-4" />
              </span>
            </TableHead>
            <TableHead className="text-right rounded-tr-lg text-base font-bold py-4 pr-6" style={{ color: PRIMARY_FG }}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {turmas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma turma encontrada.
              </TableCell>
            </TableRow>
          ) : (
            turmas.map((turma, index) => (
              <TableRow
                key={turma.id}
                className={`
                  ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                  border-b border-[#D9D9D9]
                  hover:bg-[#EAF6FB]
                  transition-colors
                  cursor-pointer
                `}
              >
                <TableCell className="py-4 pl-6">{turma.id}</TableCell>
                <TableCell className="py-4">{turma.periodo}</TableCell>
                <TableCell className="py-4">{turma.ano}</TableCell>
                <TableCell className="py-4">{turma.qtdAlunos}</TableCell>
                <TableCell className="max-w-[200px] truncate py-4" title={turma.curso}>
                  {turma.curso}
                </TableCell>
                <TableCell className="py-4">
                  {turma.status === "Ativo" ? (
                    <span className="inline-flex items-center gap-2 text-[#21C11E] font-medium">
                      <CircleCheckIcon className="h-5 w-5" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[#FF0000] font-medium">
                      <CircleMinusIcon className="h-5 w-5" />
                      Inativo
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditar(turma)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                      style={{ color: PRIMARY }}
                    >
                      <PencilIcon className="size-4 group-hover:text-white transition-colors" />
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
