"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { type Recurso } from "@/lib/recursos";

interface RecursoExcluirModalProps {
    open: boolean;
    onClose: () => void;
    recurso: Recurso | null;
    onConfirm: () => void;
}

export function RecursoExcluirModal({
    open,
    onClose,
    recurso,
    onConfirm,
}: RecursoExcluirModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-lg">
            <div className="flex flex-col gap-5">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">Excluir Recurso</h2>

                <p className="text-sm text-[#17264D]">
                    Tem certeza que deseja excluir{" "}
                    {recurso ? `o recurso "${recurso.nome}"` : "este recurso"}?
                </p>
                <p className="text-sm text-[#17264D]/60">A ação será irreversível.</p>

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
