"use client";

import * as React from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
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

import { HorarioFormDialog } from "@/components/horarios/horario-form-dialog";
import { ExcluirHorarioDialog } from "@/components/horarios/excluir-horario-dialog";
import { SucessoDialog } from "@/components/horarios/sucesso-dialog";

import { calcDuracao, gerarHorariosMock, carregarHorariosSalvos, salvarHorarios, type Horario } from "@/lib/horarios";

export function HorariosListagem() {
    // null = ainda não sabemos os dados reais (aguardando checar o localStorage).
    // Só sai de null depois que já lemos o storage, pra nunca mostrar os 24 mocks
    // "piscando" antes do valor salvo de verdade aparecer.
    const [horarios, setHorarios] = React.useState<Horario[] | null>(null);

    React.useEffect(() => {
        const salvos = carregarHorariosSalvos();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHorarios(salvos ?? gerarHorariosMock());
    }, []);

    // Sempre que a lista mudar (cadastro/edição/exclusão), persiste no localStorage.
    React.useEffect(() => {
        if (horarios === null) return;
        salvarHorarios(horarios);
    }, [horarios]);

    // busca e filtros
    const [busca, setBusca] = React.useState("");
    const [filtroInicio, setFiltroInicio] = React.useState("");
    const [filtroFim, setFiltroFim] = React.useState("");

    // paginação
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    // modais
    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [excluirAberto, setExcluirAberto] = React.useState(false);
    const [horarioSelecionado, setHorarioSelecionado] =
        React.useState<Horario | null>(null);
    const [sucessoAberto, setSucessoAberto] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");

    const horariosFiltrados = React.useMemo(() => {
        if (horarios === null) return [];
        return horarios.filter((h) => {
            const buscaOk =
                !busca ||
                h.inicio.includes(busca) ||
                h.fim.includes(busca);
            const inicioOk = !filtroInicio || h.inicio >= filtroInicio;
            const fimOk = !filtroFim || h.fim <= filtroFim;
            return buscaOk && inicioOk && fimOk;
        });
    }, [horarios, busca, filtroInicio, filtroFim]);

    const totalRegistros = horariosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);

    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const horariosPagina = horariosFiltrados.slice(
        inicioIndice,
        inicioIndice + itensPorPagina
    );

    function irParaPagina(pagina: number) {
        setPaginaAtual(Math.min(Math.max(1, pagina), totalPaginas));
    }

    function limparFiltros() {
        setFiltroInicio("");
        setFiltroFim("");
        setBusca("");
        setPaginaAtual(1);
    }

    function abrirEditar(horario: Horario) {
        setHorarioSelecionado(horario);
        setEditarAberto(true);
    }

    function abrirExcluir(horario: Horario) {
        setHorarioSelecionado(horario);
        setExcluirAberto(true);
    }

    function confirmarCadastro(dados: { inicio: string; fim: string }) {
        const novo: Horario = {
            id: crypto.randomUUID(),
            inicio: dados.inicio,
            fim: dados.fim,
        };
        setHorarios((prev) => [...(prev ?? []), novo]);
        setCadastrarAberto(false);
        setMensagemSucesso("Horário cadastrado com sucesso!");
        setSucessoAberto(true);
    }

    function confirmarEdicao(dados: { inicio: string; fim: string }) {
        if (!horarioSelecionado) return;
        setHorarios((prev) =>
            (prev ?? []).map((h) =>
                h.id === horarioSelecionado.id
                    ? { ...h, inicio: dados.inicio, fim: dados.fim }
                    : h
            )
        );
        setEditarAberto(false);
        setHorarioSelecionado(null);
        setMensagemSucesso("Horário editado com sucesso!");
        setSucessoAberto(true);
    }

    function confirmarExclusao() {
        if (!horarioSelecionado) return;
        setHorarios((prev) =>
            (prev ?? []).filter((h) => h.id !== horarioSelecionado.id)
        );
        setExcluirAberto(false);
        setHorarioSelecionado(null);
        setMensagemSucesso("Horário excluído com sucesso!");
        setSucessoAberto(true);
    }

    // Enquanto não sabemos os dados reais (checando o localStorage), mostra um
    // loading simples no lugar da tabela em vez de "piscar" o mock e depois trocar.
    if (horarios === null) {
        return (
            <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
                <Loader2 className="size-6 animate-spin text-[#2fa4b5]" />
                <span className="text-sm text-muted-foreground">Carregando horários...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 px-6 py-8">
            {/* Cabeçalho da página */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    Listagem de horários
                </h1>

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
                        <Label htmlFor="filtro-inicio" className="text-foreground/80">
                            Horário Início
                        </Label>
                        <Input
                            id="filtro-inicio"
                            type="time"
                            value={filtroInicio}
                            onChange={(e) => {
                                setFiltroInicio(e.target.value);
                                setPaginaAtual(1);
                            }}
                            className="w-36 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="filtro-fim" className="text-foreground/80">
                            Horário Fim
                        </Label>
                        <Input
                            id="filtro-fim"
                            type="time"
                            value={filtroFim}
                            onChange={(e) => {
                                setFiltroFim(e.target.value);
                                setPaginaAtual(1);
                            }}
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

            {/* Tabela */}
            <div className="overflow-hidden rounded-xl border border-[#e2ecee]">
                <Table className="table-fixed">
                    <colgroup>
                        <col className="w-[22%]" />
                        <col className="w-[22%]" />
                        <col className="w-[22%]" />
                        <col className="w-[34%]" />
                    </colgroup>
                    <TableHeader>
                        <TableRow className="border-none bg-[#2f96a3] hover:bg-[#2f96a3]">
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">
                                Início
                            </TableHead>
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">
                                Fim
                            </TableHead>
                            <TableHead className="h-11 px-5 text-sm font-semibold text-white">
                                Duração
                            </TableHead>
                            <TableHead className="h-11 px-5 text-right text-sm font-semibold text-white">
                                Ações
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {horariosPagina.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-10 text-center text-sm text-muted-foreground"
                                >
                                    Nenhum horário encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                        {horariosPagina.map((horario, index) => (
                            <TableRow
                                key={horario.id}
                                className={
                                    index % 2 === 1
                                        ? "border-none bg-[#f4f8f9]"
                                        : "border-none bg-white"
                                }
                            >
                                <TableCell className="px-5 py-3 text-sm text-foreground">
                                    {horario.inicio}
                                </TableCell>
                                <TableCell className="px-5 py-3 text-sm text-foreground">
                                    {horario.fim}
                                </TableCell>
                                <TableCell className="px-5 py-3 text-sm font-medium text-foreground">
                                    {calcDuracao(horario.inicio, horario.fim)}
                                </TableCell>
                                <TableCell className="px-5 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            aria-label="Editar horário"
                                            onClick={() => abrirEditar(horario)}
                                            className="flex size-8 items-center justify-center rounded-lg border border-[#2fa4b5] text-[#2fa4b5] transition-colors hover:bg-[#2fa4b5]/10"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Excluir horário"
                                            onClick={() => abrirExcluir(horario)}
                                            className="flex size-8 items-center justify-center rounded-lg border border-destructive/50 text-destructive transition-colors hover:bg-destructive/10"
                                        >
                                            <Trash2 className="size-4" />
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
            <HorarioFormDialog
                open={cadastrarAberto}
                onOpenChange={setCadastrarAberto}
                mode="cadastrar"
                onConfirm={confirmarCadastro}
            />

            <HorarioFormDialog
                open={editarAberto}
                onOpenChange={(v) => {
                    setEditarAberto(v);
                    if (!v) setHorarioSelecionado(null);
                }}
                mode="editar"
                horario={horarioSelecionado}
                onConfirm={confirmarEdicao}
            />

            <ExcluirHorarioDialog
                open={excluirAberto}
                onOpenChange={(v) => {
                    setExcluirAberto(v);
                    if (!v) setHorarioSelecionado(null);
                }}
                onConfirm={confirmarExclusao}
            />

            <SucessoDialog
                open={sucessoAberto}
                onOpenChange={setSucessoAberto}
                mensagem={mensagemSucesso}
            />
        </div>
    );
}