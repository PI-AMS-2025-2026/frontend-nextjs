import { Sala } from "../types"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { PRIMARY, PRIMARY_FG } from "../constants"

type SalaExcluirDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    sala: Sala | null
    onConfirmar: () => void
}

export function SalaExcluirDialog({
    open,
    onOpenChange,
    sala,
    onConfirmar,
}: SalaExcluirDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="!max-w-[760px] p-8 bg-white rounded-2xl"
                showCloseButton={false}
            >
                <DialogHeader className="mb-1">
                    <DialogTitle className="text-left text-2xl font-bold">
                        Excluir Sala
                    </DialogTitle>
                </DialogHeader>

                <p className="text-base">
                    Tem certeza que deseja excluir {sala ? `a ${sala.codigo}` : "esta Sala"}?
                </p>
                <p className="text-sm mt-1" style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                    A ação será irreversível.
                </p>

                <DialogFooter className="mt-6 bg-transparent border-t-0 px-0 pb-0 gap-3">
                    <button
                        onClick={() => onOpenChange(false)}
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