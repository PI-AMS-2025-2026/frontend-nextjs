import { Sala } from "../types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"

import { Label } from "@/components/ui/label"

import { TIPOS, PRIMARY, PRIMARY_FG } from "../constants"

type SalaFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  salaEditando: Sala | null

  formCodigo: string
  onCodigoChange: (value: string) => void

  formCapacidade: string
  onCapacidadeChange: (value: string) => void

  formTipo: string
  onTipoChange: (value: string) => void


  erros: Record<string, string>

  onSalvar: () => void
}

export function SalaFormDialog({
  open,
  onOpenChange,
  salaEditando,
  formCodigo,
  onCodigoChange,
  formCapacidade,
  onCapacidadeChange,
  formTipo,
  onTipoChange,
  erros,
  onSalvar,
}: SalaFormDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[560px] p-8 bg-white rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-2xl font-bold">
            {salaEditando ? "Edição de Sala" : "Cadastro de Sala"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo" className="text-sm">Código da Sala:</Label>
              <Input
                id="codigo"
                placeholder="Digite aqui..."
                value={formCodigo}
                onChange={(e) => onCodigoChange(e.target.value)}
                style={{ borderColor: erros.codigo ? "#FF0000" : "#D1D5DB" }}
              />
              {erros.codigo && <span className="text-xs text-red-500">{erros.codigo}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacidade" className="text-sm">Capacidade:</Label>
              <Input
                id="capacidade"
                type="number"
                placeholder="0"
                value={formCapacidade}
                onChange={(e) => onCapacidadeChange(e.target.value)}
                style={{ borderColor: erros.capacidade ? "#FF0000" : "#D1D5DB" }}
              />
              {erros.capacidade && <span className="text-xs text-red-500">{erros.capacidade}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo" className="text-sm">Tipo de Sala:</Label>
            <NativeSelect
              id="tipo"
              className="w-full h-11 hover:border-[#0099AA] transition-colors"
              value={formTipo}
              onChange={(e) => onTipoChange(e.target.value)}
              style={{
                backgroundColor: "#F2F2F2",
                color: formTipo === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                borderColor: erros.tipo ? "#FF0000" : "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
            >
              <NativeSelectOption value="">Selecione...</NativeSelectOption>
              {TIPOS.map((tipo) => (
                <NativeSelectOption key={tipo} value={tipo}>
                  {tipo}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {erros.tipo && <span className="text-xs text-red-500">{erros.tipo}</span>}
          </div>


        </div>


        <DialogFooter className="mt-6 bg-transparent border-t-0 px-0 pb-0 gap-3">
          <button
            onClick={() => onOpenChange(false)}
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

