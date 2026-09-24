"use client";

import * as React from "react";

import { Loader2 } from "lucide-react";

import { Modal } from "@/components/ui/modal";

import type {
    RecursoSalaResponse,
    SalaResponse,
} from "@/types/api";

import { recursoSalaService } from "@/services/recurso-sala.service";

interface RecursosSalaModalProps {
    open: boolean;
    onClose: () => void;
    sala: SalaResponse | null;
}

export function RecursosSalaModal({
    open,
    onClose,
    sala,
}: RecursosSalaModalProps) {
    const [
        recursos,
        setRecursos,
    ] = React.useState<
        RecursoSalaResponse[]
    >([]);

    const [
        carregando,
        setCarregando,
    ] = React.useState(false);

    const [erro, setErro] =
        React.useState<
            string | null
        >(null);

    React.useEffect(() => {
        if (!open || !sala) {
            return;
        }

        async function carregarRecursos() {
            try {
                setCarregando(true);
                setErro(null);
                setRecursos([]);

                const resposta =
                    await recursoSalaService.listar({
                        salaId: Number(sala?.id),
                        page: 0,
                        size: 100,
                    });

                setRecursos(
                    resposta.content,
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar recursos:",
                    error,
                );

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os recursos.",
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarRecursos();
    }, [open, sala]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            className="max-w-md"
        >
            <div className="flex flex-col gap-4">
                <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                    Recursos —{" "}
                    {sala?.codigo ?? ""}
                </h2>

                {carregando ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <Loader2 className="size-6 animate-spin text-[#0099AA]" />

                        <p className="text-sm text-[#17264D]/70">
                            Carregando recursos...
                        </p>
                    </div>
                ) : erro ? (
                    <p className="py-4 text-center text-sm text-[#BA1A1A]">
                        {erro}
                    </p>
                ) : recursos.length ===
                    0 ? (
                    <p className="py-4 text-center text-sm text-[#17264D]/70">
                        Nenhum recurso cadastrado para esta sala.
                    </p>
                ) : (
                    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                        {recursos.map(
                            (item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 rounded-[12px] border border-[#D0D4D8] bg-white px-4 py-3"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[#17264D]">
                                            {
                                                item
                                                    .recurso
                                                    .nome
                                            }
                                        </span>

                                        <span className="text-xs text-[#17264D]/60">
                                            {
                                                item
                                                    .recurso
                                                    .tipo
                                                    .nome
                                            }
                                        </span>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-[#0099AA]/10 px-3 py-1 text-xs font-semibold text-[#0099AA]">
                                        Qtd.:{" "}
                                        {
                                            item.quantidade
                                        }
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}