"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface SucessoGradeModalProps {
    open: boolean;
    onClose: () => void;
    mensagem: string;
    autoCloseMs?: number;
    acao?: { label: string; onClick: () => void };
}

export function SucessoGradeModal({
    open,
    onClose,
    mensagem,
    autoCloseMs = 1800,
    acao,
}: SucessoGradeModalProps) {
    React.useEffect(() => {
        // com botão de ação, não fecha sozinho — deixa a pessoa decidir
        if (!open || acao) return;
        const timer = setTimeout(onClose, autoCloseMs);
        return () => clearTimeout(timer);
    }, [open, acao, autoCloseMs, onClose]);

    return (
        <Modal open={open} onClose={onClose} className="max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-[#5E8BFF] text-[#5E8BFF]">
                    <Check className="size-9" strokeWidth={2.5} />
                </div>

                <p className="text-lg font-semibold text-[#17264D]">{mensagem}</p>

                {acao && (
                    <Button variant="secondary" size="small" onClick={acao.onClick}>
                        {acao.label}
                    </Button>
                )}
            </div>
        </Modal>
    );
}