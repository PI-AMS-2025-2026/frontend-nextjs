"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cursosService } from "@/services/cursos.service";
import type { CursoResponse, Status, TurmaRequest, TurmaResponse } from "@/types/api";
import { opcoesPeriodoCurso, unidadePeriodoCurso } from "@/lib/turma-periodo";

interface TurmaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    turma?: TurmaResponse | null;
    onConfirm: (dados: TurmaRequest) => Promise<void> | void;
}

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
    turma?: TurmaResponse | null;
    onCancel: () => void;
    onConfirm: (dados: TurmaRequest) => Promise<void> | void;
}) {
    const [periodo, setPeriodo] = React.useState(turma ? String(turma.periodo) : "");
    const [cursoId, setCursoId] = React.useState(turma ? String(turma.curso.id) : "");
    const [qtdAlunos, setQtdAlunos] = React.useState(turma ? String(turma.numeroAlunos) : "");
    const [ano, setAno] = React.useState(turma ? String(turma.ano) : "");
    const [status, setStatus] = React.useState<Status>(turma?.status ?? "ATIVO");
    const [erro, setErro] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    const [cursos, setCursos] = React.useState<CursoResponse[]>([]);
    const [carregandoCursos, setCarregandoCursos] = React.useState(true);
    const [erroCursos, setErroCursos] = React.useState(false);
    const curso = cursos.find((item) => String(item.id) === cursoId);
    const opcoesPeriodo = opcoesPeriodoCurso(curso);
    const opcoesCurso = React.useMemo(
        () =>
            cursos.map((curso) => ({
                label: curso.nome,
                value: String(curso.id),
            })),
        [cursos]
    );

    React.useEffect(() => {
        let ativo = true;

        async function carregarCursos() {
            try {
                const primeiraPagina = await cursosService.listar({ page: 0, size: 100 });
                const paginasRestantes = await Promise.all(
                    Array.from({ length: Math.max(0, primeiraPagina.totalPages - 1) }, (_, index) =>
                        cursosService.listar({ page: index + 1, size: 100 }),
                    ),
                );

                if (ativo) {
                    setCursos([...primeiraPagina.content, ...paginasRestantes.flatMap((pagina) => pagina.content)]);
                }
            } catch (erro) {
                console.error("Erro ao carregar cursos:", erro);

                if (ativo) {
                    setErroCursos(true);
                }
            } finally {
                if (ativo) {
                    setCarregandoCursos(false);
                }
            }
        }

        carregarCursos();

        return () => {
            ativo = false;
        };
    }, []);


    const titulo = mode === "cadastrar" ? "Cadastrar Turma" : "Editar Turma";

    async function handleConfirmar() {
        if (!curso) return setErro("Selecione um curso carregado pelo backend.");
        const periodoNumero = Number(periodo);
        if (!Number.isInteger(periodoNumero) || periodoNumero < 1 || periodoNumero > curso.duracao) {
            return setErro(`Selecione um ${unidadePeriodoCurso(curso.periodicidade)} entre 1 e ${curso.duracao}.`);
        }
        if (curso.status !== "ATIVO" && status === "ATIVO") {
            return setErro("Uma turma vinculada a um curso inativo também deve estar inativa.");
        }

        const qtd = Number(qtdAlunos);
        if (!qtdAlunos.trim() || !Number.isInteger(qtd) || qtd <= 0 || qtd > 50) {
            return setErro("A quantidade de alunos deve estar entre 1 e 50.");
        }

        const anoNumero = Number(ano);
        if (!ano.trim() || !Number.isInteger(anoNumero) || anoNumero < 2009 || anoNumero > 9999) {
            return setErro("Informe um ano entre 2009 e 9999.");
        }

        setSubmitting(true);
        try {
            await onConfirm({
                periodo: periodoNumero,
                curso: { id: curso.id },
                numeroAlunos: qtd,
                ano: anoNumero,
                status,
            });
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível salvar a turma.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Curso:</label>
                    <Select
                        aria-label="Curso da turma"
                        options={opcoesCurso}
                        value={cursoId}
                        onChange={(valor) => {
                            const cursoSelecionado = cursos.find((item) => String(item.id) === valor);
                            setCursoId(valor);
                            setPeriodo("");
                            if (cursoSelecionado?.status === "INATIVO") setStatus("INATIVO");
                            setErro("");
                        }}
                        placeholder={carregandoCursos ? "Carregando cursos..." : "Selecione..."}
                    />
                    {erroCursos && <p className="text-sm text-red-600">Não foi possível carregar os cursos.</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">
                        {curso ? `${unidadePeriodoCurso(curso.periodicidade)} no curso:` : "Período no curso:"}
                    </label>
                    <Select
                        aria-label="Período da turma"
                        options={opcoesPeriodo}
                        value={periodo}
                        disabled={!curso || carregandoCursos || opcoesPeriodo.length === 0}
                        onChange={(valor) => {
                            setPeriodo(valor);
                            setErro("");
                        }}
                        placeholder={curso ? "Selecione..." : "Selecione primeiro um curso"}
                    />
                    {curso && <p className="text-xs text-[#17264D]/70">O curso tem duração de {curso.duracao} {unidadePeriodoCurso(curso.periodicidade)}(s).</p>}
                </div>

                <Input
                    label="Qtd. Alunos:"
                    showLabel
                    type="number"
                    min={1}
                    max={50}
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
                    min={2009}
                    max={9999}
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
                        <RadioGroupItem value="ATIVO" id="turma-status-ativo" />
                        <label htmlFor="turma-status-ativo" className="text-sm text-[#17264D]">
                            Ativo
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="INATIVO" id="turma-status-inativo" />
                        <label htmlFor="turma-status-inativo" className="text-sm text-[#17264D]">
                            Inativo
                        </label>
                    </div>
                </RadioGroup>
            </div>

            {erro && <p className="text-sm text-[#BA1A1A]">{erro}</p>}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button variant="secondary" size="small" onClick={() => void handleConfirmar()} disabled={submitting}>
                    {submitting ? "Salvando..." : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}
