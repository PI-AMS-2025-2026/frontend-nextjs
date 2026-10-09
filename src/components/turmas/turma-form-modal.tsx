"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PERIODOS, CURSOS, type Status, type Turma } from "@/lib/turmas";

interface DadosTurma {
    periodo: string;
    curso: string;
    qtdAlunos: number;
    ano: number;
    status: Status;
}

interface TurmaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    turma?: Turma | null;
    onConfirm: (dados: DadosTurma) => void;
}

const opcoesPeriodo = PERIODOS.map((periodo) => ({ label: periodo, value: periodo }));
const opcoesCurso = CURSOS.map((curso) => ({ label: curso, value: curso }));
const opcoesStatus = [
    { label: "Ativo", value: "Ativo" },
    { label: "Inativo", value: "Inativo" },
];

export function TurmaFormModal({
    open,
    onClose,
    mode,
    turma,
    onConfirm,
}: TurmaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <TurmaFormConteudo
                key={turma?.id ?? "novo"}
                mode={mode}
                turma={turma}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function TurmaFormConteudo({
    mode,
    turma,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    turma?: Turma | null;
    onCancel: () => void;
    onConfirm: (dados: DadosTurma) => void;
}) {
    const [periodo, setPeriodo] = React.useState(turma?.periodo ?? "");
    const [curso, setCurso] = React.useState(turma?.curso ?? "");
    const [qtdAlunos, setQtdAlunos] = React.useState(turma?.qtdAlunos ?? 0);
    const [ano, setAno] = React.useState(turma?.ano ?? new Date().getFullYear());
    const [status, setStatus] = React.useState<Status | "">(turma?.status ?? "");
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Turma" : "Edição de Turma";

    function handleConfirmar() {
        if (!periodo) return setErro("Selecione o período.");
        if (!curso) return setErro("Selecione o curso.");
        if (qtdAlunos <= 0) return setErro("A quantidade de alunos deve ser maior que zero.");
        if (!ano || ano < 1900) return setErro("Informe um ano válido.");
        if (!status) return setErro("Selecione o status.");

        onConfirm({
            periodo,
            curso,
            qtdAlunos,
            ano,
            status,
        });
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Período:</label>
                    <Select
                        options={opcoesPeriodo}
                        value={periodo}
                        onChange={(valor) => {
                            setPeriodo(valor);
                            setErro("");
                        }}
                        placeholder="Selecione..."
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Curso:</label>
                    <Select
                        options={opcoesCurso}
                        value={curso}
                        onChange={(valor) => {
                            setCurso(valor);
                            setErro("");
                        }}
                        placeholder="Selecione..."
                    />
                </div>

                <Input
                    label="Qtd. Alunos:"
                    showLabel
                    type="number"
                    min={0}
                    value={qtdAlunos}
                    onChange={(e) => {
                        setQtdAlunos(Number(e.target.value));
                        setErro("");
                    }}
                    placeholder="Ex. 40"
                />

                <Input
                    label="Ano:"
                    showLabel
                    type="number"
                    value={ano}
                    onChange={(e) => {
                        setAno(Number(e.target.value));
                        setErro("");
                    }}
                    placeholder="Ex. 2026"
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Status:</label>
                    <Select
                        options={opcoesStatus}
                        value={status}
                        onChange={(valor) => {
                            setStatus(valor as Status);
                            setErro("");
                        }}
                        placeholder="Selecione..."
                    />
                </div>
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
