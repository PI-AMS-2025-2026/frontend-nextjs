"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PERIODOS, type TurmaView } from "@/lib/turmas";
import { cursosService } from "@/services/cursos.service";
import type { CursoResponse, TurmaRequest } from "@/types/api";

interface TurmaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    turma?: TurmaView | null;
    onConfirm: (dados: TurmaRequest) => Promise<void>;
}

const opcoesPeriodo = PERIODOS.map((p) => ({ label: p.label, value: String(p.value) }));

export function TurmaFormModal({ open, onClose, mode, turma, onConfirm }: TurmaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <TurmaFormConteudo key={turma?.id ?? "novo"} mode={mode} turma={turma} onCancel={onClose} onConfirm={onConfirm} />
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
    turma?: TurmaView | null;
    onCancel: () => void;
    onConfirm: (dados: TurmaRequest) => Promise<void>;
}) {
    const [cursos, setCursos] = React.useState<CursoResponse[]>([]);
    const [carregandoCursos, setCarregandoCursos] = React.useState(true);

    React.useEffect(() => {
        cursosService
            .listar({ size: 100 })
            .then((resposta) => setCursos(resposta.content))
            .catch(() => setCursos([]))
            .finally(() => setCarregandoCursos(false));
    }, []);

    const [periodo, setPeriodo] = React.useState(turma ? String(turma.periodo) : "");
    const [cursoId, setCursoId] = React.useState(turma ? String(turma.cursoId) : "");
    const [qtdAlunos, setQtdAlunos] = React.useState(turma?.qtdAlunos ?? 0);
    const [ano, setAno] = React.useState(turma?.ano ?? new Date().getFullYear());
    const [erro, setErro] = React.useState("");
    const [enviando, setEnviando] = React.useState(false);

    const opcoesCurso = cursos.map((c) => ({ label: c.nome, value: String(c.id) }));
    const titulo = mode === "cadastrar" ? "Cadastro de Turma" : "Edição de Turma";

    async function handleConfirmar() {
        if (!periodo) return setErro("Selecione o período.");
        if (!cursoId) return setErro("Selecione o curso.");
        if (qtdAlunos <= 0) return setErro("A quantidade de alunos deve ser maior que zero.");
        if (!ano || ano < 1900) return setErro("Informe um ano válido.");

        setEnviando(true);
        try {
            await onConfirm({
                periodo: Number(periodo),
                ano,
                numeroAlunos: qtdAlunos,
                curso: { id: Number(cursoId) },
            });
        } catch {
            setErro("Erro ao salvar a turma. Tente novamente.");
        } finally {
            setEnviando(false);
        }
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
                        value={cursoId}
                        onChange={(valor) => {
                            setCursoId(valor);
                            setErro("");
                        }}
                        placeholder={carregandoCursos ? "Carregando..." : "Selecione..."}
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
            </div>

            {erro && <p className="text-sm text-[#BA1A1A]">{erro}</p>}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={enviando}>
                    Cancelar
                </Button>
                <Button variant="secondary" size="small" onClick={handleConfirmar} disabled={enviando}>
                    {enviando ? "Salvando..." : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}