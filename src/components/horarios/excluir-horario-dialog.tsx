"use client";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExcluirHorarioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function ExcluirHorarioDialog({
    open,
    onOpenChange,
    onConfirm,
}: ExcluirHorarioDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Excluir Horário</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-1 py-1">
                    <p className="text-sm text-foreground">
                        Tem certeza que deseja excluir este Horário?
                    </p>
                    <p className="text-sm font-medium text-[#1c5468]">
                        A ação será irreversível.
                    </p>
                </div>

                <DialogFooter className="!bg-transparent !border-t-0 !mx-0 !mb-0 !p-0 !pt-2">
                    <Button
                        type="button"
                        variant="default"
                        className="!bg-transparent !text-foreground/70 !shadow-none font-semibold tracking-wide hover:!bg-muted"
                        onClick={() => onOpenChange(false)}
                    >
                        CANCELAR
                    </Button>
                    <Button
                        type="button"
                        className="bg-[#2fa4b5] font-semibold tracking-wide text-white hover:bg-[#2a93a2]"
                        onClick={onConfirm}
                    >
                        CONFIRMAR
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}