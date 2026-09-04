import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckIcon } from "lucide-react"
import { Turma, Status } from "../../app/coordenador/estrutura-academica/turmas/types"
import { PERIODOS, CURSOS, PRIMARY, PRIMARY_FG } from "./constants"

// -------------------------------------------------------
// Modal de Cadastro / Edição de Turma
// -------------------------------------------------------
type TurmaFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  turmaEditando: Turma | null

  formPeriodo: string
  onFormPeriodoChange: (valor: string) => void

  formCurso: string
  onFormCursoChange: (valor: string) => void

  formQtdAlunos: string
  onFormQtdAlunosChange: (valor: string) => void

  formAno: string
  onFormAnoChange: (valor: string) => void

  formStatus: Status | null
  onFormStatusChange: (valor: Status) => void

  erros: Record<string, string>

  onCancelar: () => void
  onSalvar: () => void
}

const opcoesPeriodo = PERIODOS.map((periodo) => ({ label: periodo, value: periodo }))
const opcoesCurso = CURSOS.map((curso) => ({ label: curso, value: curso }))

export function TurmaFormDialog({
  open,
  onOpenChange,
  turmaEditando,
  formPeriodo,
  onFormPeriodoChange,
  formCurso,
  onFormCursoChange,
  formQtdAlunos,
  onFormQtdAlunosChange,
  formAno,
  onFormAnoChange,
  formStatus,
  onFormStatusChange,
  erros,
  onCancelar,
  onSalvar,
}: TurmaFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[640px] p-8 bg-white rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-2xl font-bold">
            {turmaEditando ? "Edição de Turma" : "Cadastro de Turma"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          {/* Linha 1 — Período + Curso */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Período:</Label>
              <Select
                options={opcoesPeriodo}
                value={formPeriodo}
                onChange={onFormPeriodoChange}
                placeholder="Selecione..."
              />
              {erros.periodo && <span className="text-xs text-red-500">{erros.periodo}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Curso:</Label>
              <Select
                options={opcoesCurso}
                value={formCurso}
                onChange={onFormCursoChange}
                placeholder="Selecione..."
              />
              {erros.curso && <span className="text-xs text-red-500">{erros.curso}</span>}
            </div>
          </div>

          {/* Linha 2 — Qtd Alunos + Ano + Status */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-start">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qtdAlunos" className="text-sm">Qtd. Alunos:</Label>
              <Input
                id="qtdAlunos"
                type="number"
                placeholder="Ex. 40"
                value={formQtdAlunos}
                onChange={(e) => onFormQtdAlunosChange(e.target.value)}
                style={{ borderColor: erros.qtdAlunos ? "#FF0000" : "#D1D5DB" }}
              />
              {erros.qtdAlunos && <span className="text-xs text-red-500">{erros.qtdAlunos}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ano" className="text-sm">Ano:</Label>
              <Input
                id="ano"
                type="number"
                placeholder="Ex. 2026"
                value={formAno}
                onChange={(e) => onFormAnoChange(e.target.value)}
                style={{ borderColor: erros.ano ? "#FF0000" : "#D1D5DB" }}
              />
              {erros.ano && <span className="text-xs text-red-500">{erros.ano}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Status:</Label>
              <RadioGroup
                value={formStatus ?? ""}
                onValueChange={(val) => onFormStatusChange(val as Status)}
                className="flex flex-row gap-4 pt-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="Ativo"
                    id="status-ativo"
                    className="size-5 border-2 border-gray-400 data-checked:bg-[#4471E6] data-checked:border-[#4471E6]"
                  />
                  <Label htmlFor="status-ativo" className="font-normal cursor-pointer">
                    Ativo
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="Inativo"
                    id="status-inativo"
                    className="size-5 border-2 border-gray-400 data-checked:bg-[#4471E6] data-checked:border-[#4471E6]"
                  />
                  <Label htmlFor="status-inativo" className="font-normal cursor-pointer">
                    Inativo
                  </Label>
                </div>
              </RadioGroup>
              {erros.status && <span className="text-xs text-red-500">{erros.status}</span>}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <DialogFooter className="mt-6 bg-transparent border-t-0 px-0 pb-0 gap-3">
          <button
            onClick={onCancelar}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-widest uppercase px-4"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-semibold tracking-widest uppercase transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY, color: PRIMARY_FG }}
          >
            Confirmar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// -------------------------------------------------------
// Modal de Sucesso (cadastrar / editar)
// -------------------------------------------------------
type SucessoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mensagem: string
}

export function SucessoDialog({ open, onOpenChange, mensagem }: SucessoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[420px] py-10 px-8 bg-[#EDEDED] rounded-2xl flex flex-col items-center gap-4"
        showCloseButton={false}
      >
        <div
          className="flex items-center justify-center size-16 rounded-full border-2"
          style={{ borderColor: "#4471E6" }}
        >
          <CheckIcon className="size-8" style={{ color: "#4471E6" }} strokeWidth={3} />
        </div>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-medium">
            {mensagem}
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}