"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { CheckCircle2 } from "lucide-react";

interface SucessoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mensagem: string;
  autoCloseMs?: number;
}

export function SucessoDialog({
  open,
  onOpenChange,
  mensagem,
  autoCloseMs = 1800,
}: SucessoDialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onOpenChange(false), autoCloseMs);
    return () => clearTimeout(timer);
  }, [open, autoCloseMs, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col items-center gap-3 py-8 text-center sm:max-w-xs"
      >
        {/* Título exigido pelo Radix para acessibilidade (leitor de tela),
            mas visualmente escondido porque o ícone + mensagem já bastam aqui. */}
        <VisuallyHidden.Root asChild>
          <DialogTitle>{mensagem}</DialogTitle>
        </VisuallyHidden.Root>
        <CheckCircle2 className="size-12 text-[#2fa4b5]" strokeWidth={1.5} />
        <p className="text-base font-medium text-foreground">{mensagem}</p>
      </DialogContent>
    </Dialog>
  );
}