"use client";

import * as React from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
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

import { CursoFormDialog } from "@/components/cursos/curso-form-dialog";
import { SucessoDialog } from "@/components/cursos/sucesso-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    carregarCursosSalvos,
    gerarCursosMock,
    salvarCursos,
    type Curso,
    type Periodicidade,
    type StatusCurso,
} from "@/lib/cursos";

export function CursosListagem() {
    const [cursos, setCursos] = React.useState<Curso[] | null>(null);

    React.useEffect(() => {
        const salvos = carregarCursosSalvos();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCursos(salvos ?? gerarCursosMock());
    }, []);

    React.useEffect(() => {
        if (cursos === null) return;
        salvarCursos(cursos);
    }, [cursos]);

    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroPeriodicidade, setFiltroPeriodicidade] = React.useState<Periodicidade | "">("");
    const [filtroDuracao, setFiltroDuracao] = React.useState("");

    const [filtroStatusColuna, setFiltroStatusColuna] = React.useState<"Todos" | StatusCurso>("Todos");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [cursoSelecionado, setCursoSelecionado] = React.useState<Curso | null>(null);
    const [sucessoAberto, setSucessoAberto] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");

    const cursosFiltrados = React.useMemo(() => {
        if (cursos === null) return [];
        const buscaLower = busca.trim().toLowerCase();
        const nomeLower = filtroNome.trim().toLowerCase();
        const duracaoLower = filtroDuracao.trim().toLowerCase();

        const resultado = cursos.filter((c) => {
            const buscaOk = !buscaLower || c.nome.toLowerCase().includes(buscaLower);
            const nomeOk = !nomeLower || c.nome.toLowerCase().includes(nomeLower);
            const periodicidadeOk = !filtroPeriodicidade || c.periodicidade === filtroPeriodicidade;
            const duracaoOk = !duracaoLower || c.duracao.toLowerCase().includes(duracaoLower);
            const statusOk = filtroStatusColuna === "Todos" || c.status === filtroStatusColuna;
            return buscaOk && nomeOk && periodicidadeOk && duracaoOk && statusOk;
        });

        return resultado;
    }, [cursos, busca, filtroNome, filtroPeriodicidade, filtroDuracao, filtroStatusColuna]);

    const totalRegistros = cursosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);

    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const cursosPagina = cursosFiltrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    function irParaPagina(pagina: number) {
        setPaginaAtual(Math.min(Math.max(1, pagina), totalPaginas));
    }

    function limparFiltros() {
        setFiltroNome("");
        setFiltroPeriodicidade("");
        setFiltroDuracao("");
        setFiltroStatusColuna("Todos");
        setBusca("");
        setPaginaAtual(1);
    }

    function abrirEditar(curso: Curso) {
        setCursoSelecionado(curso);
        setEditarAberto(true);
    }

    function confirmarCadastro(dados: {
        nome: string;
        periodicidade: Periodicidade;
        duracao: string;
        status: StatusCurso;
    }) {
        const novo: Curso = {
            id: crypto.randomUUID(),
            ...dados,
        };
        setCursos((prev) => [...(prev ?? []), novo]);
        setCadastrarAberto(false);
        setMensagemSucesso("Curso cadastrado com sucesso!");
        setSucessoAberto(true);
    }

    function confirmarEdicao(dados: {
        nome: string;
        periodicidade: Periodicidade;
        duracao: string;
        status: StatusCurso;
    }) {
        if (!cursoSelecionado) return;
        setCursos((prev) =>
            (prev ?? []).map((c) => (c.id === cursoSelecionado.id ? { ...c, ...dados } : c))
        );
        setEditarAberto(false);
        setCursoSelecionado(null);
        setMensagemSucesso("Curso editado com sucesso!");
        setSucessoAberto(true);
    }

    if (cursos === null) {
        return (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
                <Loader2 className="size-6 animate-spin text-[#2fa4b5]" />
                <span className="text-sm text-muted-foreground">Carregando cursos...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
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
                        <h1 className="font-heading text-3xl font-bold text-foreground">Cursos</h1>
                        <p className="text-sm text-muted-foreground">Gerencie os cursos da instituição</p>
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
                            placeholder="Search...."
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

            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-[#cfe6ea] bg-[#eef7f9] p-5">
                <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="filtro-nome" className="text-foreground/80">Nome</Label>
                        <Input
                            id="filtro-nome"
                            value={filtroNome}
                            onChange={(e) => {
                                setFiltroNome(e.target.value);
                                setPaginaAtual(1);
                            }}
                            placeholder="Filtrar por nome"
                            className="w-56 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="filtro-periodicidade" className="text-foreground/80">Periodicidade</Label>
                        <NativeSelect
                            id="filtro-periodicidade"
                            value={filtroPeriodicidade}
                            onChange={(e) => {
                                setFiltroPeriodicidade(e.target.value as Periodicidade | "");
                                setPaginaAtual(1);
                            }}
                            className="w-40 bg-white"
                        >
                            <NativeSelectOption value="">Selecione...</NativeSelectOption>
                            <NativeSelectOption value="Semestral">Semestral</NativeSelectOption>
                            <NativeSelectOption value="Anual">Anual</NativeSelectOption>
                            <NativeSelectOption value="Trimestral">Trimestral</NativeSelectOption>
                        </NativeSelect>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="filtro-duracao" className="text-foreground/80">Duração</Label>
                        <Input
                            id="filtro-duracao"
                            value={filtroDuracao}
                            onChange={(e) => {
                                setFiltroDuracao(e.target.value);
                                setPaginaAtual(1);
                            }}
                            placeholder="Ex: 3 anos"
                            className="w-36 bg-white"
                        />
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

            <div className="overflow-hidden rounded-xl border border-[#e2ecee]">
                <Table className="table-fixed">
                    <colgroup>
                        <col className="w-[32%]" />
                        <col className="w-[16%]" />
                        <col className="w-[14%]" />
                        <col className="w-[18%]" />
                        <col className="w-[20%]" />
                    </colgroup>
                    <TableHeader>
                        <TableRow className="border-none bg-[#2f96a3] hover:bg-[#2f96a3] has-aria-expanded:!bg-[#2f96a3]">
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">Nome</TableHead>
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">Periodicidade</TableHead>
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">Duração</TableHead>
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-sm font-semibold text-white outline-none"
                                        >
                                            Status
                                            <ChevronDown className="size-3.5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem
                                            selected={filtroStatusColuna === "Todos"}
                                            onSelect={() => {
                                                setFiltroStatusColuna("Todos");
                                                setPaginaAtual(1);
                                            }}
                                        >
                                            Todos
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            selected={filtroStatusColuna === "Ativo"}
                                            onSelect={() => {
                                                setFiltroStatusColuna("Ativo");
                                                setPaginaAtual(1);
                                            }}
                                        >
                                            Ativo
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            selected={filtroStatusColuna === "Inativo"}
                                            onSelect={() => {
                                                setFiltroStatusColuna("Inativo");
                                                setPaginaAtual(1);
                                            }}
                                        >
                                            Inativo
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableHead>
                            <TableHead className="h-11 px-5 text-right text-sm font-semibold text-white">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cursosPagina.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                    Nenhum curso encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                        {cursosPagina.map((curso, index) => (
                            <TableRow
                                key={curso.id}
                                className={index % 2 === 1 ? "border-none bg-[#f4f8f9]" : "border-none bg-white"}
                            >
                                <TableCell className="px-5 py-3 text-sm text-foreground">{curso.nome}</TableCell>
                                <TableCell className="px-5 py-3 text-sm text-foreground">{curso.periodicidade}</TableCell>
                                <TableCell className="px-5 py-3 text-sm text-foreground">{curso.duracao}</TableCell>
                                <TableCell className="px-5 py-3 text-sm">
                                    {curso.status === "Ativo" ? (
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
                                <TableCell className="px-5 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            aria-label="Editar curso"
                                            onClick={() => abrirEditar(curso)}
                                            className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5] text-[#2fa4b5] transition-colors hover:bg-[#2fa4b5]/10"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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
                        : `Mostrando ${inicioIndice + 1} a ${Math.min(inicioIndice + itensPorPagina, totalRegistros)} de ${totalRegistros} registros`}
                </span>
            </div>

            <CursoFormDialog
                open={cadastrarAberto}
                onOpenChange={setCadastrarAberto}
                mode="cadastrar"
                onConfirm={confirmarCadastro}
            />

            <CursoFormDialog
                open={editarAberto}
                onOpenChange={(v) => {
                    setEditarAberto(v);
                    if (!v) setCursoSelecionado(null);
                }}
                mode="editar"
                curso={cursoSelecionado}
                onConfirm={confirmarEdicao}
            />

            <SucessoDialog
                open={sucessoAberto}
                onOpenChange={setSucessoAberto}
                mensagem={mensagemSucesso}
            />
        </div>
    );
}