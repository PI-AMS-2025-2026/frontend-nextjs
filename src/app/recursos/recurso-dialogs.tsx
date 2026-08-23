import { RefObject } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { Recurso } from "./types"
import { PRIMARY, PRIMARY_FG } from "./constants"

export const NOVO_TIPO_VALUE = "__novo__"

// -------------------------------------------------------
// Modal de Cadastro / Edição de Recurso
// -------------------------------------------------------
type RecursoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recursoEditando: Recurso | null

  formNome: string
  onFormNomeChange: (valor: string) => void

  formTipo: string
  modoNovoTipo: boolean
  formNovoTipo: string
  onFormNovoTipoChange: (valor: string) => void

  erros: Record<string, string>

  tipoDropdownAberto: boolean
  onToggleTipoDropdown: () => void
  tipoDropdownRef: RefObject<HTMLDivElement>
  tiposDisponiveis: string[]
  isTipoCustomizado: (tipo: string) => boolean
  onSelecionarTipo: (valor: string) => void

  onCancelar: () => void
  onSalvar: () => void
}

export function RecursoFormDialog({
  open,
  onOpenChange,
  recursoEditando,
  formNome,
  onFormNomeChange,
  formTipo,
  modoNovoTipo,
  formNovoTipo,
  onFormNovoTipoChange,
  erros,
  tipoDropdownAberto,
  onToggleTipoDropdown,
  tipoDropdownRef,
  tiposDisponiveis,
  isTipoCustomizado,
  onSelecionarTipo,
  onCancelar,
  onSalvar,
}: RecursoFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[420px] p-8 bg-white rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-2xl font-bold">
            {recursoEditando ? "Edição de Recurso" : "Cadastro de Recurso"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome" className="text-sm">Nome:</Label>
            <Input
              id="nome"
              placeholder="Digite aqui..."
              value={formNome}
              onChange={(e) => onFormNomeChange(e.target.value)}
              style={{ borderColor: erros.nome ? "#FF0000" : "#D1D5DB" }}
            />
            {erros.nome && <span className="text-xs text-red-500">{erros.nome}</span>}
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo" className="text-sm">Tipo{modoNovoTipo ? "" : " :"}</Label>
            {modoNovoTipo ? (
              <Input
                id="tipo"
                placeholder="Digite aqui..."
                value={formNovoTipo}
                onChange={(e) => onFormNovoTipoChange(e.target.value)}
                style={{ borderColor: erros.tipo ? "#FF0000" : "#D1D5DB" }}
                autoFocus
              />
            ) : (
              <div className="relative" ref={tipoDropdownRef}>
                <button
                  type="button"
                  id="tipo"
                  onClick={onToggleTipoDropdown}
                  className="w-full h-11 px-3 flex items-center justify-between rounded-md text-sm hover:border-[#0099AA] transition-colors"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: formTipo === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                    border: `1.4px solid ${erros.tipo ? "#FF0000" : tipoDropdownAberto ? "#4471E6" : "#D1D5DB"}`,
                  }}
                >
                  <span className="flex items-center gap-2 truncate">
                    {formTipo === "" ? "Selecione..." : formTipo}
                    {formTipo !== "" && isTipoCustomizado(formTipo) && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: "#4471E6", color: "#FFFFFF" }}
                      >
                        Novo
                      </span>
                    )}
                  </span>
                  <ChevronDownIcon className="size-4 shrink-0" style={{ color: "#666" }} />
                </button>

                {tipoDropdownAberto && (
                  <div
                    className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg overflow-hidden"
                    style={{ borderColor: "#D1D5DB" }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelecionarTipo(NOVO_TIPO_VALUE)}
                      className="w-full text-left px-3 py-2 text-sm border-b hover:bg-[#EAF6FB] transition-colors"
                      style={{ borderColor: "#E5E7EB" }}
                    >
                      + Novo tipo
                    </button>
                    {tiposDisponiveis.map((tipo) => (
                      <button
                        type="button"
                        key={tipo}
                        onClick={() => onSelecionarTipo(tipo)}
                        className="w-full flex items-center justify-between text-left px-3 py-2 text-sm border-b last:border-b-0 hover:bg-[#EAF6FB] transition-colors"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        {tipo}
                        {isTipoCustomizado(tipo) && (
                          <span
                            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                            style={{ backgroundColor: "#4471E6", color: "#FFFFFF" }}
                          >
                            Novo
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {erros.tipo && <span className="text-xs text-red-500">{erros.tipo}</span>}
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
// Modal de Exclusão de Recurso
// -------------------------------------------------------
type ExcluirRecursoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurso: Recurso | null
  onCancelar: () => void
  onConfirmar: () => void
}

export function ExcluirRecursoDialog({
  open,
  onOpenChange,
  recurso,
  onCancelar,
  onConfirmar,
}: ExcluirRecursoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[760px] p-8 bg-white rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="mb-1">
          <DialogTitle className="text-left text-2xl font-bold">
            Excluir Recurso
          </DialogTitle>
        </DialogHeader>

        <p className="text-base">
          Tem certeza que deseja excluir {recurso ? `o recurso "${recurso.nome}"` : "este Recurso"}?
        </p>
        <p className="text-sm mt-1" style={{ color: "rgba(0, 0, 0, 0.45)" }}>
          A ação será irreversível.
        </p>

        <DialogFooter className="mt-6 bg-transparent border-t-0 px-0 pb-0 gap-3">
          <button
            onClick={onCancelar}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-widest uppercase px-4"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
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
// Modal de Sucesso (cadastrar / editar / excluir)
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
