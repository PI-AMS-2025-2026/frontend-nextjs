"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ExcluirSalaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  linkedCount?: number | null;
}

export function ExcluirSalaModal({
  open,
  onClose,
  onConfirm,
  linkedCount = null,
}: ExcluirSalaModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h2 className="pr-12 text-xl font-semibold text-[#17264D]">Excluir Sala</h2>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-[#17264D]">
            {linkedCount === null
              ? "Tem certeza que deseja excluir esta sala?"
              : `Esta sala possui ${linkedCount} alocação(ões). Se continuar, a sala e essas alocações serão excluídas. O histórico será preservado.`}
          </p>
          <p className="text-sm font-medium text-[#BA1A1A]">A ação será irreversível.</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="small" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" size="small" onClick={onConfirm}>
            {linkedCount === null ? "Confirmar" : "Excluir sala e alocações"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
