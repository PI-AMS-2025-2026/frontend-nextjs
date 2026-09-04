"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface CopiarGradeModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function CopiarGradeModal({ open, onClose, onConfirm }: CopiarGradeModalProps) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">Copiar Grade</h2>

                <p className="text-sm text-[#17264D]">
                    Tem certeza que deseja copiar esta grade?
                </p>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" size="small" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="secondary" size="small" onClick={onConfirm}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}