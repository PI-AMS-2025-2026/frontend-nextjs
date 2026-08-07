"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Horario } from "@/lib/horarios";

interface HorarioFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "cadastrar" | "editar";
    horario?: Horario | null;
    onConfirm: (dados: { inicio: string; fim: string }) => void;
}

export function HorarioFormDialog({
    open,
    onOpenChange,
    mode,
    horario,
    onConfirm,
}: HorarioFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* key força o reset dos campos toda vez que o modal reabre com um horário diferente */}
            <HorarioFormContent
                key={open ? (horario?.id ?? "novo") : "fechado"}
                mode={mode}
                horario={horario}
                onCancel={() => onOpenChange(false)}
                onConfirm={onConfirm}
            />
        </Dialog>
    );
}

interface HorarioFormContentProps {
    mode: "cadastrar" | "editar";
    horario?: Horario | null;
    onCancel: () => void;
    onConfirm: (dados: { inicio: string; fim: string }) => void;
}

function HorarioFormContent({
    mode,
    horario,
    onCancel,
    onConfirm,
}: HorarioFormContentProps) {
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
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-xl">{titulo}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="horario-inicio">Início</Label>
                    <Input
                        id="horario-inicio"
                        type="time"
                        value={inicio}
                        onChange={(e) => setInicio(e.target.value)}
                        className="border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="horario-fim">Fim</Label>
                    <Input
                        id="horario-fim"
                        type="time"
                        value={fim}
                        onChange={(e) => setFim(e.target.value)}
                        className="border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <DialogFooter className="!bg-transparent !border-t-0 !mx-0 !mb-0 !p-0 !pt-2">
                <Button
                    type="button"
                    variant="default"
                    className="!bg-transparent !text-foreground/70 !shadow-none font-semibold tracking-wide hover:!bg-muted"
                    onClick={onCancel}
                >
                    CANCELAR
                </Button>
                <Button
                    type="button"
                    className="bg-[#2fa4b5] font-semibold tracking-wide text-white hover:bg-[#2a93a2]"
                    onClick={handleConfirmar}
                >
                    CONFIRMAR
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}