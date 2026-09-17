"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, DateInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    CURSOS_DISPONIVEIS,
    PERIODOS_LETIVOS,
    type GradeHoraria,
    type StatusGrade,
} from "@/lib/grade-horaria";

interface GradeFormValues {
    versao: number;
    dataCriacao: string;
    cursoVinculado: string;
    periodoLetivo: string;
    status: StatusGrade;
}

interface GradeFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    grade?: GradeHoraria | null;
    onConfirm: (dados: GradeFormValues) => void;
}

export function GradeFormModal({
    open,
    onClose,
    mode,
    grade,
    onConfirm,
}: GradeFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl overflow-visible">
            <GradeFormConteudo
                key={grade?.id ?? "novo"}
                mode={mode}
                grade={grade}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function GradeFormConteudo({
    mode,
    grade,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    grade?: GradeHoraria | null;
    onCancel: () => void;
    onConfirm: (dados: GradeFormValues) => void;
}) {
    const [valores, setValores] = React.useState<GradeFormValues>({
        versao: grade?.versao ?? 0,
        dataCriacao: grade?.dataCriacao ?? "",
        cursoVinculado: grade?.cursoVinculado ?? "",
        periodoLetivo: grade?.periodoLetivo ?? "",
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
        if (!valores.dataCriacao || !valores.cursoVinculado || !valores.periodoLetivo) {
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

                <DateInput
                    label="Data de Criação"
                    showLabel
                    value={valores.dataCriacao}
                    onChange={(e) => atualizar("dataCriacao", e.target.value)}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Curso Vinculado</label>
                    <Select
                        options={CURSOS_DISPONIVEIS.map((c) => ({ label: c, value: c }))}
                        value={valores.cursoVinculado}
                        onChange={(v) => atualizar("cursoVinculado", v)}
                        placeholder="Selecione..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Período Letivo</label>
                    <Select
                        options={PERIODOS_LETIVOS.map((p) => ({ label: p, value: p }))}
                        value={valores.periodoLetivo}
                        onChange={(v) => atualizar("periodoLetivo", v)}
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