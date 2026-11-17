"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Curso, Periodicidade, StatusCurso } from "@/lib/cursos";

interface DadosCurso {
    nome: string;
    periodicidade: Periodicidade;
    duracao: string;
    status: StatusCurso;
}

interface CursoFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    curso?: Curso | null;
    onConfirm: (dados: DadosCurso) => void;
}

export function CursoFormModal({
    open,
    onClose,
    mode,
    curso,
    onConfirm,
}: CursoFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl overflow-visible">
            <CursoFormConteudo
                key={curso?.id ?? "novo"}
                mode={mode}
                curso={curso}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function CursoFormConteudo({
    mode,
    curso,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    curso?: Curso | null;
    onCancel: () => void;
    onConfirm: (dados: DadosCurso) => void;
}) {
    const [nome, setNome] = React.useState(curso?.nome ?? "");
    const [periodicidade, setPeriodicidade] = React.useState<Periodicidade | "">(
        curso?.periodicidade ?? ""
    );
    const [duracao, setDuracao] = React.useState(
        curso?.duracao.match(/^\d+/)?.[0] ?? ""
    );
    const [status, setStatus] = React.useState<StatusCurso>(curso?.status ?? "Ativo");
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Curso" : "Edição de Curso";

    function handleConfirmar() {
        if (!nome.trim()) return setErro("Informe o nome do curso.");
        if (!periodicidade) return setErro("Selecione a periodicidade.");
        if (!duracao.trim()) return setErro("Informe a duração do curso.");

        const duracaoNumero = Number(duracao);
        const limites = periodicidade === "Anual" ? { min: 1, max: 4, unidade: "anos" } : { min: 4, max: 10, unidade: "semestres" };
        if (!Number.isInteger(duracaoNumero) || duracaoNumero < limites.min || duracaoNumero > limites.max) {
            return setErro(`Para periodicidade ${periodicidade}, informe uma duração inteira entre ${limites.min} e ${limites.max} ${limites.unidade}.`);
        }

        onConfirm({
            nome: nome.trim(),
            periodicidade,
            duracao: String(duracaoNumero),
            status,
        });
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <Input
                label="Nome do Curso"
                showLabel
                value={nome}
                onChange={(e) => {
                    setNome(e.target.value);
                    setErro("");
                }}
                placeholder="Digite aqui..."
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
                        onChange={(v) => {
                            setPeriodicidade(v as Periodicidade);
                            setErro("");
                        }}
                        placeholder="Selecione..."
                    />
                </div>

                <Input
                    label="Duração"
                    showLabel
                    type="number"
                    min={periodicidade === "Anual" ? 1 : periodicidade === "Semestral" ? 4 : undefined}
                    max={periodicidade === "Anual" ? 4 : periodicidade === "Semestral" ? 10 : undefined}
                    step={1}
                    value={duracao}
                    onChange={(e) => {
                        setDuracao(e.target.value);
                        setErro("");
                    }}
                    placeholder={periodicidade === "Semestral" ? "4 a 10 semestres" : "1 a 4 anos"}
                />
                {periodicidade && (
                    <p className="text-xs text-[#17264D]/70">
                        {periodicidade === "Anual" ? "Informe de 1 a 4 anos." : "Informe de 4 a 10 semestres."}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#17264D]">Status</label>
                <RadioGroup
                    value={status}
                    onValueChange={(v) => setStatus(v as StatusCurso)}
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Ativo" id="curso-status-ativo" />
                        <label htmlFor="curso-status-ativo" className="text-sm text-[#17264D]">
                            Ativo
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Inativo" id="curso-status-inativo" />
                        <label htmlFor="curso-status-inativo" className="text-sm text-[#17264D]">
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
