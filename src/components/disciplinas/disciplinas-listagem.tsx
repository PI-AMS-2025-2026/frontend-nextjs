"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilterHead } from "@/components/ui/table-filter-head";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { DisciplinaFormModal } from "@/components/disciplinas/disciplina-form-modal";
import { disciplinasService } from "@/services/disciplinas.service";
import { cursosService } from "@/services/cursos.service";
import { tiposSalaService } from "@/services/tipos-sala.service";
import { useRemotePage } from "@/hooks/use-remote-page";
import type { DisciplinaResponse, CursoResponse, TipoSalaResponse, ListDisciplinaParams, DisciplinaRequest } from "@/types/api";

import {
    CORES_DISCIPLINA,
    type Disciplina,
    type Modalidade,
    type Periodo,
    type TipoDisciplina,
    type TipoSala,
} from "@/lib/disciplinas";

type DadosDisciplina = {
    nome: string;
    cargaHoraria: number;
    tipo: TipoDisciplina;
    periodo: Periodo;
    modalidade: Modalidade;
    codigo: string;
    cor: string;
    cursoVinculado: string;
    tipoSala: string;
};

export function DisciplinasListagem() {
    const [cursosApi, setCursosApi] = React.useState<CursoResponse[]>([]);
    const [tiposSalaApi, setTiposSalaApi] = React.useState<TipoSalaResponse[]>([]);
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [erro, setErro] = React.useState<string | null>(null);

    React.useEffect(() => {
        let ativo = true;
        void Promise.all([
            cursosService.listar({ page: 0, size: 1000 }),
            tiposSalaService.listar(),
        ]).then(([cursos, tipos]) => {
            if (!ativo) return;
            setCursosApi(cursos.content);
            setTiposSalaApi(tipos);
        }).catch((cause: unknown) => {
            if (ativo) setErro(cause instanceof Error ? cause.message : "Não foi possível carregar as opções de curso e sala.");
        });
        return () => { ativo = false; };
    }, []);

    const [busca, setBusca] = React.useState("");

    const [fTipo, setFTipo] = React.useState("");
    const [fPeriodo, setFPeriodo] = React.useState("");
    const [fModalidade, setFModalidade] = React.useState("");
    const [fCor, setFCor] = React.useState("");
    const [fCurso, setFCurso] = React.useState("");
    const [fTipoSala, setFTipoSala] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const carregarPagina = React.useCallback((params: ListDisciplinaParams & { page: number; size: number }) => disciplinasService.listar(params), []);
    const filtrosApi: ListDisciplinaParams = {
        busca: busca.trim(),
        tipo_disciplina: fTipo || undefined,
        periodo: fPeriodo ? Number(fPeriodo) : undefined,
        modalidade: fModalidade || undefined,
        cor: fCor || undefined,
        curso: fCurso ? Number(fCurso) : undefined,
        tipo_sala: fTipoSala ? Number(fTipoSala) : undefined,
    };
    const { content: disciplinasApi, totalElements, loading, error: erroCarga } = useRemotePage(
        carregarPagina, filtrosApi, paginaAtual, itensPorPagina, refreshKey,
    );
    const disciplinas: Disciplina[] = disciplinasApi.map((d: DisciplinaResponse) => ({
        id: String(d.id), nome: d.nome, cargaHoraria: d.cargaHoraria,
        tipo: d.tipoDisciplina as TipoDisciplina, periodo: String(d.periodo),
        modalidade: d.modalidade as Modalidade, codigo: d.codDisciplina,
        cor: d.cor ?? "#0099AA", cursoVinculado: d.curso.nome,
        tipoSala: d.tipoSala.nome as TipoSala,
    }));
    const pagina = disciplinas;

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<Disciplina | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    function filtrar(setter: (v: string) => void) {
        return (valor: string) => {
            setter(valor);
            setPaginaAtual(1);
        };
    }

    const temFiltro =
        !!busca || !!fTipo || !!fPeriodo || !!fModalidade || !!fCor || !!fCurso || !!fTipoSala;

    function limparTudo() {
        setBusca("");
        setFTipo("");
        setFPeriodo("");
        setFModalidade("");
        setFCor("");
        setFCurso("");
        setFTipoSala("");
        setPaginaAtual(1);
    }

    function requestDisciplina(dados: DadosDisciplina): DisciplinaRequest {
        const curso = cursosApi.find((item) => item.nome === dados.cursoVinculado);
        const tipoSala = tiposSalaApi.find((item) => item.nome === dados.tipoSala);
        if (!curso || !tipoSala) throw new Error("Selecione um curso e um tipo de sala válidos.");
        return {
            nome: dados.nome, cargaHoraria: dados.cargaHoraria,
            tipoDisciplina: dados.tipo, periodo: Number(dados.periodo),
            modalidade: dados.modalidade, codDisciplina: dados.codigo,
            cor: dados.cor, curso: { id: curso.id }, tipoSala: { id: tipoSala.id },
        };
    }

    async function confirmarCadastro(dados: DadosDisciplina) {
        try {
            setErro(null);
            await disciplinasService.criar(requestDisciplina(dados));
            setPaginaAtual(1); setRefreshKey((key) => key + 1);
            setCadastrarAberto(false); setSucesso("Disciplina criada com sucesso!");
        } catch (cause) { setErro(cause instanceof Error ? cause.message : "Não foi possível cadastrar a disciplina."); }
    }

    async function confirmarEdicao(dados: DadosDisciplina) {
        if (!selecionada) return;
        try {
            setErro(null);
            await disciplinasService.atualizar(Number(selecionada.id), requestDisciplina(dados));
            setRefreshKey((key) => key + 1);
            setEditarAberto(false); setSelecionada(null); setSucesso("Disciplina editada com sucesso!");
        } catch (cause) { setErro(cause instanceof Error ? cause.message : "Não foi possível editar a disciplina."); }
    }

    async function excluirDisciplina(disciplina: Disciplina) {
        if (!window.confirm(`Deseja deletar a disciplina "${disciplina.nome}"?`)) return;
        try {
            setErro(null);
            await disciplinasService.deletar(Number(disciplina.id));
            setPaginaAtual(1); setRefreshKey((key) => key + 1);
            setSucesso("Disciplina deletada com sucesso!");
        } catch (cause) { setErro(cause instanceof Error ? cause.message : "Não foi possível deletar a disciplina."); }
    }

    return (
        <div className="mx-auto flex w-full max-w-[1300px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
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
                        <h1 className="text-3xl font-bold text-[#17264D]">Disciplinas</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie as disciplinas da instituição
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {temFiltro && (
                        <button
                            type="button"
                            onClick={limparTudo}
                            className="text-sm font-medium whitespace-nowrap text-[#0099AA] underline underline-offset-2 hover:text-[#17264D]"
                        >
                            Limpar filtros
                        </button>
                    )}

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

            {/* sem ternário: a tabela é sempre renderizada, então o cabeçalho
                permanece visível e o aviso de vazio aparece como linha dentro dela.
                min-w-0 é o que permite este filho de flex encolher e ativar o scroll */}
            <div className="min-w-0 overflow-x-auto pb-2">
                <DataTable
                    data={pagina}
                    getRowKey={(d) => d.id}
                    emptyMessage="Nenhuma disciplina encontrada."
                    columns={[
                        {
                            key: "nome",
                            label: ("Nome"),
                        },
                        {
                            key: "cargaHoraria",
                            label: ("Carga Horária"),
                            render: (d) => `${d.cargaHoraria}h`,
                        },
                        {
                            key: "tipo",
                            label: (
                                <TableFilterHead
                                    label="Tipo"
                                    value={fTipo}
                                    onChange={filtrar(setFTipo)}
                                    options={[
                                        { label: "Teórica", value: "Teórica" },
                                        { label: "Prática", value: "Prática" },
                                        { label: "50/50", value: "50/50" },
                                    ]}
                                />
                            ),
                        },
                        {
                            key: "periodo",
                            label: (
                                <TableFilterHead
                                    label="Período"
                                    value={fPeriodo}
                                    onChange={filtrar(setFPeriodo)}
                                    options={Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}º período`, value: String(index + 1) }))}
                                />
                            ),
                        },
                        {
                            key: "modalidade",
                            label: (
                                <TableFilterHead
                                    label="Modalidade"
                                    allLabel="Todas"
                                    value={fModalidade}
                                    onChange={filtrar(setFModalidade)}
                                    options={[
                                        { label: "Presencial", value: "Presencial" },
                                        { label: "EAD", value: "EAD" },
                                    ]}
                                />
                            ),
                        },
                        {
                            key: "codigo",
                            label: ("Código")
                        },
                        {
                            key: "cor",
                            label: (
                                <TableFilterHead
                                    label="Cor"
                                    allLabel="Todas"
                                    value={fCor}
                                    onChange={filtrar(setFCor)}
                                    options={CORES_DISCIPLINA.map((c) => ({
                                        label: c.nome,
                                        value: c.hex,
                                        cor: c.hex,
                                    }))}
                                />
                            ),
                            render: (d) => (
                                <span
                                    className="inline-block size-4 rounded-full"
                                    style={{ backgroundColor: d.cor }}
                                />
                            ),
                        },
                        {
                            key: "cursoVinculado",
                            label: (
                                <TableFilterHead
                                    label="Curso vinculado"
                                    value={fCurso}
                                    onChange={filtrar(setFCurso)}
                                    options={cursosApi.map((curso) => ({
                                        label: curso.nome,
                                        value: String(curso.id),
                                    }))}
                                />
                            ),
                        },
                        {
                            key: "tipoSala",
                            label: (
                                <TableFilterHead
                                    label="Tipo de sala"
                                    value={fTipoSala}
                                    onChange={filtrar(setFTipoSala)}
                                    options={tiposSalaApi.map((tipo) => ({ label: tipo.nome, value: String(tipo.id) }))}
                                />
                            ),
                        },
                    ]}
                    actions={[
                        {
                            label: "Editar",
                            icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                            onClick: (d) => {
                                setSelecionada(d);
                                setEditarAberto(true);
                            },
                        },
                        {
                            label: "Deletar",
                            icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                            className: "text-[#BA1A1A] hover:bg-[#BA1A1A]/10",
                            onClick: (d) => void excluirDisciplina(d),
                        },
                    ]}
                />
            </div>

            {(erro || erroCarga) && <div role="alert" className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{erro ?? erroCarga}</div>}
            {loading && <div className="flex items-center justify-center py-8"><Loader2 className="size-6 animate-spin text-[#0099AA]" /></div>}

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

            <DisciplinaFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                cursos={cursosApi.map((c) => c.nome)}
                tiposSala={tiposSalaApi.map((t) => t.nome)}
                onConfirm={confirmarCadastro}
            />

            <DisciplinaFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionada(null);
                }}
                mode="editar"
                disciplina={selecionada}
                cursos={cursosApi.map((c) => c.nome)}
                tiposSala={tiposSalaApi.map((t) => t.nome)}
                onConfirm={confirmarEdicao}
            />

            <Modal
                open={sucesso !== null}
                onClose={() => setSucesso(null)}
                type="success"
                message={sucesso ?? ""}
            />
            <Modal
                open={erro !== null}
                onClose={() => setErro(null)}
                type="error"
                message={erro ?? ""}
            />
        </div>
    );
}
