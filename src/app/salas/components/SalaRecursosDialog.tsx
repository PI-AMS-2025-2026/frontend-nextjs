import { Sala } from "../types"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const RECURSO_DOT = "#9B2242"

type SalaRecursosDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    sala: Sala | null
}

export function SalaRecursosDialog({
    open,
    onOpenChange,
    sala,
}: SalaRecursosDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[420px] p-6 bg-white rounded-2xl">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-left text-xl font-semibold">
                        Recursos — {sala?.codigo}
                    </DialogTitle>
                </DialogHeader>

                {sala && (
                    <div className="flex flex-col gap-3">
                        {sala.recursos.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                Nenhum recurso cadastrado para esta sala.
                            </p>
                        ) : (
                            sala.recursos.map((recurso, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 rounded-lg border p-3"
                                    style={{ borderColor: "rgba(23, 38, 77, 0.15)" }}
                                >
                                    <span
                                        className="mt-1.5 size-2 rounded-full shrink-0"
                                        style={{ backgroundColor: RECURSO_DOT }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{recurso.nome}</span>
                                        <span className="text-xs text-muted-foreground">{recurso.categoria}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}