"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { cursosService } from "@/services/cursos.service";
import { ApiError } from "@/lib/api";
import { useRemotePage } from "@/hooks/use-remote-page";
import type { CursoResponse, ListCursoParams } from "@/types/api";

import { CursoFormModal } from "@/components/cursos/curso-form-modal";

import {
    type Curso,
    type Periodicidade,
    type StatusCurso,
} from "@/lib/cursos";

export function CursosListagem() {
    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroPeriodicidade, setFiltroPeriodicidade] = React.useState("");
    const [filtroDuracao, setFiltroDuracao] = React.useState("");
    const [filtroStatus, setFiltroStatus] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [erro, setErro] = React.useState<string | null>(null);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<Curso | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const carregarPagina = React.useCallback((params: ListCursoParams & { page: number; size: number }) => cursosService.listar(params), []);
    const filtrosApi: ListCursoParams = {
        busca: busca.trim(),
        nome: filtroNome.trim(),
        periodicidade: filtroPeriodicidade || undefined,
        duracao: /^\d+$/.test(filtroDuracao.trim()) ? Number(filtroDuracao) : undefined,
        status: filtroStatus === "Ativo" ? "ATIVO" : filtroStatus === "Inativo" ? "INATIVO" : undefined,
    };
    const { content: cursosApi, totalElements, loading, error: erroCarga } = useRemotePage(
        carregarPagina, filtrosApi, paginaAtual, itensPorPagina, refreshKey,
    );
    const cursos: Curso[] = cursosApi.map((c: CursoResponse) => ({
        id: String(c.id), nome: c.nome,
        periodicidade: c.periodicidade as Periodicidade,
        duracao: String(c.duracao), status: c.status === "INATIVO" ? "Inativo" : "Ativo",
    }));
    const pagina = cursos;

    function requestCurso(dados: { nome: string; periodicidade: Periodicidade; duracao: string; status: StatusCurso }) {
        const duracao = Number.parseInt(dados.duracao, 10);
        if (!Number.isInteger(duracao) || duracao <= 0) throw new Error("Informe a duração como um número inteiro.");
        return { nome: dados.nome, periodicidade: dados.periodicidade, duracao, status: dados.status === "Ativo" ? "ATIVO" as const : "INATIVO" as const };
    }

    async function confirmarCadastro(dados: {
        nome: string;
        periodicidade: Periodicidade;
        duracao: string;
        status: StatusCurso;
    }) {
        try {
            setErro(null);
            await cursosService.criar(requestCurso(dados));
            setPaginaAtual(1); setRefreshKey((key) => key + 1);
            setCadastrarAberto(false); setSucesso("Curso cadastrado com sucesso!");
        } catch (cause) { setErro(cause instanceof ApiError || cause instanceof Error ? cause.message : "Não foi possível cadastrar o curso."); }
    }

    async function confirmarEdicao(dados: {
        nome: string;
        periodicidade: Periodicidade;
        duracao: string;
        status: StatusCurso;
    }) {
        if (!selecionado) return;
        try {
            setErro(null);
            await cursosService.atualizar(Number(selecionado.id), requestCurso(dados));
            setRefreshKey((key) => key + 1);
            setEditarAberto(false); setSelecionado(null); setSucesso("Curso editado com sucesso!");
        } catch (cause) { setErro(cause instanceof ApiError || cause instanceof Error ? cause.message : "Não foi possível editar o curso."); }
    }

    if (loading && pagina.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando cursos...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/adminstrador/home"
                        aria-label="Voltar"
                        className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                    >
                        <ArrowLeft className="size-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#17264D]">Cursos</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie os cursos da instituição
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
                        name: "nome",
                        label: "Nome",
                        type: "input",
                        placeholder: "Filtrar por nome",
                        width: "w-[240px]",
                    },
                    {
                        name: "periodicidade",
                        label: "Periodicidade",
                        type: "select",
                        placeholder: "Selecione...",
                        options: [
                            { label: "Semestral", value: "Semestral" },
                            { label: "Anual", value: "Anual" },
                        ],
                    },
                    {
                        name: "duracao",
                        label: "Duração",
                        type: "input",
                        placeholder: "Ex: 3 anos",
                    },
                    {
                        name: "status",
                        label: "Status",
                        type: "select",
                        placeholder: "Todos",
                        options: [
                            { label: "Ativo", value: "Ativo" },
                            { label: "Inativo", value: "Inativo" },
                        ],
                    },
                ]}
                onChange={(f) => {
                    setFiltroNome(f.nome ?? "");
                    setFiltroPeriodicidade(f.periodicidade ?? "");
                    setFiltroDuracao(f.duracao ?? "");
                    setFiltroStatus(f.status ?? "");
                    setPaginaAtual(1);
                }}
            />

            {(erro || erroCarga) && <div role="alert" className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{erro ?? erroCarga}</div>}
            {loading ? (
                <div className="py-10 text-center text-sm text-[#17264D]/70">Carregando cursos...</div>
            ) : pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhum curso encontrado.
                </div>
            ) : (
                <DataTable
                    data={pagina}
                    getRowKey={(c) => c.id}
                    columns={[
                        { key: "nome", label: "Nome" },
                        { key: "periodicidade", label: "Periodicidade" },
                        { key: "duracao", label: "Duração" },
                        {
                            key: "status",
                            label: "Status",
                            render: (c) =>
                                c.status === "Ativo" ? (
                                    <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                                        <CheckCircle2 className="size-4" />
                                        Ativo
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 font-medium text-[#BA1A1A]">
                                        <XCircle className="size-4" />
                                        Inativo
                                    </span>
                                ),
                        },
                    ]}
                    actions={[
                        {
                            label: "Editar",
                            icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                            onClick: (c) => {
                                setSelecionado(c);
                                setEditarAberto(true);
                            },
                        },
                    ]}
                />
            )}

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

            <CursoFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                onConfirm={confirmarCadastro}
            />

            <CursoFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionado(null);
                }}
                mode="editar"
                curso={selecionado}
                onConfirm={confirmarEdicao}
            />

            <Modal
                open={sucesso !== null}
                onClose={() => setSucesso(null)}
                type="success"
                message={sucesso ?? ""}
            />
        </div>
    );
}
