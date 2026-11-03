"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Id, SalaResponse, TipoSalaResponse } from "@/types/api";

export interface DadosSala {
    codigo: string;
    capacidade: number;
    tipoSalaId: Id;
}

interface SalaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    sala?: SalaResponse | null;
    tiposSala: TipoSalaResponse[];
    salvando?: boolean;
    erroExterno?: string | null;
    onConfirm: (dados: DadosSala) => void;
}

export function SalaFormModal({
    open,
    onClose,
    mode,
    sala,
    tiposSala,
    salvando = false,
    erroExterno,
    onConfirm,
}: SalaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <SalaFormConteudo
                key={sala?.id ?? "novo"}
                mode={mode}
                sala={sala}
                tiposSala={tiposSala}
                salvando={salvando}
                erroExterno={erroExterno}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function SalaFormConteudo({
    mode,
    sala,
    tiposSala,
    salvando,
    erroExterno,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    sala?: SalaResponse | null;
    tiposSala: TipoSalaResponse[];
    salvando: boolean;
    erroExterno?: string | null;
    onCancel: () => void;
    onConfirm: (dados: DadosSala) => void;
}) {
    const [codigo, setCodigo] = React.useState(sala?.codigo ?? "");
    const [capacidade, setCapacidade] = React.useState(sala?.capacidade ?? 0);
    const [tipoSalaId, setTipoSalaId] = React.useState<string>(
        sala ? String(sala.tipoSala.id) : ""
    );
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Sala" : "Edição de Sala";

    function handleConfirmar() {
        if (!codigo.trim()) return setErro("Informe o código da sala.");
        if (capacidade <= 0) return setErro("A capacidade deve ser maior que zero.");
        if (!tipoSalaId) return setErro("Selecione o tipo de sala.");

        onConfirm({
            codigo: codigo.trim(),
            capacidade,
            tipoSalaId: Number(tipoSalaId),
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

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label
                        htmlFor="tipo-sala"
                        className="text-sm font-medium text-[#17264D]"
                    >
                        Tipo de Sala:
                    </label>
                    <select
                        id="tipo-sala"
                        value={tipoSalaId}
                        onChange={(e) => {
                            setTipoSalaId(e.target.value);
                            setErro("");
                        }}
                        className="h-11 w-full rounded-[10px] border border-[#C8CDD2] bg-white px-3 text-sm text-[#17264D] outline-none focus:border-[#0099AA]"
                    >
                        <option value="">Selecione...</option>
                        {tiposSala.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {(erro || erroExterno) && (
                <p className="text-sm text-[#BA1A1A]">{erro || erroExterno}</p>
            )}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={salvando}>
                    Cancelar
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={handleConfirmar}
                    disabled={salvando}
                >
                    {salvando ? "Salvando..." : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}