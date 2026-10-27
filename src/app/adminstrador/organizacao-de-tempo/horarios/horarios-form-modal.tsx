"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Horario } from "@/lib/horarios";

interface HorarioFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    horario?: Horario | null;
    onConfirm: (dados: { inicio: string; fim: string }) => void;
}

export function HorarioFormModal({
    open,
    onClose,
    mode,
    horario,
    onConfirm,
}: HorarioFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-lg">
            {/* o Modal retorna null quando fechado, então o conteúdo desmonta
          e os campos já nascem limpos. o key é só garantia extra na edição */}
            <HorarioFormConteudo
                key={horario?.id ?? "novo"}
                mode={mode}
                horario={horario}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function HorarioFormConteudo({
    mode,
    horario,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    horario?: Horario | null;
    onCancel: () => void;
    onConfirm: (dados: { inicio: string; fim: string }) => void;
}) {
    const [inicio, setInicio] = React.useState(horario?.inicio ?? "");
    const [fim, setFim] = React.useState(horario?.fim ?? "");
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastrar Horário" : "Editar Horário";

    function handleConfirmar() {
        if (!inicio || !fim) {
            setErro("Preencha os horários de início e fim.");
            return;
        }
        if (inicio === fim) {
            setErro("O horário de início e fim não podem ser iguais.");
            return;
        }
        onConfirm({ inicio, fim });
    }

    return (
        <div className="flex flex-col gap-5">
            {/* pr-12 pra não passar por baixo do X do Modal */}
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    label="Início"
                    showLabel
                    type="time"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                />
                <Input
                    label="Fim"
                    showLabel
                    type="time"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
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