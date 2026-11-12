"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Status, type Turma } from "@/lib/turmas";

export interface CursoOpcao { id: string; nome: string; duracao: number }

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
    cursos: CursoOpcao[];
    onConfirm: (dados: DadosTurma) => void;
}

export function TurmaFormModal({
    open,
    onClose,
    mode,
    turma,
    cursos,
    onConfirm,
}: TurmaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <TurmaFormConteudo
                key={turma?.id ?? "novo"}
                mode={mode}
                turma={turma}
                cursos={cursos}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function TurmaFormConteudo({
    mode,
    turma,
    cursos,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    turma?: Turma | null;
    cursos: CursoOpcao[];
    onCancel: () => void;
    onConfirm: (dados: DadosTurma) => void;
}) {
    const [periodo, setPeriodo] = React.useState(turma?.periodoId ?? "");
    const [curso, setCurso] = React.useState(turma?.cursoId ?? "");
    const [qtdAlunos, setQtdAlunos] = React.useState(turma ? String(turma.qtdAlunos) : "");
    const [ano, setAno] = React.useState(turma ? String(turma.ano) : "");
    const [status, setStatus] = React.useState<Status>(turma?.status ?? "Ativo");
    const [erro, setErro] = React.useState("");
    const cursoSelecionado = cursos.find((item) => item.id === curso);
    const titulo = mode === "cadastrar" ? "Cadastrar Turma" : "Editar Turma";

    function handleConfirmar() {
        if (!periodo.trim()) return setErro("Informe o período.");
        const periodoNumero = Number(periodo);
        if (!Number.isInteger(periodoNumero) || periodoNumero <= 0) {
            return setErro("Informe um período válido, maior que zero.");
        }
        if (!curso) return setErro("Selecione o curso.");
        if (cursoSelecionado && periodoNumero > cursoSelecionado.duracao) {
            return setErro(`O período não pode ser maior que a duração do curso (${cursoSelecionado.duracao}).`);
        }

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
                    <Input
                        label="Período:"
                        showLabel
                        type="number"
                        min={1}
                        max={cursoSelecionado?.duracao}
                        value={periodo}
                        onChange={(e) => {
                            setPeriodo(e.target.value);
                            setErro("");
                        }}
                        placeholder="Ex: 1"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Curso:</label>
                    <Select
                        options={cursos.map((item) => ({ label: item.nome, value: item.id }))}
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
