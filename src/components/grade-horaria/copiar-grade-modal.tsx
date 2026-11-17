"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { PeriodoAtividadeQuadroResponse } from "@/types/api";

interface CopiarGradeModalProps {
    open: boolean;
    onClose: () => void;
    periodos: PeriodoAtividadeQuadroResponse[];
    onConfirm: (periodoId: number) => void;
    submitting?: boolean;
    errorMessage?: string;
}

function rotuloPeriodo(periodo: PeriodoAtividadeQuadroResponse) {
    return periodo.tipoPeridoAtividadeQuadro === "ANUAL"
        ? `${periodo.ano} (Anual)`
        : `${periodo.periodo}º período de ${periodo.ano}`;
}

export function CopiarGradeModal({ open, onClose, periodos, onConfirm, submitting = false, errorMessage = "" }: CopiarGradeModalProps) {
    const [periodoId, setPeriodoId] = React.useState("");

    return (
        <Modal open={open} onClose={() => { if (!submitting) onClose(); }} className="max-w-xl overflow-visible">
            <div className="flex flex-col gap-4">
<<<<<<< HEAD
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">Copiar Grade</h2>
                <p className="text-sm text-[#17264D]">Selecione o período letivo para a nova versão da grade.</p>
                <Select
                    options={periodos.map((periodo) => ({ label: rotuloPeriodo(periodo), value: String(periodo.id) }))}
                    value={periodoId}
                    onChange={setPeriodoId}
                    placeholder="Selecione o período letivo"
                    disabled={submitting || !periodos.length}
                />
                {errorMessage && <p role="alert" className="text-sm text-[#BA1A1A]">{errorMessage}</p>}
=======
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">Copiar Quadro Horário</h2>

                <p className="text-sm text-[#17264D]">
                    Tem certeza que deseja copiar este quadro horário?
                </p>

>>>>>>> dev
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" size="small" onClick={onClose} disabled={submitting}>Cancelar</Button>
                    <Button variant="secondary" size="small" onClick={() => onConfirm(Number(periodoId))} disabled={submitting || !periodoId}>
                        {submitting ? "Copiando…" : "Confirmar"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
