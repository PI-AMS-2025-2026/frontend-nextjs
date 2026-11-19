"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { DisciplinaFormModal, type DadosDisciplina, type DisciplinaComVinculos } from "@/components/disciplinas/disciplina-form-modal";

import {
    CORES_DISCIPLINA,
    type Modalidade,
    type TipoDisciplina,
} from "@/lib/disciplinas";
import { ApiError } from "@/lib/api";
import { disciplinasService } from "@/services/disciplinas.service";
import { cursosService } from "@/services/cursos.service";
import { tiposSalaService } from "@/services/tipos-sala.service";
import type { CursoResponse, DisciplinaRequest, DisciplinaResponse, TipoSalaResponse } from "@/types/api";

function mensagemErro(error: unknown, padrao: string) {
    if (error instanceof ApiError) {
        if (error.status === 401) return "Sessão expirada. Faça login novamente.";
        if (error.status === 403) return "Você não tem permissão para essa ação.";
        return error.message || padrao;
    }
    return error instanceof Error && error.message ? error.message : padrao;
}

function paraTipo(tipo: string): TipoDisciplina {
    const normalizado = tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (normalizado === "pratica") return "Prática";
    if (normalizado === "teorica") return "Teórica";
    return "50/50";
}

function paraDisciplina(disciplina: DisciplinaResponse): DisciplinaComVinculos {
    const modalidade = disciplina.modalidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return {
        id: String(disciplina.id),
        nome: disciplina.nome,
        cargaHoraria: disciplina.cargaHoraria,
        tipo: paraTipo(disciplina.tipoDisciplina),
        periodo: disciplina.periodo,
        modalidade: modalidade === "Hibrida" ? "Híbrida" : modalidade as Modalidade,
        codigo: disciplina.codDisciplina,
        cor: disciplina.cor ?? CORES_DISCIPLINA[0].hex,
        cursoVinculado: disciplina.curso.nome,
        tipoSala: disciplina.tipoSala.nome,
        cursoId: disciplina.curso.id,
        tipoSalaId: disciplina.tipoSala.id,
    };
}

function paraRequest(dados: DadosDisciplina): DisciplinaRequest {
    return {
        nome: dados.nome,
        cargaHoraria: dados.cargaHoraria,
        tipoDisciplina: dados.tipo,
        periodo: dados.periodo,
        modalidade: dados.modalidade === "Híbrida" ? "Hibrida" : dados.modalidade,
        codDisciplina: dados.codigo.trim(),
        cor: dados.cor,
        curso: { id: dados.cursoId },
        tipoSala: { id: dados.tipoSalaId },
    };
}

export function DisciplinasListagem() {
    const [disciplinas, setDisciplinas] = React.useState<DisciplinaComVinculos[] | null>(null);
    const [cursos, setCursos] = React.useState<CursoResponse[]>([]);
    const [tiposSala, setTiposSala] = React.useState<TipoSalaResponse[]>([]);
    const [erroCarga, setErroCarga] = React.useState("");
    const [tentativa, setTentativa] = React.useState(0);

    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroTipo, setFiltroTipo] = React.useState("");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("");
    const [filtroModalidade, setFiltroModalidade] = React.useState("");
    const [filtroCor, setFiltroCor] = React.useState("");
    const [filtroCurso, setFiltroCurso] = React.useState("");
    const [filtroTipoSala, setFiltroTipoSala] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<DisciplinaComVinculos | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    React.useEffect(() => {
        let vivo = true;
        void Promise.all([
            disciplinasService.listarTodos(),
            cursosService.listarTodos(),
            tiposSalaService.listar(),
        ]).then(([disciplinasCarregadas, cursosCarregados, tiposCarregados]) => {
            if (!vivo) return;
            setDisciplinas(disciplinasCarregadas.map(paraDisciplina));
            setCursos(cursosCarregados);
            setTiposSala(tiposCarregados);
            setErroCarga("");
        }).catch((error: unknown) => {
            if (!vivo) return;
            setErroCarga(mensagemErro(error, "Não foi possível carregar as disciplinas."));
            setDisciplinas([]);
        });
        return () => {
            vivo = false;
        };
    }, [tentativa]);

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
                (!filtroPeriodo || String(d.periodo) === filtroPeriodo) &&
                (!filtroModalidade || d.modalidade === filtroModalidade) &&
                (!filtroCor || d.cor === filtroCor) &&
                (!filtroCurso || d.cursoVinculado === filtroCurso) &&
                (!filtroTipoSala || d.tipoSala === filtroTipoSala)
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
    ]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    async function confirmarCadastro(dados: DadosDisciplina) {
        const salvo = await disciplinasService.criar(paraRequest(dados));
        setDisciplinas((prev) => [...(prev ?? []), paraDisciplina(salvo)]);
        setCadastrarAberto(false);
        setSucesso("Disciplina criada com sucesso!");
    }

    async function confirmarEdicao(dados: DadosDisciplina) {
        if (!selecionada) return;
        const salvo = await disciplinasService.atualizar(
            Number(selecionada.id),
            paraRequest(dados),
        );
        setDisciplinas((prev) => (prev ?? []).map((d) =>
            d.id === selecionada.id ? paraDisciplina(salvo) : d,
        ));
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

    if (erroCarga) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24" role="alert">
                <span className="text-sm text-[#BA1A1A]">{erroCarga}</span>
                <Button onClick={() => {
                    setDisciplinas(null);
                    setTentativa((atual) => atual + 1);
                }}>
                    Tentar novamente
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1280px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/administrador/home"
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
                        options: Array.from({ length: 12 }, (_, index) => ({ label: String(index + 1), value: String(index + 1) })),
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
                            { label: "Híbrida", value: "Híbrida" },
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
                        options: cursos.map((c) => ({ label: c.nome, value: c.nome })),
                    },
                    {
                        name: "tipoSala",
                        label: "Tipo de sala",
                        type: "select",
                        placeholder: "Todos",
                        width: "w-[115px]",
                        options: tiposSala.map((tipo) => ({ label: tipo.nome, value: tipo.nome })),
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
                cursos={cursos}
                tiposSala={tiposSala}
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
                cursos={cursos}
                tiposSala={tiposSala}
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
