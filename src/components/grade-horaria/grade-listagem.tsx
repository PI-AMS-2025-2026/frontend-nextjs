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
import { Modal } from "@/components/ui/modal";

import { GradeFormModal } from "@/components/grade-horaria/grade-form-modal";
import { CopiarGradeModal } from "@/components/grade-horaria/copiar-grade-modal";
import { SucessoGradeModal } from "@/components/grade-horaria/sucesso-grade-modal";
import { quadroHorariosService } from "@/services/quadro-horarios.service";
import { cursosService } from "@/services/cursos.service";
import { periodoAtividadeQuadroService } from "@/services/periodo-atividade-quadro.service";
import { useRemotePage } from "@/hooks/use-remote-page";
import type { ListQuadroHorarioParams, QuadroHorarioResponse, CursoResponse, PeriodoAtividadeQuadroResponse } from "@/types/api";
import type { GradeCursoOpcao, GradePeriodoOpcao } from "@/components/grade-horaria/grade-form-modal";

import {
    formatarDataBR,
    type GradeHoraria,
    type StatusGrade,
} from "@/lib/grade-horaria";

const BASE = "/adminstrador/grade-planejamento/grade-horaria";

export function GradeListagem() {
    const router = useRouter();
    const [cursos, setCursos] = React.useState<GradeCursoOpcao[]>([]);
    const [periodos, setPeriodos] = React.useState<GradePeriodoOpcao[]>([]);
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [erro, setErro] = React.useState<string | null>(null);

    const [busca, setBusca] = React.useState("");
    const [filtroVersao, setFiltroVersao] = React.useState("");
    const [filtroData, setFiltroData] = React.useState("");
    const [filtroCurso, setFiltroCurso] = React.useState("");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("");

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [copiarAberto, setCopiarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<GradeHoraria | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);
    const [recemCriadaId, setRecemCriadaId] = React.useState<string | null>(null);
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    React.useEffect(() => {
        let ativo = true;
        void Promise.all([
            cursosService.listar({ status: "ATIVO", page: 0, size: 1000 }),
            periodoAtividadeQuadroService.listar({ status: "ATIVO", page: 0, size: 1000 }),
        ]).then(([resCursos, resPeriodos]) => {
            if (!ativo) return;
            setCursos(resCursos.content.map((c: CursoResponse) => ({ id: String(c.id), nome: c.nome })));
            setPeriodos(resPeriodos.content.map((p: PeriodoAtividadeQuadroResponse) => {
                const inicio = new Date(`${p.dataInicio}T00:00:00`);
                const semestre = inicio.getMonth() < 6 ? 1 : 2;
                return { id: String(p.id), label: `${semestre}º Semestre de ${p.ano}` };
            }));
        }).catch((cause: unknown) => {
            if (ativo) setErro(cause instanceof Error ? cause.message : "Não foi possível carregar as opções de curso e período letivo.");
        });
        return () => { ativo = false; };
    }, []);

    const carregarPagina = React.useCallback((params: ListQuadroHorarioParams & { page: number; size: number }) => quadroHorariosService.listar(params), []);
    const filtrosApi: ListQuadroHorarioParams = {
        busca: busca.trim(),
        versao: filtroVersao ? Number(filtroVersao) : undefined,
        data_criacao: filtroData || undefined,
        curso: filtroCurso ? Number(filtroCurso) : undefined,
        periodo_atividade_quadro: filtroPeriodo ? Number(filtroPeriodo) : undefined,
    };
    const { content: gradesApi, totalElements, loading, error: erroCarga } = useRemotePage(
        carregarPagina, filtrosApi, paginaAtual, itensPorPagina, refreshKey,
    );
    const grades: GradeHoraria[] = gradesApi.map((g: QuadroHorarioResponse) => {
        const inicio = new Date(`${g.periodoAtividadeQuadro.dataInicio}T00:00:00`);
        const semestre = inicio.getMonth() < 6 ? 1 : 2;
        return {
            id: String(g.id), versao: g.versao, dataCriacao: g.dataCriacao.slice(0, 10),
            cursoId: String(g.curso.id), cursoVinculado: g.curso.nome,
            periodoAtividadeQuadroId: String(g.periodoAtividadeQuadro.id),
            periodoLetivo: `${semestre}º Semestre de ${g.periodoAtividadeQuadro.ano}`,
            turno: "Vespertino", status: g.status === "INATIVO" ? "Inativo" : "Ativo",
        };
    });
    const pagina = grades;

    async function confirmarCadastro(dados: {
        versao: number;
        cursoId: string;
        periodoAtividadeQuadroId: string;
        status: StatusGrade;
    }) {
        try {
            const criada = await quadroHorariosService.criar({
                versao: dados.versao, status: dados.status === "Ativo" ? "ATIVO" : "INATIVO",
                curso: { id: Number(dados.cursoId) },
                periodoAtividadeQuadro: { id: Number(dados.periodoAtividadeQuadroId) },
            });
            setRefreshKey((key) => key + 1); setPaginaAtual(1);
            setCadastrarAberto(false); setRecemCriadaId(String(criada.id));
            setSucesso("Grade horária cadastrada com sucesso!");
        } catch (cause) { setErro(cause instanceof Error ? cause.message : "Não foi possível cadastrar a grade."); }
    }

    async function confirmarEdicao(dados: {
        versao: number;
        cursoId: string;
        periodoAtividadeQuadroId: string;
        status: StatusGrade;
    }) {
        if (!selecionada) return;
        try {
            await quadroHorariosService.atualizar(Number(selecionada.id), {
                versao: dados.versao, status: dados.status === "Ativo" ? "ATIVO" : "INATIVO",
                curso: { id: Number(dados.cursoId) },
                periodoAtividadeQuadro: { id: Number(dados.periodoAtividadeQuadroId) },
            });
            setRefreshKey((key) => key + 1); setEditarAberto(false); setSelecionada(null);
            setRecemCriadaId(null); setSucesso("Grade horária editada com sucesso!");
        } catch (cause) { setErro(cause instanceof Error ? cause.message : "Não foi possível editar a grade."); }
    }

    async function confirmarCopia() {
        if (!selecionada) return;
        try {
            const copia = await quadroHorariosService.copiar(Number(selecionada.id), {
                versao: selecionada.versao + 1, status: "ATIVO",
                curso: { id: Number(selecionada.cursoId) },
                periodoAtividadeQuadro: { id: Number(selecionada.periodoAtividadeQuadroId) },
            });
            setRefreshKey((key) => key + 1); setPaginaAtual(1);
            setCopiarAberto(false); setSelecionada(null); setRecemCriadaId(String(copia.id));
            setSucesso("Grade horária copiada com sucesso!");
        } catch (cause) { setErro(cause instanceof Error ? cause.message : "Não foi possível copiar a grade."); }
    }

    if (loading && pagina.length === 0 && !erroCarga) {
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
                        options: cursos.map((curso) => ({ label: curso.nome, value: curso.id })),
                    },
                    {
                        name: "periodo",
                        label: "Período Letivo",
                        type: "select",
                        placeholder: "Selecione...",
                        options: periodos.map((periodo) => ({ label: periodo.label, value: periodo.id })),
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

            {(erro || erroCarga) && <div role="alert" className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{erro ?? erroCarga}</div>}
            {loading ? (
                <div className="py-10 text-center text-sm text-[#17264D]/70">Carregando grades...</div>
            ) : pagina.length === 0 ? (
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
                totalItems={totalElements}
                currentPage={paginaAtual}
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
                cursos={cursos}
                periodos={periodos}
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
                cursos={cursos}
                periodos={periodos}
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
            <Modal open={erro !== null} onClose={() => setErro(null)} type="error" message={erro ?? ""} />
        </div>
    );
}
