"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, ArrowLeft, Loader2, CircleCheck, CircleMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { TurmaFormModal } from "@/components/turmas/turma-form-modal";
import { PERIODOS, ANOS, periodoLabel, mapTurmaResponseToView, type TurmaView } from "@/lib/turmas";
import { turmasService } from "@/services/turmas.service";
import { ApiError } from "@/lib/api";
import type { TurmaRequest } from "@/types/api";

export function TurmasListagem() {
    const [turmas, setTurmas] = React.useState<TurmaView[]>([]);
    const [carregando, setCarregando] = React.useState(true);
    const [erroCarregamento, setErroCarregamento] = React.useState<string | null>(null);
    const [totalElementos, setTotalElementos] = React.useState(0);

    const [busca, setBusca] = React.useState("");
    const [fPeriodo, setFPeriodo] = React.useState("");
    const [fAno, setFAno] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<TurmaView | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    const carregarTurmas = React.useCallback(() => {
        setCarregando(true);
        setErroCarregamento(null);

        turmasService
            .listar({
                page: paginaAtual - 1,
                size: itensPorPagina,
                periodo: fPeriodo ? Number(fPeriodo) : undefined,
                ano: fAno ? Number(fAno) : undefined,
                codigo: busca || undefined,
            })
            .then((resposta) => {
                setTurmas(resposta.content.map(mapTurmaResponseToView));
                setTotalElementos(resposta.totalElements);
            })
            .catch((e) => {
                setErroCarregamento(e instanceof ApiError ? e.message : "Erro ao carregar turmas.");
                setTurmas([]);
            })
            .finally(() => setCarregando(false));
    }, [paginaAtual, itensPorPagina, fPeriodo, fAno, busca]);

    React.useEffect(() => {
        carregarTurmas();
    }, [carregarTurmas]);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    async function confirmarCadastro(dados: TurmaRequest) {
        await turmasService.criar(dados);
        setCadastrarAberto(false);
        setSucesso("Turma cadastrada com sucesso!");
        carregarTurmas();
    }

    async function confirmarEdicao(dados: TurmaRequest) {
        if (!selecionada) return;
        await turmasService.atualizar(selecionada.id, dados);
        setEditarAberto(false);
        setSelecionada(null);
        setSucesso("Turma editada com sucesso!");
        carregarTurmas();
    }

    if (carregando && turmas.length === 0 && !erroCarregamento) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando turmas...</span>
            </div>
        );
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
                        <h1 className="text-3xl font-bold text-[#17264D]">Turmas</h1>
                        <p className="text-sm text-[#17264D]/70">Gerencie as turmas da instituição</p>
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
                    <Button variant="secondary" size="small" className="gap-2" onClick={() => setCadastrarAberto(true)}>
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
                        options: PERIODOS.map((p) => ({ label: p.label, value: String(p.value) })),
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
            />

            {erroCarregamento && (
                <div className="rounded-[10px] border border-[#BA1A1A] py-3 text-center text-sm text-[#BA1A1A]">
                    {erroCarregamento}
                </div>
            )}

            {turmas.length === 0 && !erroCarregamento ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma turma encontrada.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={turmas}
                        getRowKey={(t) => t.id}
                        columns={[
                            { key: "periodo", label: "Período", headerClassName: "min-w-[140px]", render: (t) => periodoLabel(t.periodo) },
                            { key: "ano", label: "Ano", headerClassName: "min-w-[100px]" },
                            { key: "qtdAlunos", label: "Qtd. Alunos", headerClassName: "min-w-[120px]" },
                            { key: "cursoNome", label: "Curso", headerClassName: "min-w-[140px]" },
                            {
                                key: "status",
                                label: "Status",
                                headerClassName: "min-w-[140px]",
                                render: (t) =>
                                    t.status === "ATIVO" ? (
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
                </div>
            )}

            <Pagination
                totalItems={totalElementos}
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
                onConfirm={confirmarCadastro}
            />

            <TurmaFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionada(null);
                }}
                mode="editar"
                turma={selecionada}
                onConfirm={confirmarEdicao}
            />

            <Modal open={sucesso !== null} onClose={() => setSucesso(null)} type="success" message={sucesso ?? ""} />
        </div>
    );
}