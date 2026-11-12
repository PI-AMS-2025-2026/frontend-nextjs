"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    const [qtdAlunos, setQtdAlunos] = React.useState(turma ? String(turma.qtdAlunos) : "");
    const [ano, setAno] = React.useState(turma ? String(turma.ano) : "");
    const [status, setStatus] = React.useState<Status>(turma?.status ?? "Ativo");
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastrar Turma" : "Editar Turma";

    function handleConfirmar() {
        if (!periodo) return setErro("Selecione o período.");
        if (!curso) return setErro("Selecione o curso.");

        const qtd = Number(qtdAlunos);
        if (!qtdAlunos.trim() || !Number.isInteger(qtd) || qtd <= 0) {
            return setErro("A quantidade de alunos deve ser maior que zero.");
        }

        const anoNumero = Number(ano);
        if (!ano.trim() || !Number.isInteger(anoNumero) || anoNumero < 1900) {
            return setErro("Informe um ano válido.");
        }

        onConfirm({
            periodo,
            curso,
            qtdAlunos: qtd,
            ano: anoNumero,
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
                    min={1}
                    value={qtdAlunos}
                    onChange={(e) => {
                        setQtdAlunos(e.target.value);
                        setErro("");
                    }}
                    placeholder="Ex: 40"
                />

                <Input
                    label="Ano:"
                    showLabel
                    type="number"
                    value={ano}
                    onChange={(e) => {
                        setAno(e.target.value);
                        setErro("");
                    }}
                    placeholder="Ex: 2026"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#17264D]">Status</label>
                <RadioGroup
                    value={status}
                    onValueChange={(v) => setStatus(v as Status)}
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Ativo" id="turma-status-ativo" />
                        <label htmlFor="turma-status-ativo" className="text-sm text-[#17264D]">
                            Ativo
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Inativo" id="turma-status-inativo" />
                        <label htmlFor="turma-status-inativo" className="text-sm text-[#17264D]">
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