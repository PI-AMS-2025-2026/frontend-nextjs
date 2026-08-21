"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Pencil,
    Copy,
    Grid3x3,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { GradeFormDialog } from "@/components/grade-horaria/grade-form-dialog";
import { CopiarGradeDialog } from "@/components/grade-horaria/copiar-grade-dialog";
import { SucessoDialog } from "@/components/grade-horaria/sucesso-dialog";

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

export function GradeListagem() {
    const router = useRouter();

    // null = ainda não sabemos os dados reais (aguardando checar o localStorage).
    const [grades, setGrades] = React.useState<GradeHoraria[] | null>(null);

    React.useEffect(() => {
        const salvas = carregarGradesSalvas();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGrades(salvas ?? gerarGradesMock());
    }, []);

    React.useEffect(() => {
        if (grades === null) return;
        salvarGrades(grades);
    }, [grades]);

    // busca e filtros
    const [busca, setBusca] = React.useState("");
    const [filtroVersao, setFiltroVersao] = React.useState("");
    const [filtroData, setFiltroData] = React.useState("");
    const [filtroCurso, setFiltroCurso] = React.useState("");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("");

    // paginação
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    // modais
    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [copiarAberto, setCopiarAberto] = React.useState(false);
    const [gradeSelecionada, setGradeSelecionada] = React.useState<GradeHoraria | null>(null);
    const [sucessoAberto, setSucessoAberto] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");
    const [gradeRecemCriadaId, setGradeRecemCriadaId] = React.useState<string | null>(null);

    const gradesFiltradas = React.useMemo(() => {
        if (grades === null) return [];
        const buscaLower = busca.trim().toLowerCase();

        return grades.filter((g) => {
            const buscaOk =
                !buscaLower ||
                g.cursoVinculado.toLowerCase().includes(buscaLower) ||
                String(g.versao).includes(buscaLower);
            const versaoOk = !filtroVersao || String(g.versao) === filtroVersao;
            const dataOk = !filtroData || g.dataCriacao === filtroData;
            const cursoOk = !filtroCurso || g.cursoVinculado === filtroCurso;
            const periodoOk = !filtroPeriodo || g.periodoLetivo === filtroPeriodo;
            return buscaOk && versaoOk && dataOk && cursoOk && periodoOk;
        });
    }, [grades, busca, filtroVersao, filtroData, filtroCurso, filtroPeriodo]);

    const totalRegistros = gradesFiltradas.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);

    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const gradesPagina = gradesFiltradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    function irParaPagina(pagina: number) {
        setPaginaAtual(Math.min(Math.max(1, pagina), totalPaginas));
    }

    function limparFiltros() {
        setFiltroVersao("");
        setFiltroData("");
        setFiltroCurso("");
        setFiltroPeriodo("");
        setBusca("");
        setPaginaAtual(1);
    }

    function abrirEditar(grade: GradeHoraria) {
        setGradeSelecionada(grade);
        setEditarAberto(true);
    }

    function abrirCopiar(grade: GradeHoraria) {
        setGradeSelecionada(grade);
        setCopiarAberto(true);
    }

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
        setGradeRecemCriadaId(nova.id);
        setMensagemSucesso("Grade horária cadastrada com sucesso!");
        setSucessoAberto(true);
    }

    function confirmarEdicao(dados: {
        versao: number;
        dataCriacao: string;
        cursoVinculado: string;
        periodoLetivo: string;
        status: StatusGrade;
    }) {
        if (!gradeSelecionada) return;
        setGrades((prev) =>
            (prev ?? []).map((g) => (g.id === gradeSelecionada.id ? { ...g, ...dados } : g))
        );
        setEditarAberto(false);
        setGradeSelecionada(null);
        setGradeRecemCriadaId(null);
        setMensagemSucesso("Grade horária editada com sucesso!");
        setSucessoAberto(true);
    }

    function confirmarCopia() {
        if (!gradeSelecionada) return;
        const copia: GradeHoraria = {
            ...gradeSelecionada,
            id: crypto.randomUUID(),
            versao: gradeSelecionada.versao + 1,
        };
        setGrades((prev) => [...(prev ?? []), copia]);
        setCopiarAberto(false);
        setGradeSelecionada(null);
        setGradeRecemCriadaId(null);
        setMensagemSucesso("Grade horária copiada com sucesso!");
        setSucessoAberto(true);
    }

    if (grades === null) {
        return (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
                <Loader2 className="size-6 animate-spin text-[#2fa4b5]" />
                <span className="text-sm text-muted-foreground">Carregando grades...</span>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
                {/* Cabeçalho da página */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            aria-label="Voltar"
                            className="flex size-9 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="size-6" />
                        </Link>
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-foreground">
                                Grade Horária
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Gerencie as grades da instituição
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={busca}
                                onChange={(e) => {
                                    setBusca(e.target.value);
                                    setPaginaAtual(1);
                                }}
                                placeholder="Pesquisar..."
                                className="h-9 w-48 pl-8"
                            />
                        </div>
                        <Button
                            type="button"
                            className="h-9 gap-1.5 bg-[#2fa4b5] px-4 font-semibold text-white hover:bg-[#2a93a2]"
                            onClick={() => setCadastrarAberto(true)}
                        >
                            <Plus className="size-4" />
                            Cadastrar
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-[#cfe6ea] bg-[#eef7f9] p-5">
                    <div className="flex flex-wrap gap-6">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="filtro-versao" className="text-foreground/80">
                                Versão
                            </Label>
                            <Input
                                id="filtro-versao"
                                type="number"
                                min={0}
                                placeholder="0"
                                value={filtroVersao}
                                onChange={(e) => {
                                    setFiltroVersao(e.target.value);
                                    setPaginaAtual(1);
                                }}
                                className="w-24 bg-white"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="filtro-data" className="text-foreground/80">
                                Data de Criação
                            </Label>
                            <Input
                                id="filtro-data"
                                type="date"
                                value={filtroData}
                                onChange={(e) => {
                                    setFiltroData(e.target.value);
                                    setPaginaAtual(1);
                                }}
                                className="w-40 bg-white"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="filtro-curso" className="text-foreground/80">
                                Curso Vinculado
                            </Label>
                            <NativeSelect
                                id="filtro-curso"
                                value={filtroCurso}
                                onChange={(e) => {
                                    setFiltroCurso(e.target.value);
                                    setPaginaAtual(1);
                                }}
                                className="w-40 bg-white"
                            >
                                <NativeSelectOption value="">Selecione...</NativeSelectOption>
                                {CURSOS_DISPONIVEIS.map((curso) => (
                                    <NativeSelectOption key={curso} value={curso}>
                                        {curso}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="filtro-periodo" className="text-foreground/80">
                                Período Letivo
                            </Label>
                            <NativeSelect
                                id="filtro-periodo"
                                value={filtroPeriodo}
                                onChange={(e) => {
                                    setFiltroPeriodo(e.target.value);
                                    setPaginaAtual(1);
                                }}
                                className="w-44 bg-white"
                            >
                                <NativeSelectOption value="">Selecione...</NativeSelectOption>
                                {PERIODOS_LETIVOS.map((periodo) => (
                                    <NativeSelectOption key={periodo} value={periodo}>
                                        {periodo}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="default"
                        className="h-9 !bg-transparent !border !border-[#2fa4b5] !text-[#1c5468] !shadow-none font-semibold hover:!bg-[#2fa4b5]/10"
                        onClick={limparFiltros}
                    >
                        Limpar filtros
                    </Button>
                </div>

                {/* Tabela */}
                <div className="overflow-hidden rounded-xl border border-[#e2ecee]">
                    <Table className="table-fixed">
                        <colgroup>
                            <col className="w-[12%]" />
                            <col className="w-[18%]" />
                            <col className="w-[22%]" />
                            <col className="w-[22%]" />
                            <col className="w-[12%]" />
                            <col className="w-[14%]" />
                        </colgroup>
                        <TableHeader>
                            <TableRow className="border-none bg-[#2f96a3] hover:bg-[#2f96a3] has-aria-expanded:!bg-[#2f96a3]">
                                <TableHead className="h-11 px-4 text-sm font-semibold text-white">
                                    Versão
                                </TableHead>
                                <TableHead className="h-11 px-4 text-sm font-semibold text-white">
                                    Data de Criação
                                </TableHead>
                                <TableHead className="h-11 px-4 text-sm font-semibold text-white">
                                    Curso Vinculado
                                </TableHead>
                                <TableHead className="h-11 px-4 text-sm font-semibold text-white">
                                    Período Letivo
                                </TableHead>
                                <TableHead className="h-11 px-4 text-sm font-semibold text-white">
                                    Status
                                </TableHead>
                                <TableHead className="h-11 px-4 text-right text-sm font-semibold text-white">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradesPagina.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                        Nenhuma grade encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                            {gradesPagina.map((grade, index) => (
                                <TableRow
                                    key={grade.id}
                                    className={index % 2 === 1 ? "border-none bg-[#f4f8f9]" : "border-none bg-white"}
                                >
                                    <TableCell className="px-4 py-3 text-sm text-foreground">
                                        {String(grade.versao).padStart(2, "0")}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-foreground">
                                        {formatarDataBR(grade.dataCriacao)}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-foreground">
                                        {grade.cursoVinculado}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-foreground">
                                        {grade.periodoLetivo}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm">
                                        {grade.status === "Ativo" ? (
                                            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                                                <CheckCircle2 className="size-4" />
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 font-medium text-destructive">
                                                <XCircle className="size-4" />
                                                Inativo
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        aria-label="Ver grade"
                                                        onClick={() => router.push(`/grade-horaria/${grade.id}`)}
                                                        className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5] text-[#2fa4b5] transition-colors hover:bg-[#2fa4b5]/10"
                                                    >
                                                        <Grid3x3 className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="!bg-[#0c2c3e] !text-white">
                                                    Ver Grade
                                                </TooltipContent>
                                            </Tooltip>
                                            <button
                                                type="button"
                                                aria-label="Editar grade"
                                                onClick={() => abrirEditar(grade)}
                                                className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5] text-[#2fa4b5] transition-colors hover:bg-[#2fa4b5]/10"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Copiar grade"
                                                onClick={() => abrirCopiar(grade)}
                                                className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5] text-[#2fa4b5] transition-colors hover:bg-[#2fa4b5]/10"
                                            >
                                                <Copy className="size-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                <div className="grid grid-cols-3 items-center gap-4 rounded-xl border border-[#e2ecee] px-4 py-3">
                    <div className="flex items-center gap-2 justify-self-start">
                        <span className="text-sm text-foreground/80">Itens por página:</span>
                        <NativeSelect
                            value={itensPorPagina}
                            onChange={(e) => {
                                setItensPorPagina(Number(e.target.value));
                                setPaginaAtual(1);
                            }}
                            className="w-[70px]"
                        >
                            {[6, 10, 20, 50].map((n) => (
                                <NativeSelectOption key={n} value={n}>
                                    {n}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </div>

                    <div className="flex items-center gap-2 justify-self-center">
                        <button
                            type="button"
                            aria-label="Primeira página"
                            disabled={paginaSegura === 1}
                            onClick={() => irParaPagina(1)}
                            className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5]/40 text-[#1c5468] transition-colors hover:bg-[#2fa4b5]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronsLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Página anterior"
                            disabled={paginaSegura === 1}
                            onClick={() => irParaPagina(paginaSegura - 1)}
                            className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5]/40 text-[#1c5468] transition-colors hover:bg-[#2fa4b5]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="size-4" />
                        </button>

                        <span className="min-w-[110px] rounded-lg bg-[#bfe4e8] px-4 py-1.5 text-center text-sm font-semibold tabular-nums text-[#0c2c3e]">
                            Página {paginaSegura} de {totalPaginas}
                        </span>

                        <button
                            type="button"
                            aria-label="Próxima página"
                            disabled={paginaSegura === totalPaginas}
                            onClick={() => irParaPagina(paginaSegura + 1)}
                            className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5]/40 text-[#1c5468] transition-colors hover:bg-[#2fa4b5]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Última página"
                            disabled={paginaSegura === totalPaginas}
                            onClick={() => irParaPagina(totalPaginas)}
                            className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5]/40 text-[#1c5468] transition-colors hover:bg-[#2fa4b5]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronsRight className="size-4" />
                        </button>
                    </div>

                    <span className="justify-self-end text-right text-sm tabular-nums text-foreground/70">
                        {totalRegistros === 0
                            ? "Nenhum registro encontrado"
                            : `Mostrando ${inicioIndice + 1} a ${Math.min(
                                inicioIndice + itensPorPagina,
                                totalRegistros
                            )} de ${totalRegistros} registros`}
                    </span>
                </div>

                {/* Modais */}
                <GradeFormDialog
                    open={cadastrarAberto}
                    onOpenChange={setCadastrarAberto}
                    mode="cadastrar"
                    onConfirm={confirmarCadastro}
                />

                <GradeFormDialog
                    open={editarAberto}
                    onOpenChange={(v) => {
                        setEditarAberto(v);
                        if (!v) setGradeSelecionada(null);
                    }}
                    mode="editar"
                    grade={gradeSelecionada}
                    onConfirm={confirmarEdicao}
                />

                <CopiarGradeDialog
                    open={copiarAberto}
                    onOpenChange={(v) => {
                        setCopiarAberto(v);
                        if (!v) setGradeSelecionada(null);
                    }}
                    onConfirm={confirmarCopia}
                />

                <SucessoDialog
                    open={sucessoAberto}
                    onOpenChange={(v) => {
                        setSucessoAberto(v);
                        if (!v) setGradeRecemCriadaId(null);
                    }}
                    mensagem={mensagemSucesso}
                    acao={
                        gradeRecemCriadaId
                            ? {
                                label: "VISUALIZAR GRADE",
                                onClick: () => router.push(`/grade-horaria/${gradeRecemCriadaId}`),
                            }
                            : undefined
                    }
                />
            </div>
        </TooltipProvider>
    );
}