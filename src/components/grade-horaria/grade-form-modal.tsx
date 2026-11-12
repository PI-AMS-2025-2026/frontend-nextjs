"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    type GradeHoraria,
    type StatusGrade,
} from "@/lib/grade-horaria";

interface GradeFormValues {
    versao: number;
    cursoId: string;
    periodoAtividadeQuadroId: string;
    status: StatusGrade;
}

export interface GradeCursoOpcao { id: string; nome: string }
export interface GradePeriodoOpcao { id: string; label: string }

interface GradeFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    grade?: GradeHoraria | null;
    cursos: GradeCursoOpcao[];
    periodos: GradePeriodoOpcao[];
    onConfirm: (dados: GradeFormValues) => void;
}

export function GradeFormModal({
    open,
    onClose,
    mode,
    grade,
    cursos,
    periodos,
    onConfirm,
}: GradeFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl overflow-visible">
            <GradeFormConteudo
                key={grade?.id ?? "novo"}
                mode={mode}
                grade={grade}
                cursos={cursos}
                periodos={periodos}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function GradeFormConteudo({
    mode,
    grade,
    cursos,
    periodos,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    grade?: GradeHoraria | null;
    cursos: GradeCursoOpcao[];
    periodos: GradePeriodoOpcao[];
    onCancel: () => void;
    onConfirm: (dados: GradeFormValues) => void;
}) {
    const [valores, setValores] = React.useState<GradeFormValues>({
        versao: grade?.versao ?? 0,
        cursoId: grade?.cursoId ?? "",
        periodoAtividadeQuadroId: grade?.periodoAtividadeQuadroId ?? "",
        status: grade?.status ?? "Ativo",
    });
    const [erro, setErro] = React.useState("");

    const titulo =
        mode === "cadastrar" ? "Cadastro de Grade Horária" : "Edição de Grade Horária";

    function atualizar<K extends keyof GradeFormValues>(campo: K, valor: GradeFormValues[K]) {
        setValores((prev) => ({ ...prev, [campo]: valor }));
        setErro("");
    }

    function handleConfirmar() {
        if (!valores.cursoId || !valores.periodoAtividadeQuadroId) {
            setErro("Preencha todos os campos obrigatórios.");
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
                    min={0}
                    value={valores.versao}
                    onChange={(e) => atualizar("versao", Number(e.target.value))}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Curso Vinculado</label>
                    <Select
                        options={cursos.map((curso) => ({ label: curso.nome, value: curso.id }))}
                        value={valores.cursoId}
                        onChange={(v) => atualizar("cursoId", v)}
                        placeholder="Selecione..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Período Letivo</label>
                    <Select
                        options={periodos.map((periodo) => ({ label: periodo.label, value: periodo.id }))}
                        value={valores.periodoAtividadeQuadroId}
                        onChange={(v) => atualizar("periodoAtividadeQuadroId", v)}
                        placeholder="Selecione..."
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#17264D]">Status</label>
                <RadioGroup
                    value={valores.status}
                    onValueChange={(v) => atualizar("status", v as StatusGrade)}
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Ativo" id="status-ativo" />
                        <label htmlFor="status-ativo" className="text-sm text-[#17264D]">
                            Ativo
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Inativo" id="status-inativo" />
                        <label htmlFor="status-inativo" className="text-sm text-[#17264D]">
                            Inativo
                        </label>
                    </div>
                </RadioGroup>
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
