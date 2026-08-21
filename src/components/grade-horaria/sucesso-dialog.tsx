"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SucessoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mensagem: string;
    autoCloseMs?: number;
    /** Se informado, mostra um botão de ação extra abaixo da mensagem (ex: "VISUALIZAR GRADE"). */
    acao?: {
        label: string;
        onClick: () => void;
    };
}

export function SucessoDialog({
    open,
    onOpenChange,
    mensagem,
    autoCloseMs = 1800,
    acao,
}: SucessoDialogProps) {
    React.useEffect(() => {
        // Se tiver uma ação extra, não fecha sozinho — deixa a pessoa decidir clicando
        if (!open || acao) return;
        const timer = setTimeout(() => onOpenChange(false), autoCloseMs);
        return () => clearTimeout(timer);
    }, [open, autoCloseMs, onOpenChange, acao]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex flex-col items-center gap-3 py-8 text-center sm:max-w-xs !bg-white"
            >
                {/* Título exigido pelo Radix para acessibilidade (leitor de tela),
            mas visualmente escondido porque o ícone + mensagem já bastam aqui. */}
                <VisuallyHidden.Root asChild>
                    <DialogTitle>{mensagem}</DialogTitle>
                </VisuallyHidden.Root>
                <CheckCircle2 className="size-12 text-[#2fa4b5]" strokeWidth={1.5} />
                <p className="text-base font-medium !text-[#0c2c3e]">{mensagem}</p>
                {acao && (
                    <Button
                        type="button"
                        className="mt-1 bg-[#2fa4b5] font-semibold tracking-wide text-white hover:bg-[#2a93a2]"
                        onClick={acao.onClick}
                    >
                        {acao.label}
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
}