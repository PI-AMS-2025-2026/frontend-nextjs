"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Sala } from "@/lib/salas";

interface DadosSala {
    codigo: string;
    capacidade: number;
    tipo: string;
}

interface SalaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    sala?: Sala | null;
    onConfirm: (dados: DadosSala) => void;
}

export function SalaFormModal({
    open,
    onClose,
    mode,
    sala,
    onConfirm,
}: SalaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <SalaFormConteudo
                key={sala?.id ?? "novo"}
                mode={mode}
                sala={sala}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function SalaFormConteudo({
    mode,
    sala,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    sala?: Sala | null;
    onCancel: () => void;
    onConfirm: (dados: DadosSala) => void;
}) {
    const [codigo, setCodigo] = React.useState(sala?.codigo ?? "");
    const [capacidade, setCapacidade] = React.useState(sala?.capacidade ?? 0);
    const [tipo, setTipo] = React.useState(sala?.tipo ?? "");
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Sala" : "Edição de Sala";

    function handleConfirmar() {
        if (!codigo.trim()) return setErro("Informe o código da sala.");
        if (capacidade <= 0) return setErro("A capacidade deve ser maior que zero.");
        if (!tipo.trim()) return setErro("Informe o tipo de sala.");

        onConfirm({
            codigo: codigo.trim(),
            capacidade,
            tipo: tipo.trim(),
        });
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    label="Código da Sala:"
                    showLabel
                    value={codigo}
                    onChange={(e) => {
                        setCodigo(e.target.value);
                        setErro("");
                    }}
                    placeholder="Digite aqui..."
                />

                <Input
                    label="Capacidade:"
                    showLabel
                    type="number"
                    min={0}
                    value={capacidade}
                    onChange={(e) => {
                        setCapacidade(Number(e.target.value));
                        setErro("");
                    }}
                />

                <Input
                    label="Tipo de Sala:"
                    showLabel
                    value={tipo}
                    onChange={(e) => {
                        setTipo(e.target.value);
                        setErro("");
                    }}
                    placeholder="Digite aqui..."
                />
            </div>

            {erro && <p className="text-sm text-[#BA1A1A]">{erro}</p>}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button variant="secondary" size="small" onClick={handleConfirmar}>
                    Confirmar
                </Button>
            </div>
        </div>
    );
}