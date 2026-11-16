"use client";

import { Modal } from "@/components/ui/modal";
import { type Sala } from "@/lib/salas";

interface SalaRecursosModalProps {
    open: boolean;
    onClose: () => void;
    sala: Sala | null;
}

export function SalaRecursosModal({ open, onClose, sala }: SalaRecursosModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                    Recursos — {sala?.codigo}
                </h2>

                <div className="flex flex-col gap-3">
                    {!sala || sala.recursos.length === 0 ? (
                        <p className="py-4 text-center text-sm text-[#17264D]/70">
                            Nenhum recurso cadastrado para esta sala.
                        </p>
                    ) : (
                        sala.recursos.map((recurso, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 rounded-lg border border-[#C8CDD2] p-3"
                            >
                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0099AA]" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#17264D]">
                                        {recurso.nome}
                                    </span>
                                    <span className="text-xs text-[#17264D]/60">{recurso.categoria}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
}
