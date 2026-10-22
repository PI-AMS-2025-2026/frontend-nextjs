"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ProfessorDisciplinaResponse } from "@/types/api";

export type VinculoComNomes = ProfessorDisciplinaResponse & {
    professorNome: string;
    disciplinaNome: string;
};

interface ProfessorDisciplinaExclusaoModalProps {
    open: boolean;
    onClose: () => void;
    vinculo: VinculoComNomes | null;
    onConfirm: () => void | Promise<void>;
}

export function ProfessorDisciplinaExclusaoModal({
    open,
    onClose,
    vinculo,
    onConfirm,
}: ProfessorDisciplinaExclusaoModalProps) {
    const [excluindo, setExcluindo] = React.useState(false);

    async function handleConfirmar() {
        setExcluindo(true);
        try {
            await onConfirm();
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                    Excluir Vínculo
                </h2>

                <p className="text-sm text-[#17264D]">
                    Tem certeza que deseja excluir este vínculo entre o professor{" "}
                    <strong>{vinculo?.professorNome}</strong> e a disciplina{" "}
                    <strong>{vinculo?.disciplinaNome}</strong>?
                </p>

                <p className="text-sm text-[#17264D]/80">A ação será irreversível.</p>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" size="small" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        disabled={excluindo}
                        onClick={handleConfirmar}
                    >
                        Confirmar exclusão
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
