"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, ArrowLeft, Loader2, CircleCheck, CircleMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { TableFilterHead } from "@/components/ui/table-filter-head";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { turmasService } from "@/services/turmas.service";
import { cursosService } from "@/services/cursos.service";
import { ApiError } from "@/lib/api";
import { useRemotePage } from "@/hooks/use-remote-page";
import type { TurmaRequest, TurmaResponse } from "@/types/api";
import type { ListTurmaParams } from "@/types/api";

import { TurmaFormModal, type CursoOpcao } from "../TurmaFormModal/turma-form-modal";

import {
    PERIODOS,
    ANOS,
    type Turma,
    type Status,
} from "@/lib/turmas";

function converterTurma(t: TurmaResponse): Turma {
    return {
        id: String(t.id),
        periodo: String(t.periodo),
        periodoId: String(t.periodo),
        curso: t.curso.nome,
        cursoId: String(t.curso.id),
        qtdAlunos: t.numeroAlunos,
        ano: t.ano,
        status: t.status === "INATIVO" ? "Inativo" : "Ativo",
    };
}

export function TurmasListagem() {
    const [cursos, setCursos] = React.useState<CursoOpcao[]>([]);
    const [refreshKey, setRefreshKey] = React.useState(0);

    React.useEffect(() => {
        let ativo = true;
        void cursosService.listar({ page: 0, size: 1000 }).then((resposta) => {
            if (ativo) setCursos(resposta.content.map((curso) => ({ id: String(curso.id), nome: curso.nome, duracao: curso.duracao })));
        }).catch((erro: unknown) => {
            console.error("Erro ao carregar cursos:", erro);
        });
        return () => { ativo = false; };
    }, []);

    const [busca, setBusca] = React.useState("");
    const [fPeriodo, setFPeriodo] = React.useState("");
    const [fAno, setFAno] = React.useState("");
    const [fStatus, setFStatus] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<Turma | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);
    const [mensagemErro, setMensagemErro] = React.useState<string | null>(null);

    const carregarPagina = React.useCallback((params: ListTurmaParams & { page: number; size: number }) =>
        turmasService.listar(params), []);
    const filtrosApi: ListTurmaParams = {
        busca: busca.trim(),
        periodo: fPeriodo ? Number(fPeriodo) : undefined,
        ano: fAno ? Number(fAno) : undefined,
        status: fStatus === "Ativo" ? "ATIVO" : fStatus === "Inativo" ? "INATIVO" : undefined,
    };
    const { content: turmasApi, totalElements, loading, error: erroCarga } = useRemotePage(
        carregarPagina, filtrosApi, paginaAtual, itensPorPagina, refreshKey,
    );
    const turmas = turmasApi.map(converterTurma);

    function obterMensagemErro(erro: unknown) {
        if (erro instanceof ApiError) return erro.message;
        if (erro instanceof Error) return erro.message;
        return "Não foi possível concluir a operação. Tente novamente.";
    }

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const pagina = turmas;

    async function confirmarCadastro(dados: {
    periodo: string;
    curso: string;
    qtdAlunos: number;
    ano: number;
    status: Status;
}) {
    setMensagemErro(null);
    try {
        const dadosApi: TurmaRequest = {
            periodo: Number(dados.periodo),
            ano: dados.ano,
            numeroAlunos: dados.qtdAlunos,
            curso: { id: Number(dados.curso) },
            status: dados.status === "Inativo" ? "INATIVO" : "ATIVO",
        };

        await turmasService.criar(dadosApi);

        setPaginaAtual(1);
        setRefreshKey((key) => key + 1);

        setCadastrarAberto(false);
        setSucesso("Turma cadastrada com sucesso!");
    } catch (erro) {
        setMensagemErro(obterMensagemErro(erro));
    }
}

   async function confirmarEdicao(dados: {
    periodo: string;
    curso: string;
    qtdAlunos: number;
    ano: number;
    status: Status;
}) {
    if (!selecionada) return;

    setMensagemErro(null);
    try {
        const dadosApi: TurmaRequest = {
            periodo: Number(dados.periodo),
            ano: dados.ano,
            numeroAlunos: dados.qtdAlunos,
            curso: { id: Number(dados.curso) },
            status: dados.status === "Inativo" ? "INATIVO" : "ATIVO",
        };

        await turmasService.atualizar(
            Number(selecionada.id),
            dadosApi
        );

        setPaginaAtual(1);
        setRefreshKey((key) => key + 1);

        setEditarAberto(false);
        setSelecionada(null);
        setSucesso("Turma editada com sucesso!");
    } catch (erro) {
        setMensagemErro(obterMensagemErro(erro));
    }
}

    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/coordenador/estrutura-academica"
                        aria-label="Voltar"
                        className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                    >
                        <ArrowLeft className="size-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#17264D]">Listagem de Turmas</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie as turmas da instituição
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-64">
                        <SearchInput
                            placeholder="Pesquisar..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        size="small"
                        className="gap-2"
                        onClick={() => setCadastrarAberto(true)}
                    >
                        <Plus className="size-5" />
                        Cadastrar
                    </Button>
                </div>
            </div>

            <TableFilters
                fields={[
                    {
                        name: "periodo",
                        label: "Período",
                        type: "select",
                        placeholder: "Selecione...",
                        options: PERIODOS.map((p) => ({ label: p, value: p })),
                    },
                    {
                        name: "ano",
                        label: "Ano",
                        type: "select",
                        placeholder: "Selecione...",
                        options: ANOS.map((a) => ({ label: String(a), value: String(a) })),
                    },
                ]}
                onChange={(f) => {
                    setFPeriodo(f.periodo ?? "");
                    setFAno(f.ano ?? "");
                    setPaginaAtual(1);
                }}
                onClear={() => setFStatus("")}
            />

            <div className="min-w-0 pb-2">
                <DataTable
                    data={pagina}
                    getRowKey={(t) => t.id}
                    columns={[
                        { key: "id", label: "ID", headerClassName: "min-w-[80px]" },
                        { key: "periodo", label: "Período", headerClassName: "min-w-[140px]", render: (t) => `${t.periodo}º período` },
                        { key: "ano", label: "Ano", headerClassName: "min-w-[100px]" },
                        { key: "qtdAlunos", label: "Qtd. Alunos", headerClassName: "min-w-[120px]" },
                        { key: "curso", label: "Curso", headerClassName: "min-w-[140px]" },
                        {
                            key: "status",
                            label: (
                                <TableFilterHead
                                    label="Status"
                                    value={fStatus}
                                    onChange={(valor) => {
                                        setFStatus(valor);
                                        setPaginaAtual(1);
                                    }}
                                    options={[
                                        { label: "Ativo", value: "Ativo" },
                                        { label: "Inativo", value: "Inativo" },
                                    ]}
                                />
                            ),
                            headerClassName: "min-w-[140px]",
                            render: (t) =>
                                t.status === "Ativo" ? (
                                    <span className="inline-flex items-center gap-2 font-medium text-[#13B900]">
                                        <CircleCheck className="size-4" />
                                        Ativo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 font-medium text-[#BA1A1A]">
                                        <CircleMinus className="size-4" />
                                        Inativo
                                    </span>
                                ),
                        },
                    ]}
                    actions={[
                        {
                            label: "Editar",
                            icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                            onClick: (t) => {
                                setSelecionada(t);
                                setEditarAberto(true);
                            },
                        },
                    ]}
                />

                {loading ? (
                    <p className="py-10 text-center text-sm text-[#17264D]/70">Carregando turmas...</p>
                ) : erroCarga ? (
                    <p role="alert" className="py-10 text-center text-sm text-red-700">{erroCarga}</p>
                ) : pagina.length === 0 && (
                    <p className="py-10 text-center text-sm text-[#17264D]/70">
                        Nenhuma turma encontrada.
                    </p>
                )}
            </div>

            <Pagination
                totalItems={totalElements}
                currentPage={paginaAtual}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={(n) => {
                    setItensPorPagina(n);
                    setPaginaAtual(1);
                }}
            />

            <TurmaFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                cursos={cursos}
                onConfirm={confirmarCadastro}
            />

            <TurmaFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionada(null);
                }}
                mode="editar"
                cursos={cursos}
                turma={selecionada}
                onConfirm={confirmarEdicao}
            />

            <Modal
                open={sucesso !== null}
                onClose={() => setSucesso(null)}
                type="success"
                message={sucesso ?? ""}
            />

            <Modal
                open={mensagemErro !== null}
                onClose={() => setMensagemErro(null)}
                type="error"
                message={mensagemErro ?? ""}
            />
        </div>
    );
}
