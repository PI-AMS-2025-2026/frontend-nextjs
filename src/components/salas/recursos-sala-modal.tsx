"use client";

import { Modal } from "@/components/ui/modal";
import type { Sala } from "@/lib/salas";

interface RecursosSalaModalProps {
    open: boolean;
    onClose: () => void;
    sala: Sala | null;
}

export function RecursosSalaModal({ open, onClose, sala }: RecursosSalaModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                    Recursos — {sala?.codigo ?? ""}
                </h2>

                {!sala || sala.recursos.length === 0 ? (
                    <p className="py-4 text-center text-sm text-[#17264D]/70">
                        Nenhum recurso cadastrado para esta sala.
                    </p>
                ) : (
                    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                        {sala.recursos.map((recurso) => (
                            <div
                                key={recurso.id}
                                className="flex items-center gap-3 rounded-[12px] border border-[#D0D4D8] bg-white px-4 py-3"
                            >
                                <span
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: recurso.cor }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#17264D]">
                                        {recurso.nome}
                                    </span>
                                    <span className="text-xs text-[#17264D]/60">
                                        {recurso.categoria}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
