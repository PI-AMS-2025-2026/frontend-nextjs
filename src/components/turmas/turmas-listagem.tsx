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

import {
    carregarTurmasSalvas,
    gerarTurmasMock,
    salvarTurmas,
    PERIODOS,
    ANOS,
    type Turma,
    type Status,
} from "@/lib/turmas";

export function TurmasListagem() {
    const [turmas, setTurmas] = React.useState<Turma[] | null>(null);

    React.useEffect(() => {
        const salvas = carregarTurmasSalvas();
        setTurmas(salvas ?? gerarTurmasMock());
    }, []);

    React.useEffect(() => {
        if (turmas === null) return;
        salvarTurmas(turmas);
    }, [turmas]);

    const [busca, setBusca] = React.useState("");
    const [fPeriodo, setFPeriodo] = React.useState("");
    const [fAno, setFAno] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<Turma | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const filtradas = React.useMemo(() => {
        if (turmas === null) return [];
        const b = busca.trim().toLowerCase();

        return turmas.filter((t) => {
            const buscaOk =
                !b ||
                t.curso.toLowerCase().includes(b) ||
                t.periodo.toLowerCase().includes(b) ||
                String(t.ano).includes(b);
            const periodoOk = !fPeriodo || t.periodo === fPeriodo;
            const anoOk = !fAno || String(t.ano) === fAno;
            return buscaOk && periodoOk && anoOk;
        });
    }, [turmas, busca, fPeriodo, fAno]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    function confirmarCadastro(dados: {
        periodo: string;
        curso: string;
        qtdAlunos: number;
        ano: number;
        status: Status;
    }) {
        setTurmas((prev) => [
            ...(prev ?? []),
            { id: crypto.randomUUID(), ...dados },
        ]);
        setCadastrarAberto(false);
        setSucesso("Turma cadastrada com sucesso!");
    }

    function confirmarEdicao(dados: {
        periodo: string;
        curso: string;
        qtdAlunos: number;
        ano: number;
        status: Status;
    }) {
        if (!selecionada) return;
        setTurmas((prev) =>
            (prev ?? []).map((t) => (t.id === selecionada.id ? { ...t, ...dados } : t))
        );
        setEditarAberto(false);
        setSelecionada(null);
        setSucesso("Turma editada com sucesso!");
    }

    if (turmas === null) {
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
            />

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma turma encontrada.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={pagina}
                        getRowKey={(t) => t.id}
                        columns={[
                            { key: "periodo", label: "Período", headerClassName: "min-w-[140px]" },
                            { key: "ano", label: "Ano", headerClassName: "min-w-[100px]" },
                            { key: "qtdAlunos", label: "Qtd. Alunos", headerClassName: "min-w-[120px]" },
                            { key: "curso", label: "Curso", headerClassName: "min-w-[140px]" },
                            {
                                key: "status",
                                label: "Status",
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
                </div>
            )}

            <Pagination
                totalItems={filtradas.length}
                currentPage={paginaSegura}
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

            <Modal
                open={sucesso !== null}
                onClose={() => setSucesso(null)}
                type="success"
                message={sucesso ?? ""}
            />
        </div>
    );
}
