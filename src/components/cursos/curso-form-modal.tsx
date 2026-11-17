"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CursoRequest, CursoResponse } from "@/types/api";

interface CursoFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    curso?: CursoResponse | null;
    onConfirm: (dados: CursoRequest) => void;
    submitting?: boolean;
    errorMessage?: string;
}

export function CursoFormModal({
    open,
    onClose,
    mode,
    curso,
    onConfirm,
    submitting = false,
    errorMessage = "",
}: CursoFormModalProps) {
    return (
        <Modal open={open} onClose={() => { if (!submitting) onClose(); }} className="max-w-xl overflow-visible">
            <CursoFormConteudo
                key={curso?.id ?? "novo"}
                mode={mode}
                curso={curso}
                onCancel={onClose}
                onConfirm={onConfirm}
                submitting={submitting}
                errorMessage={errorMessage}
            />
        </Modal>
    );
}

function CursoFormConteudo({
    mode,
    curso,
    onCancel,
    onConfirm,
    submitting,
    errorMessage,
}: {
    mode: "cadastrar" | "editar";
    curso?: CursoResponse | null;
    onCancel: () => void;
    onConfirm: (dados: CursoRequest) => void;
    submitting: boolean;
    errorMessage: string;
}) {
    const [nome, setNome] = React.useState(curso?.nome ?? "");
    const [periodicidade, setPeriodicidade] = React.useState(curso?.periodicidade ?? "");
    const [duracao, setDuracao] = React.useState(curso ? String(curso.duracao) : "");
    const [status, setStatus] = React.useState(curso?.status ?? "ATIVO");
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Curso" : "Edição de Curso";

    function handleConfirmar() {
        if (!nome.trim()) return setErro("Informe o nome do curso.");
        if (!periodicidade) return setErro("Selecione a periodicidade.");
        const duracaoAnos = Number(duracao);
        if (!Number.isInteger(duracaoAnos)) return setErro("Informe a duração em anos.");
        if (periodicidade === "Anual" && (duracaoAnos <= 1 || duracaoAnos > 4)) {
            return setErro("Para cursos anuais, a duração deve ser de 2 a 4 anos.");
        }
        if (periodicidade === "Semestral" && (duracaoAnos < 4 || duracaoAnos > 10)) {
            return setErro("Para cursos semestrais, a duração deve ser de 4 a 10 semestres.");
        }

        onConfirm({ nome: nome.trim(), periodicidade, duracao: duracaoAnos, status });
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <Input
                label="Nome do Curso"
                showLabel
                value={nome}
                onChange={(e) => { setNome(e.target.value); setErro(""); }}
                placeholder="Digite aqui..."
                disabled={submitting}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Periodicidade</label>
                    <Select
                        options={[
                            { label: "Semestral", value: "Semestral" },
                            { label: "Anual", value: "Anual" },
                        ]}
                        value={periodicidade}
                        onChange={(value) => { setPeriodicidade(value); setErro(""); }}
                        placeholder="Selecione..."
                    />
                </div>

                <Input
                    label={periodicidade === "Anual" ? "Duração (anos)" : "Duração (semestres)"}
                    showLabel
                    type="number"
                    min={periodicidade === "Anual" ? 2 : 4}
                    max={periodicidade === "Anual" ? 4 : 10}
                    step={1}
                    value={duracao}
                    onChange={(e) => { setDuracao(e.target.value); setErro(""); }}
                    placeholder={periodicidade === "Anual" ? "Ex: 4" : "Ex: 6"}
                    disabled={submitting}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#17264D]">Status</label>
                <RadioGroup value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="ATIVO" id="curso-status-ativo" />
                        <label htmlFor="curso-status-ativo" className="text-sm text-[#17264D]">Ativo</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="INATIVO" id="curso-status-inativo" />
                        <label htmlFor="curso-status-inativo" className="text-sm text-[#17264D]">Inativo</label>
                    </div>
                </RadioGroup>
            </div>

            {erro && <p role="alert" className="text-sm text-[#BA1A1A]">{erro}</p>}
            {errorMessage && <p role="alert" className="text-sm text-[#BA1A1A]">{errorMessage}</p>}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={submitting}>Cancelar</Button>
                <Button variant="secondary" size="small" onClick={handleConfirmar} disabled={submitting}>
                    {submitting ? "Salvando…" : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}
