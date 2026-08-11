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
    ChevronUp,
    ChevronDown,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { DisciplinaFormDialog } from "@/components/disciplinas/disciplina-form-dialog";
import { SucessoDialog } from "@/components/disciplinas/sucesso-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    carregarDisciplinasSalvas,
    CORES_DISCIPLINA,
    CURSOS_DISPONIVEIS,
    gerarDisciplinasMock,
    salvarDisciplinas,
    type Disciplina,
    type Modalidade,
    type Periodo,
    type StatusDisciplina,
    type TipoDisciplina,
    type TipoSala,
} from "@/lib/disciplinas";

// ---------- Cabeçalho de ORDENAÇÃO (Nome, Carga horária, Código) ----------

type CampoOrdenavel = "nome" | "cargaHoraria" | "codigo";

interface OpcaoOrdem {
    valor: "asc" | "desc";
    label: string;
}

interface SortHeadProps {
    label: string;
    campo: CampoOrdenavel;
    opcoes: [OpcaoOrdem, OpcaoOrdem];
    ordem: { campo: CampoOrdenavel | null; direcao: "asc" | "desc" };
    onSort: (campo: CampoOrdenavel, direcao: "asc" | "desc") => void;
}

function SortHead({ label, campo, opcoes, ordem, onSort }: SortHeadProps) {
    const ativo = ordem.campo === campo;
    return (
        <TableHead className="h-11 px-4 text-sm font-semibold text-white">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-white outline-none"
                    >
                        {label}
                        {ativo && ordem.direcao === "asc" ? (
                            <ChevronUp className="size-3.5" />
                        ) : (
                            <ChevronDown className={`size-3.5 ${ativo ? "" : "opacity-50"}`} />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {opcoes.map((op) => (
                        <DropdownMenuItem
                            key={op.valor}
                            selected={ativo && ordem.direcao === op.valor}
                            onSelect={() => onSort(campo, op.valor)}
                        >
                            {op.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </TableHead>
    );
}

// ---------- Cabeçalho de FILTRO (Tipo, Período, Modalidade, Cor, Curso, Sala, Status) ----------

interface OpcaoFiltro {
    valor: string;
    label: string;
    cor?: string; // se preenchido, mostra uma bolinha colorida antes do label
}

interface FilterHeadProps {
    label: string;
    opcoes: OpcaoFiltro[];
    valorSelecionado: string;
    onSelect: (valor: string) => void;
}

function FilterHead({ label, opcoes, valorSelecionado, onSelect }: FilterHeadProps) {
    const ativo = valorSelecionado !== "Todos";
    return (
        <TableHead className="h-11 px-4 text-sm font-semibold text-white">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-white outline-none"
                    >
                        {label}
                        <ChevronDown className={`size-3.5 ${ativo ? "" : "opacity-50"}`} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {opcoes.map((op) => (
                        <DropdownMenuItem
                            key={op.valor}
                            selected={valorSelecionado === op.valor}
                            onSelect={() => onSelect(op.valor)}
                        >
                            <span className="flex items-center gap-2">
                                {op.cor && (
                                    <span
                                        className="size-3 rounded-full"
                                        style={{ backgroundColor: op.cor }}
                                    />
                                )}
                                {op.label}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </TableHead>
    );
}

const OPCOES_TIPO: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todos" },
    { valor: "Teórica", label: "Teórica" },
    { valor: "Prática", label: "Prática" },
    { valor: "50/50", label: "50/50" },
];

const OPCOES_PERIODO: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todos" },
    { valor: "Manhã", label: "Manhã" },
    { valor: "Tarde", label: "Tarde" },
    { valor: "Noite", label: "Noite" },
];

const OPCOES_MODALIDADE: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todos" },
    { valor: "Presencial", label: "Presencial" },
    { valor: "EAD", label: "EAD" },
];

const OPCOES_TIPO_SALA: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todos" },
    { valor: "Laboratório", label: "Laboratório" },
    { valor: "Sala", label: "Sala" },
];

const OPCOES_STATUS: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todos" },
    { valor: "Ativo", label: "Ativo" },
    { valor: "Inativo", label: "Inativo" },
];

const OPCOES_COR: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todas" },
    ...CORES_DISCIPLINA.map((c) => ({ valor: c.hex, label: c.nome, cor: c.hex })),
];

const OPCOES_CURSO: OpcaoFiltro[] = [
    { valor: "Todos", label: "Todos" },
    ...CURSOS_DISPONIVEIS.map((c) => ({ valor: c, label: c })),
];

export function DisciplinasListagem() {
    const [disciplinas, setDisciplinas] = React.useState<Disciplina[] | null>(null);

    React.useEffect(() => {
        const salvas = carregarDisciplinasSalvas();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisciplinas(salvas ?? gerarDisciplinasMock());
    }, []);

    React.useEffect(() => {
        if (disciplinas === null) return;
        salvarDisciplinas(disciplinas);
    }, [disciplinas]);

    const [busca, setBusca] = React.useState("");

    const [ordem, setOrdem] = React.useState<{
        campo: CampoOrdenavel | null;
        direcao: "asc" | "desc";
    }>({ campo: null, direcao: "asc" });

    const [filtroTipo, setFiltroTipo] = React.useState("Todos");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("Todos");
    const [filtroModalidade, setFiltroModalidade] = React.useState("Todos");
    const [filtroCor, setFiltroCor] = React.useState("Todos");
    const [filtroCurso, setFiltroCurso] = React.useState("Todos");
    const [filtroTipoSala, setFiltroTipoSala] = React.useState("Todos");
    const [filtroStatus, setFiltroStatus] = React.useState("Todos");

    const [itensPorPagina, setItensPorPagina] = React.useState(8);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [disciplinaSelecionada, setDisciplinaSelecionada] =
        React.useState<Disciplina | null>(null);
    const [sucessoAberto, setSucessoAberto] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");

    function ordenarPor(campo: CampoOrdenavel, direcao: "asc" | "desc") {
        setOrdem({ campo, direcao });
        setPaginaAtual(1);
    }

    function aplicarFiltro(setter: (v: string) => void, valor: string) {
        setter(valor);
        setPaginaAtual(1);
    }

    const disciplinasFiltradas = React.useMemo(() => {
        if (disciplinas === null) return [];
        const buscaLower = busca.trim().toLowerCase();

        let resultado = disciplinas.filter((d) => {
            const buscaOk =
                !buscaLower ||
                d.nome.toLowerCase().includes(buscaLower) ||
                d.cursoVinculado.toLowerCase().includes(buscaLower) ||
                String(d.codigo).includes(buscaLower);
            const tipoOk = filtroTipo === "Todos" || d.tipo === filtroTipo;
            const periodoOk = filtroPeriodo === "Todos" || d.periodo === filtroPeriodo;
            const modalidadeOk = filtroModalidade === "Todos" || d.modalidade === filtroModalidade;
            const corOk = filtroCor === "Todos" || d.cor === filtroCor;
            const cursoOk = filtroCurso === "Todos" || d.cursoVinculado === filtroCurso;
            const salaOk = filtroTipoSala === "Todos" || d.tipoSala === filtroTipoSala;
            const statusOk = filtroStatus === "Todos" || d.status === filtroStatus;

            return (
                buscaOk &&
                tipoOk &&
                periodoOk &&
                modalidadeOk &&
                corOk &&
                cursoOk &&
                salaOk &&
                statusOk
            );
        });

        if (ordem.campo) {
            const campo = ordem.campo;
            resultado = [...resultado].sort((a, b) => {
                const va = a[campo];
                const vb = b[campo];
                const cmp =
                    typeof va === "number" && typeof vb === "number"
                        ? va - vb
                        : String(va).localeCompare(String(vb));
                return ordem.direcao === "asc" ? cmp : -cmp;
            });
        }

        return resultado;
    }, [
        disciplinas,
        busca,
        ordem,
        filtroTipo,
        filtroPeriodo,
        filtroModalidade,
        filtroCor,
        filtroCurso,
        filtroTipoSala,
        filtroStatus,
    ]);

    const totalRegistros = disciplinasFiltradas.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);

    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const disciplinasPagina = disciplinasFiltradas.slice(
        inicioIndice,
        inicioIndice + itensPorPagina
    );

    function irParaPagina(pagina: number) {
        setPaginaAtual(Math.min(Math.max(1, pagina), totalPaginas));
    }

    function abrirEditar(disciplina: Disciplina) {
        setDisciplinaSelecionada(disciplina);
        setEditarAberto(true);
    }

    function confirmarCadastro(dados: {
        nome: string;
        cargaHoraria: number;
        tipo: TipoDisciplina;
        periodo: Periodo;
        modalidade: Modalidade;
        codigo: number;
        cor: string;
        cursoVinculado: string;
        tipoSala: TipoSala;
        status: StatusDisciplina;
    }) {
        const nova: Disciplina = { id: crypto.randomUUID(), ...dados };
        setDisciplinas((prev) => [...(prev ?? []), nova]);
        setCadastrarAberto(false);
        setMensagemSucesso("Disciplina criada com sucesso!");
        setSucessoAberto(true);
    }

    function confirmarEdicao(dados: {
        nome: string;
        cargaHoraria: number;
        tipo: TipoDisciplina;
        periodo: Periodo;
        modalidade: Modalidade;
        codigo: number;
        cor: string;
        cursoVinculado: string;
        tipoSala: TipoSala;
        status: StatusDisciplina;
    }) {
        if (!disciplinaSelecionada) return;
        setDisciplinas((prev) =>
            (prev ?? []).map((d) =>
                d.id === disciplinaSelecionada.id ? { ...d, ...dados } : d
            )
        );
        setEditarAberto(false);
        setDisciplinaSelecionada(null);
        setMensagemSucesso("Disciplina editada com sucesso!");
        setSucessoAberto(true);
    }

    if (disciplinas === null) {
        return (
            <div className="mx-auto flex w-full max-w-[1300px] flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
                <Loader2 className="size-6 animate-spin text-[#2fa4b5]" />
                <span className="text-sm text-muted-foreground">Carregando disciplinas...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1300px] flex-1 flex-col gap-6 px-6 py-8">
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
                            Disciplinas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gerencie as disciplinas da instituição
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

            {/* Tabela (rolagem horizontal — muitas colunas) */}
            <div className="overflow-hidden rounded-xl border border-[#e2ecee]">
                <Table>
                    <colgroup>
                        <col className="w-[210px]" />
                        <col className="w-[110px]" />
                        <col className="w-[90px]" />
                        <col className="w-[90px]" />
                        <col className="w-[100px]" />
                        <col className="w-[90px]" />
                        <col className="w-[90px]" />
                        <col className="w-[230px]" />
                        <col className="w-[110px]" />
                        <col className="w-[100px]" />
                        <col className="w-[90px]" />
                    </colgroup>
                    <TableHeader>
                        <TableRow className="border-none bg-[#2f96a3] hover:bg-[#2f96a3] has-aria-expanded:!bg-[#2f96a3]">
                            <SortHead
                                label="Nome"
                                campo="nome"
                                opcoes={[
                                    { valor: "asc", label: "A-Z" },
                                    { valor: "desc", label: "Z-A" },
                                ]}
                                ordem={ordem}
                                onSort={ordenarPor}
                            />
                            <SortHead
                                label="Carga horária"
                                campo="cargaHoraria"
                                opcoes={[
                                    { valor: "asc", label: "Menor para maior" },
                                    { valor: "desc", label: "Maior para menor" },
                                ]}
                                ordem={ordem}
                                onSort={ordenarPor}
                            />
                            <FilterHead
                                label="Tipo"
                                opcoes={OPCOES_TIPO}
                                valorSelecionado={filtroTipo}
                                onSelect={(v) => aplicarFiltro(setFiltroTipo, v)}
                            />
                            <FilterHead
                                label="Período"
                                opcoes={OPCOES_PERIODO}
                                valorSelecionado={filtroPeriodo}
                                onSelect={(v) => aplicarFiltro(setFiltroPeriodo, v)}
                            />
                            <FilterHead
                                label="Modalidade"
                                opcoes={OPCOES_MODALIDADE}
                                valorSelecionado={filtroModalidade}
                                onSelect={(v) => aplicarFiltro(setFiltroModalidade, v)}
                            />
                            <SortHead
                                label="Código"
                                campo="codigo"
                                opcoes={[
                                    { valor: "asc", label: "Menor para maior" },
                                    { valor: "desc", label: "Maior para menor" },
                                ]}
                                ordem={ordem}
                                onSort={ordenarPor}
                            />
                            <FilterHead
                                label="Cor"
                                opcoes={OPCOES_COR}
                                valorSelecionado={filtroCor}
                                onSelect={(v) => aplicarFiltro(setFiltroCor, v)}
                            />
                            <FilterHead
                                label="Curso vinculado"
                                opcoes={OPCOES_CURSO}
                                valorSelecionado={filtroCurso}
                                onSelect={(v) => aplicarFiltro(setFiltroCurso, v)}
                            />
                            <FilterHead
                                label="Tipo de sala"
                                opcoes={OPCOES_TIPO_SALA}
                                valorSelecionado={filtroTipoSala}
                                onSelect={(v) => aplicarFiltro(setFiltroTipoSala, v)}
                            />
                            <FilterHead
                                label="Status"
                                opcoes={OPCOES_STATUS}
                                valorSelecionado={filtroStatus}
                                onSelect={(v) => aplicarFiltro(setFiltroStatus, v)}
                            />
                            <TableHead className="h-11 px-4 text-right text-sm font-semibold text-white whitespace-nowrap">
                                Ações
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {disciplinasPagina.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                                    Nenhuma disciplina encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                        {disciplinasPagina.map((disciplina, index) => (
                            <TableRow
                                key={disciplina.id}
                                className={
                                    index % 2 === 1 ? "border-none bg-[#f4f8f9]" : "border-none bg-white"
                                }
                            >
                                <TableCell className="px-4 py-3 text-sm text-foreground">
                                    {disciplina.nome}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                    {disciplina.cargaHoraria}h
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                    {disciplina.tipo}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                    {disciplina.periodo}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                    {disciplina.modalidade}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                    {disciplina.codigo}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <span
                                        className="inline-block size-4 rounded-full"
                                        style={{ backgroundColor: disciplina.cor }}
                                    />
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-foreground">
                                    {disciplina.cursoVinculado}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                    {disciplina.tipoSala}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap">
                                    {disciplina.status === "Ativo" ? (
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
                                        <button
                                            type="button"
                                            aria-label="Editar disciplina"
                                            onClick={() => abrirEditar(disciplina)}
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
                        {[8, 12, 20, 50].map((n) => (
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
            <DisciplinaFormDialog
                open={cadastrarAberto}
                onOpenChange={setCadastrarAberto}
                mode="cadastrar"
                onConfirm={confirmarCadastro}
            />

            <DisciplinaFormDialog
                open={editarAberto}
                onOpenChange={(v) => {
                    setEditarAberto(v);
                    if (!v) setDisciplinaSelecionada(null);
                }}
                mode="editar"
                disciplina={disciplinaSelecionada}
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