"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ExcluirHorarioModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExcluirHorarioModal({
    open,
    onClose,
    onConfirm,
}: ExcluirHorarioModalProps) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                    Excluir Horário
                </h2>

                <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#17264D]">
                        Tem certeza que deseja excluir este horário?
                    </p>
                    <p className="text-sm font-medium text-[#BA1A1A]">
                        A ação será irreversível.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" size="small" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="danger" size="small" onClick={onConfirm}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}