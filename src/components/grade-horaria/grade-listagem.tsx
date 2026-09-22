"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Pencil,
    Copy,
    Grid3x3,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";

import { GradeFormModal } from "@/components/grade-horaria/grade-form-modal";
import { CopiarGradeModal } from "@/components/grade-horaria/copiar-grade-modal";
import { SucessoGradeModal } from "@/components/grade-horaria/sucesso-grade-modal";

import {
    carregarGradesSalvas,
    CURSOS_DISPONIVEIS,
    formatarDataBR,
    gerarGradesMock,
    PERIODOS_LETIVOS,
    salvarGrades,
    type GradeHoraria,
    type StatusGrade,
} from "@/lib/grade-horaria";

const BASE = "/adminstrador/grade-planejamento/grade-horaria";

export function GradeListagem() {
    const router = useRouter();

    const [grades, setGrades] = React.useState<GradeHoraria[] | null>(null);

    React.useEffect(() => {
        const salvas = carregarGradesSalvas();
        setGrades(salvas ?? gerarGradesMock());
    }, []);

    React.useEffect(() => {
        if (grades === null) return;
        salvarGrades(grades);
    }, [grades]);

    const [busca, setBusca] = React.useState("");
    const [filtroVersao, setFiltroVersao] = React.useState("");
    const [filtroData, setFiltroData] = React.useState("");
    const [filtroCurso, setFiltroCurso] = React.useState("");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [copiarAberto, setCopiarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<GradeHoraria | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);
    const [recemCriadaId, setRecemCriadaId] = React.useState<string | null>(null);

    const filtradas = React.useMemo(() => {
        if (grades === null) return [];
        const b = busca.trim().toLowerCase();

        return grades.filter((g) => {
            const buscaOk =
                !b ||
                g.cursoVinculado.toLowerCase().includes(b) ||
                String(g.versao).includes(b);
            const versaoOk = !filtroVersao || String(g.versao) === filtroVersao;
            const dataOk = !filtroData || g.dataCriacao === filtroData;
            const cursoOk = !filtroCurso || g.cursoVinculado === filtroCurso;
            const periodoOk = !filtroPeriodo || g.periodoLetivo === filtroPeriodo;
            return buscaOk && versaoOk && dataOk && cursoOk && periodoOk;
        });
    }, [grades, busca, filtroVersao, filtroData, filtroCurso, filtroPeriodo]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    function confirmarCadastro(dados: {
        versao: number;
        dataCriacao: string;
        cursoVinculado: string;
        periodoLetivo: string;
        status: StatusGrade;
    }) {
        const nova: GradeHoraria = {
            id: crypto.randomUUID(),
            turno: "Vespertino",
            ...dados,
        };
        setGrades((prev) => [...(prev ?? []), nova]);
        setCadastrarAberto(false);
        setRecemCriadaId(nova.id);
        setSucesso("Grade horária cadastrada com sucesso!");
    }

    function confirmarEdicao(dados: {
        versao: number;
        dataCriacao: string;
        cursoVinculado: string;
        periodoLetivo: string;
        status: StatusGrade;
    }) {
        if (!selecionada) return;
        setGrades((prev) =>
            (prev ?? []).map((g) => (g.id === selecionada.id ? { ...g, ...dados } : g))
        );
        setEditarAberto(false);
        setSelecionada(null);
        setRecemCriadaId(null);
        setSucesso("Grade horária editada com sucesso!");
    }

    function confirmarCopia() {
        if (!selecionada) return;
        const copia: GradeHoraria = {
            ...selecionada,
            id: crypto.randomUUID(),
            versao: selecionada.versao + 1,
        };
        setGrades((prev) => [...(prev ?? []), copia]);
        setCopiarAberto(false);
        setSelecionada(null);
        setRecemCriadaId(null);
        setSucesso("Grade horária copiada com sucesso!");
    }

    if (grades === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando grades...</span>
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
                        <h1 className="text-3xl font-bold text-[#17264D]">Grade Horária</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie as grades da instituição
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
                    { name: "versao", label: "Versão", type: "input", inputType: "number" },
                    { name: "data", label: "Data de Criação", type: "input", inputType: "date" },
                    {
                        name: "curso",
                        label: "Curso Vinculado",
                        type: "select",
                        placeholder: "Selecione...",
                        options: CURSOS_DISPONIVEIS.map((c) => ({ label: c, value: c })),
                    },
                    {
                        name: "periodo",
                        label: "Período Letivo",
                        type: "select",
                        placeholder: "Selecione...",
                        options: PERIODOS_LETIVOS.map((p) => ({ label: p, value: p })),
                        width: "w-[220px]",
                    },
                ]}
                onChange={(f) => {
                    setFiltroVersao(f.versao ?? "");
                    setFiltroData(f.data ?? "");
                    setFiltroCurso(f.curso ?? "");
                    setFiltroPeriodo(f.periodo ?? "");
                    setPaginaAtual(1);
                }}
            />

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma grade encontrada.
                </div>
            ) : (
                <DataTable
                    data={pagina}
                    getRowKey={(g) => g.id}
                    columns={[
                        {
                            key: "versao",
                            label: "Versão",
                            render: (g) => String(g.versao).padStart(2, "0"),
                        },
                        {
                            key: "dataCriacao",
                            label: "Data de Criação",
                            render: (g) => formatarDataBR(g.dataCriacao),
                        },
                        { key: "cursoVinculado", label: "Curso Vinculado" },
                        { key: "periodoLetivo", label: "Período Letivo" },
                        {
                            key: "status",
                            label: "Status",
                            render: (g) =>
                                g.status === "Ativo" ? (
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
                            label: "Ver Grade",
                            icon: <Grid3x3 className="size-[21px]" strokeWidth={2} />,
                            onClick: (g) => router.push(`${BASE}/${g.id}`),
                        },
                        {
                            label: "Editar",
                            icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                            onClick: (g) => {
                                setSelecionada(g);
                                setEditarAberto(true);
                            },
                        },
                        {
                            label: "Copiar",
                            icon: <Copy className="size-[21px]" strokeWidth={2} />,
                            onClick: (g) => {
                                setSelecionada(g);
                                setCopiarAberto(true);
                            },
                        },
                    ]}
                />
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

            <GradeFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                onConfirm={confirmarCadastro}
            />

            <GradeFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionada(null);
                }}
                mode="editar"
                grade={selecionada}
                onConfirm={confirmarEdicao}
            />

            <CopiarGradeModal
                open={copiarAberto}
                onClose={() => {
                    setCopiarAberto(false);
                    setSelecionada(null);
                }}
                onConfirm={confirmarCopia}
            />

            <SucessoGradeModal
                open={sucesso !== null}
                onClose={() => {
                    setSucesso(null);
                    setRecemCriadaId(null);
                }}
                mensagem={sucesso ?? ""}
                acao={
                    recemCriadaId
                        ? {
                            label: "VISUALIZAR GRADE",
                            onClick: () => router.push(`${BASE}/${recemCriadaId}`),
                        }
                        : undefined
                }
            />
        </div>
    );
}