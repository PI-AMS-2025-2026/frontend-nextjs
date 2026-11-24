"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { rotuloPeriodoTurma } from "@/lib/turma-periodo";
import type { PeriodoAtividadeQuadroResponse, QuadroHorarioResponse, TurmaResponse, Status } from "@/types/api";

export interface GradeFormValues {
    versao: number;
    turmaId: number;
    periodoAtividadeQuadroId: number;
    status: Status;
}

interface GradeFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    grade?: QuadroHorarioResponse | null;
    periodos: PeriodoAtividadeQuadroResponse[];
    turmas: TurmaResponse[];
    cursoNome: string;
    onConfirm: (dados: GradeFormValues) => void;
    submitting?: boolean;
    errorMessage?: string;
}

function rotuloPeriodo(periodo: PeriodoAtividadeQuadroResponse) {
    return periodo.tipoPeridoAtividadeQuadro === "ANUAL"
        ? `${periodo.ano} (Anual)`
        : `${periodo.periodo}º período de ${periodo.ano}`;
}

const EXPLICACAO_PERIODO_QUADRO = "Define o ano ou semestre letivo de vigência deste quadro.";
const EXPLICACAO_PERIODO_TURMA = "Indica a etapa curricular da turma no curso (ano ou semestre), conforme a periodicidade do curso.";

export function GradeFormModal({
    open,
    onClose,
    mode,
    grade,
    periodos,
    turmas,
    cursoNome,
    onConfirm,
    submitting = false,
    errorMessage = "",
}: GradeFormModalProps) {
    return (
        <Modal open={open} onClose={() => { if (!submitting) onClose(); }} className="max-w-xl overflow-visible">
            <GradeFormConteudo
                key={grade?.id ?? "novo"}
                mode={mode}
                grade={grade}
                periodos={periodos}
                turmas={turmas}
                cursoNome={cursoNome}
                onCancel={onClose}
                onConfirm={onConfirm}
                submitting={submitting}
                errorMessage={errorMessage}
            />
        </Modal>
    );
}

function GradeFormConteudo({
    mode,
    grade,
    periodos,
    turmas,
    cursoNome,
    onCancel,
    onConfirm,
    submitting,
    errorMessage,
}: {
    mode: "cadastrar" | "editar";
    grade?: QuadroHorarioResponse | null;
    periodos: PeriodoAtividadeQuadroResponse[];
    turmas: TurmaResponse[];
    cursoNome: string;
    onCancel: () => void;
    onConfirm: (dados: GradeFormValues) => void;
    submitting: boolean;
    errorMessage: string;
}) {
    const [valores, setValores] = React.useState<GradeFormValues>({
        versao: grade?.versao ?? 1,
        turmaId: grade?.turma?.id ?? 0,
        periodoAtividadeQuadroId: grade?.periodoAtividadeQuadro.id ?? 0,
        status: grade?.status ?? "ATIVO",
    });
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Quadro de Horários" : "Edição de Quadro de Horários";
    const opcoesPeriodo = periodos.map((periodo) => ({
        label: rotuloPeriodo(periodo),
        value: String(periodo.id),
    }));

    function atualizar<K extends keyof GradeFormValues>(campo: K, valor: GradeFormValues[K]) {
        setValores((prev) => ({ ...prev, [campo]: valor }));
        setErro("");
    }

    function handleConfirmar() {
        if (!Number.isInteger(valores.versao) || valores.versao < 1) {
            setErro("A versão do quadro de horários deve ser maior que zero.");
            return;
        }
        if (!valores.turmaId) {
            setErro("Selecione a turma.");
            return;
        }
        if (!valores.periodoAtividadeQuadroId) {
            setErro("Selecione o período atividade quadro.");
            return;
        }
        onConfirm(valores);
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    label="Versão"
                    showLabel
                    type="number"
                    min={1}
                    value={valores.versao}
                    onChange={(e) => atualizar("versao", Number(e.target.value))}
                />
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#17264D]">Curso vinculado</span>
                    <p className="rounded-lg border border-[#D0D4D8] bg-[#F2F2F2] px-3 py-2 text-sm">{cursoNome}</p>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-[#17264D]">Turma<HelpTooltip description={EXPLICACAO_PERIODO_TURMA} /></label>
                    <Select
                        aria-label="Turma"
                        options={turmas.map(t => ({ value: String(t.id), label: `${t.codigo} · ${t.ano} · ${rotuloPeriodoTurma(t.curso.periodicidade, t.periodo)}` }))}
                        value={valores.turmaId ? String(valores.turmaId) : ""}
                        onChange={v => atualizar("turmaId", Number(v))}
                        placeholder="Selecione a turma"
                        disabled={mode === "editar" || submitting || !turmas.length}
                    />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-[#17264D]">Período Atividade Quadro<HelpTooltip description={EXPLICACAO_PERIODO_QUADRO} /></label>
                    <Select
                        options={opcoesPeriodo}
                        value={valores.periodoAtividadeQuadroId ? String(valores.periodoAtividadeQuadroId) : ""}
                        onChange={(value) => atualizar("periodoAtividadeQuadroId", Number(value))}
                        placeholder="Selecione..."
                        disabled={!periodos.length || submitting}
                    />
                    {!periodos.length && <p className="text-xs text-[#777777]">Não há períodos de atividade ativos disponíveis.</p>}
                </div>
            </div>
            {mode === "editar" && (
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#17264D]">Status</span>
                    <RadioGroup value={valores.status} onValueChange={(v) => atualizar("status", v as Status)}>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="ATIVO" id="grade-status-ativo" />
                            <label htmlFor="grade-status-ativo" className="text-sm text-[#17264D]">Ativo</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="INATIVO" id="grade-status-inativo" />
                            <label htmlFor="grade-status-inativo" className="text-sm text-[#17264D]">Inativo</label>
                        </div>
                    </RadioGroup>
                </div>
            )}
            {erro && <p role="alert" className="text-sm text-[#BA1A1A]">{erro}</p>}
            {errorMessage && <p role="alert" className="text-sm text-[#BA1A1A]">{errorMessage}</p>}
            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={submitting}>Cancelar</Button>
                <Button variant="secondary" size="small" onClick={handleConfirmar} disabled={submitting || !periodos.length}>
                    {submitting ? "Salvando..." : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}
