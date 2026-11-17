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

import { DisciplinaFormModal } from "@/components/disciplinas/disciplina-form-modal";

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

type DadosDisciplina = {
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
};

export function DisciplinasListagem() {
    const [disciplinas, setDisciplinas] = React.useState<Disciplina[] | null>(null);

    React.useEffect(() => {
        let vivo = true;
        void Promise.resolve().then(() => {
            if (!vivo) return;
            const salvas = carregarDisciplinasSalvas();
            setDisciplinas(salvas ?? gerarDisciplinasMock());
        });
        return () => {
            vivo = false;
        };
    }, []);

    React.useEffect(() => {
        if (disciplinas === null) return;
        salvarDisciplinas(disciplinas);
    }, [disciplinas]);

    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroTipo, setFiltroTipo] = React.useState("");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("");
    const [filtroModalidade, setFiltroModalidade] = React.useState("");
    const [filtroCor, setFiltroCor] = React.useState("");
    const [filtroCurso, setFiltroCurso] = React.useState("");
    const [filtroTipoSala, setFiltroTipoSala] = React.useState("");
    const [filtroStatus, setFiltroStatus] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<Disciplina | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const filtradas = React.useMemo(() => {
        if (disciplinas === null) return [];
        const b = busca.trim().toLowerCase();
        const n = filtroNome.trim().toLowerCase();

        return disciplinas.filter((d) => {
            const buscaOk =
                !b ||
                d.nome.toLowerCase().includes(b) ||
                d.cursoVinculado.toLowerCase().includes(b) ||
                String(d.codigo).includes(b);

            const nomeOk = !n || d.nome.toLowerCase().includes(n);

            return (
                buscaOk &&
                nomeOk &&
                (!filtroTipo || d.tipo === filtroTipo) &&
                (!filtroPeriodo || d.periodo === filtroPeriodo) &&
                (!filtroModalidade || d.modalidade === filtroModalidade) &&
                (!filtroCor || d.cor === filtroCor) &&
                (!filtroCurso || d.cursoVinculado === filtroCurso) &&
                (!filtroTipoSala || d.tipoSala === filtroTipoSala) &&
                (!filtroStatus || d.status === filtroStatus)
            );
        });
    }, [
        disciplinas,
        busca,
        filtroNome,
        filtroTipo,
        filtroPeriodo,
        filtroModalidade,
        filtroCor,
        filtroCurso,
        filtroTipoSala,
        filtroStatus,
    ]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    function confirmarCadastro(dados: DadosDisciplina) {
        setDisciplinas((prev) => [...(prev ?? []), { id: crypto.randomUUID(), ...dados }]);
        setCadastrarAberto(false);
        setSucesso("Disciplina criada com sucesso!");
    }

    function confirmarEdicao(dados: DadosDisciplina) {
        if (!selecionada) return;
        setDisciplinas((prev) =>
            (prev ?? []).map((d) => (d.id === selecionada.id ? { ...d, ...dados } : d))
        );
        setEditarAberto(false);
        setSelecionada(null);
        setSucesso("Disciplina editada com sucesso!");
    }

    if (disciplinas === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando disciplinas...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1280px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
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
                        width: "w-[155px]",
                    },
                    {
                        name: "tipo",
                        label: "Tipo",
                        type: "select",
                        placeholder: "Todos",
                        width: "w-[105px]",
                        options: [
                            { label: "Teórica", value: "Teórica" },
                            { label: "Prática", value: "Prática" },
                            { label: "50/50", value: "50/50" },
                        ],
                    },
                    {
                        name: "periodo",
                        label: "Período",
                        type: "select",
                        placeholder: "Todos",
                        width: "w-[105px]",
                        options: [
                            { label: "Manhã", value: "Manhã" },
                            { label: "Tarde", value: "Tarde" },
                            { label: "Noite", value: "Noite" },
                        ],
                    },
                    {
                        name: "modalidade",
                        label: "Modalidade",
                        type: "select",
                        placeholder: "Todas",
                        width: "w-[115px]",
                        options: [
                            { label: "Presencial", value: "Presencial" },
                            { label: "EAD", value: "EAD" },
                        ],
                    },
                    {
                        name: "cor",
                        label: "Cor",
                        type: "select",
                        placeholder: "Todas",
                        width: "w-[105px]",
                        options: CORES_DISCIPLINA.map((c) => ({
                            label: c.nome,
                            value: c.hex,
                        })),
                    },
                    {
                        name: "cursoVinculado",
                        label: "Curso vinculado",
                        type: "select",
                        placeholder: "Todos",
                        width: "w-[140px]",
                        options: CURSOS_DISPONIVEIS.map((c) => ({
                            label: c,
                            value: c,
                        })),
                    },
                    {
                        name: "tipoSala",
                        label: "Tipo de sala",
                        type: "select",
                        placeholder: "Todos",
                        width: "w-[115px]",
                        options: [
                            { label: "Laboratório", value: "Laboratório" },
                            { label: "Sala", value: "Sala" },
                        ],
                    },
                    {
                        name: "status",
                        label: "Status",
                        type: "select",
                        placeholder: "Todos",
                        width: "w-[105px]",
                        options: [
                            { label: "Ativo", value: "Ativo" },
                            { label: "Inativo", value: "Inativo" },
                        ],
                    },
                ]}
                onChange={(f) => {
                    setFiltroNome(f.nome ?? "");
                    setFiltroTipo(f.tipo ?? "");
                    setFiltroPeriodo(f.periodo ?? "");
                    setFiltroModalidade(f.modalidade ?? "");
                    setFiltroCor(f.cor ?? "");
                    setFiltroCurso(f.cursoVinculado ?? "");
                    setFiltroTipoSala(f.tipoSala ?? "");
                    setFiltroStatus(f.status ?? "");
                    setPaginaAtual(1);
                }}
            />

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma disciplina encontrada.
                </div>
            ) : (
                <DataTable
                    compact
                    tableClassName="min-w-[1160px]"
                    data={pagina}
                    getRowKey={(d) => d.id}
                    columns={[
                        {
                            key: "nome",
                            label: "Nome",
                            cellClassName: "min-w-[180px]",
                        },
                        {
                            key: "cargaHoraria",
                            label: "Carga Horária",
                            headerClassName: "whitespace-nowrap",
                            cellClassName: "whitespace-nowrap",
                            render: (d) => `${d.cargaHoraria}h`,
                        },
                        {
                            key: "tipo",
                            label: "Tipo",
                            cellClassName: "whitespace-nowrap",
                        },
                        {
                            key: "periodo",
                            label: "Período",
                            cellClassName: "whitespace-nowrap",
                        },
                        {
                            key: "modalidade",
                            label: "Modalidade",
                            cellClassName: "whitespace-nowrap",
                        },
                        {
                            key: "codigo",
                            label: "Código",
                            cellClassName: "whitespace-nowrap",
                        },
                        {
                            key: "cor",
                            label: "Cor",
                            render: (d) => (
                                <span
                                    className="inline-block size-4 rounded-full"
                                    style={{ backgroundColor: d.cor }}
                                />
                            ),
                        },
                        {
                            key: "cursoVinculado",
                            label: "Curso vinculado",
                            headerClassName: "whitespace-nowrap",
                            cellClassName: "min-w-[190px]",
                        },
                        {
                            key: "tipoSala",
                            label: "Tipo de sala",
                            headerClassName: "whitespace-nowrap",
                            cellClassName: "whitespace-nowrap",
                        },
                        {
                            key: "status",
                            label: "Status",
                            cellClassName: "whitespace-nowrap",
                            render: (d) =>
                                d.status === "Ativo" ? (
                                    <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                                        <CheckCircle2 className="size-4 shrink-0" />
                                        Ativo
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 font-medium text-[#BA1A1A]">
                                        <XCircle className="size-4 shrink-0" />
                                        Inativo
                                    </span>
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

            <DisciplinaFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
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