"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { recursoSalaService } from "@/services/recurso-sala.service";
import type { RecursoSalaResponse, SalaResponse } from "@/types/api";

interface RecursosSalaModalProps {
    open: boolean;
    onClose: () => void;
    sala: SalaResponse | null;
}

export function RecursosSalaModal({ open, onClose, sala }: RecursosSalaModalProps) {
    const [recursos, setRecursos] = React.useState<RecursoSalaResponse[]>([]);
    const [carregando, setCarregando] = React.useState(false);
    const [erro, setErro] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!open || !sala) return;

        let cancelado = false;
        setCarregando(true);
        setErro(null);
        setRecursos([]);

        recursoSalaService
            .listar({ salaId: sala.id, page: 0, size: 200 })
            .then((res) => {
                if (!cancelado) setRecursos(res.content);
            })
            .catch((e) => {
                if (!cancelado)
                    setErro(e instanceof Error ? e.message : "Erro ao carregar recursos.");
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [open, sala]);

    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                    Recursos — {sala?.codigo ?? ""}
                </h2>

                {carregando ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-[#17264D]/70">
                        <Loader2 className="size-5 animate-spin text-[#0099AA]" />
                        Carregando recursos...
                    </div>
                ) : erro ? (
                    <p className="py-4 text-center text-sm text-[#BA1A1A]">{erro}</p>
                ) : recursos.length === 0 ? (
                    <p className="py-4 text-center text-sm text-[#17264D]/70">
                        Nenhum recurso cadastrado para esta sala.
                    </p>
                ) : (
                    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                        {recursos.map((rs) => (
                            <div
                                key={rs.id}
                                className="flex items-center justify-between gap-3 rounded-[12px] border border-[#D0D4D8] bg-white px-4 py-3"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#17264D]">
                                        {rs.recurso.nome}
                                    </span>
                                    <span className="text-xs text-[#17264D]/60">
                                        {rs.recurso.tipo?.nome}
                                    </span>
                                </div>
                                <span className="shrink-0 rounded-full bg-[#F2F2F2] px-3 py-1 text-xs font-semibold text-[#17264D]">
                                    {rs.quantidade}x
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}