"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { BlocoHorarioResponse, ProfessorResponse } from "@/types/api";
import type { DisponibilidadeProfessor } from "./disponibilidade-professor-api";
import { DIAS_SEMANA, formatarHora, mesmoDia } from "./dias-semana";

export interface DadosDisponibilidade {
    professorId: number;
    diaSemana: string;
    blocoHorarioId: number;
}

interface DisponibilidadeProfessorFormModalProps {
    open: boolean;
    onClose: () => void;
    disponibilidade?: DisponibilidadeProfessor | null;
    professores: ProfessorResponse[];
    blocos: BlocoHorarioResponse[];
    onConfirm: (dados: DadosDisponibilidade) => void | Promise<void>;
}

export function DisponibilidadeProfessorFormModal({
    open,
    onClose,
    disponibilidade,
    professores,
    blocos,
    onConfirm,
}: DisponibilidadeProfessorFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-2xl overflow-visible">
            <DisponibilidadeProfessorFormConteudo
                disponibilidade={disponibilidade ?? null}
                professores={professores}
                blocos={blocos}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function DisponibilidadeProfessorFormConteudo({
    disponibilidade,
    professores,
    blocos,
    onCancel,
    onConfirm,
}: {
    disponibilidade: DisponibilidadeProfessor | null;
    professores: ProfessorResponse[];
    blocos: BlocoHorarioResponse[];
    onCancel: () => void;
    onConfirm: (dados: DadosDisponibilidade) => void | Promise<void>;
}) {
    const edicao = disponibilidade !== null;
    const [professor, setProfessor] = React.useState(disponibilidade?.professor.nome ?? "");
    const [diaSemana, setDiaSemana] = React.useState<string>(
        DIAS_SEMANA.find((d) => mesmoDia(d.value, disponibilidade?.diaSemana ?? ""))?.value ?? "",
    );
    const [blocoHorarioId, setBlocoHorarioId] = React.useState(
        disponibilidade ? String(disponibilidade.blocoHorario.id) : "",
    );
    const [erro, setErro] = React.useState("");
    const [salvando, setSalvando] = React.useState(false);

    const opcoesHorarios = blocos.map((bloco) => ({
        value: String(bloco.id),
        label: `${formatarHora(bloco.horaInicio)} - ${formatarHora(bloco.horaFim)}`,
    }));

    async function handleConfirmar() {
        const nome = professor.trim().toLowerCase();
        const encontrado = professores.find((p) => p.nome.trim().toLowerCase() === nome);

        if (!nome) return setErro("Selecione o professor.");
        if (!encontrado) return setErro("Professor não encontrado.");
        if (!diaSemana) return setErro("Selecione o dia da semana.");
        if (!blocoHorarioId) return setErro("Selecione o bloco de horário.");

        const bloco = blocos.find((b) => b.id === Number(blocoHorarioId));
        if (!bloco) return setErro("Bloco de horário não encontrado.");

        setSalvando(true);
        setErro("");
        try {
            await onConfirm({
                professorId: encontrado.id,
                diaSemana,
                blocoHorarioId: bloco.id,
            });
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível salvar a disponibilidade.",
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-2xl font-semibold text-[#17264D]">
                {edicao ? "Edição de Disponibilidade" : "Cadastro de Disponibilidade"}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Input
                        label="Professor"
                        showLabel
                        height="36px"
                        className="rounded-[10px] text-sm"
                        placeholder="Digite o nome do professor..."
                        list="professores-disponibilidade"
                        value={professor}
                        onChange={(e) => {
                            setProfessor(e.target.value);
                            setErro("");
                        }}
                    />
                    <datalist id="professores-disponibilidade">
                        {professores.map((p) => (
                            <option key={p.id} value={p.nome} />
                        ))}
                    </datalist>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Dia da Semana</label>
                    <Select
                        options={DIAS_SEMANA}
                        value={diaSemana}
                        onChange={(v) => {
                            setDiaSemana(v);
                            setErro("");
                        }}
                        placeholder="Selecione..."
                        maxVisibleOptions={4}
                        slimScrollbar
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Bloco de Horário</label>
                    <Select
                        options={opcoesHorarios}
                        value={blocoHorarioId}
                        onChange={(value) => {
                            setBlocoHorarioId(value);
                            setErro("");
                        }}
                        placeholder="Selecione o bloco de horário..."
                        maxVisibleOptions={4}
                        slimScrollbar
                    />
                </div>
            </div>
            {erro && (
                <p role="alert" className="text-sm text-[#BA1A1A]">
                    {erro}
                </p>
            )}
            <div className="mt-8 flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={salvando}>
                    Cancelar
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    disabled={salvando}
                    onClick={handleConfirmar}
                >
                    {salvando ? "Salvando..." : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}