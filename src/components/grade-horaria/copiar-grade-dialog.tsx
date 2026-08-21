"use client";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CopiarGradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function CopiarGradeDialog({ open, onOpenChange, onConfirm }: CopiarGradeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md !bg-white !text-[#0c2c3e]">
                <DialogHeader>
                    <DialogTitle className="text-xl !text-[#0c2c3e]">Copiar Grade</DialogTitle>
                </DialogHeader>

                <p className="text-sm !text-[#0c2c3e]">
                    Tem certeza que deseja copiar esta grade?
                </p>

                <DialogFooter className="!bg-transparent !border-t-0 !mx-0 !mb-0 !p-0 !pt-2">
                    <Button
                        type="button"
                        variant="default"
                        className="!bg-transparent !text-[#0c2c3e]/70 !shadow-none font-semibold tracking-wide hover:!bg-muted"
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