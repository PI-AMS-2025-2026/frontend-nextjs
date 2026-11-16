"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { DisciplinaResponse, ProfessorResponse } from "@/types/api";

interface DadosVinculo {
    professorId: number;
    disciplinaId: number;
}

interface ProfessorDisciplinaFormModalProps {
    open: boolean;
    onClose: () => void;
    professores: ProfessorResponse[];
    disciplinas: DisciplinaResponse[];
    onConfirm: (dados: DadosVinculo) => void | Promise<void>;
}

export function ProfessorDisciplinaFormModal({
    open,
    onClose,
    professores,
    disciplinas,
    onConfirm,
}: ProfessorDisciplinaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl overflow-visible">
            <ProfessorDisciplinaFormConteudo
                professores={professores}
                disciplinas={disciplinas}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function ProfessorDisciplinaFormConteudo({
    professores,
    disciplinas,
    onCancel,
    onConfirm,
}: {
    professores: ProfessorResponse[];
    disciplinas: DisciplinaResponse[];
    onCancel: () => void;
    onConfirm: (dados: DadosVinculo) => void | Promise<void>;
}) {
    const [professorId, setProfessorId] = React.useState("");
    const [disciplinaId, setDisciplinaId] = React.useState("");
    const [erro, setErro] = React.useState("");
    const [salvando, setSalvando] = React.useState(false);

    async function handleConfirmar() {
        if (!professorId) return setErro("Selecione o professor.");
        if (!disciplinaId) return setErro("Selecione a disciplina.");

        setSalvando(true);
        try {
            await onConfirm({
                professorId: Number(professorId),
                disciplinaId: Number(disciplinaId),
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                Vincular Professor à Disciplina
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Professor</label>
                    <Select
                        options={professores.map((p) => ({
                            label: p.nome,
                            value: String(p.id),
                        }))}
                        value={professorId}
                        onChange={(v) => {
                            setProfessorId(v);
                            setErro("");
                        }}
                        placeholder="Selecione o Professor"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Disciplina</label>
                    <Select
                        options={disciplinas.map((d) => ({
                            label: d.nome,
                            value: String(d.id),
                        }))}
                        value={disciplinaId}
                        onChange={(v) => {
                            setDisciplinaId(v);
                            setErro("");
                        }}
                        placeholder="Selecione a Disciplina"
                    />
                </div>
            </div>

            {erro && <p className="text-sm text-[#BA1A1A]">{erro}</p>}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    disabled={salvando}
                    onClick={handleConfirmar}
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
}
