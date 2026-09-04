import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CheckIcon } from "lucide-react"

type SalaSucessoDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    mensagem: string
}

export function SalaSucessoDialog({
    open,
    onOpenChange,
    mensagem,
}: SalaSucessoDialogProps) {
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

