"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilterHead } from "@/components/ui/table-filter-head";
import { TableSortHead } from "@/components/ui/table-sort-head";
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

type CampoOrdenavel = "nome" | "cargaHoraria" | "codigo";

export function DisciplinasListagem() {
    const [disciplinas, setDisciplinas] = React.useState<Disciplina[] | null>(null);

    React.useEffect(() => {
        const salvas = carregarDisciplinasSalvas();
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

    const [fTipo, setFTipo] = React.useState("");
    const [fPeriodo, setFPeriodo] = React.useState("");
    const [fModalidade, setFModalidade] = React.useState("");
    const [fCor, setFCor] = React.useState("");
    const [fCurso, setFCurso] = React.useState("");
    const [fTipoSala, setFTipoSala] = React.useState("");
    const [fStatus, setFStatus] = React.useState("");

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

    function filtrar(setter: (v: string) => void) {
        return (valor: string) => {
            setter(valor);
            setPaginaAtual(1);
        };
    }

    function ordenar(campo: CampoOrdenavel) {
        return (direcao: "asc" | "desc") => {
            setOrdem({ campo, direcao });
            setPaginaAtual(1);
        };
    }

    const temFiltro =
        !!busca || !!fTipo || !!fPeriodo || !!fModalidade || !!fCor || !!fCurso ||
        !!fTipoSala || !!fStatus || ordem.campo !== null;

    function limparTudo() {
        setBusca("");
        setFTipo("");
        setFPeriodo("");
        setFModalidade("");
        setFCor("");
        setFCurso("");
        setFTipoSala("");
        setFStatus("");
        setOrdem({ campo: null, direcao: "asc" });
        setPaginaAtual(1);
    }

    const filtradas = React.useMemo(() => {
        if (disciplinas === null) return [];
        const b = busca.trim().toLowerCase();

        let resultado = disciplinas.filter((d) => {
            const buscaOk =
                !b ||
                d.nome.toLowerCase().includes(b) ||
                d.cursoVinculado.toLowerCase().includes(b) ||
                String(d.codigo).includes(b);

            return (
                buscaOk &&
                (!fTipo || d.tipo === fTipo) &&
                (!fPeriodo || d.periodo === fPeriodo) &&
                (!fModalidade || d.modalidade === fModalidade) &&
                (!fCor || d.cor === fCor) &&
                (!fCurso || d.cursoVinculado === fCurso) &&
                (!fTipoSala || d.tipoSala === fTipoSala) &&
                (!fStatus || d.status === fStatus)
            );
        });

        if (ordem.campo) {
            const campo = ordem.campo;
            resultado = [...resultado].sort((a, b2) => {
                const va = a[campo];
                const vb = b2[campo];
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
        fTipo,
        fPeriodo,
        fModalidade,
        fCor,
        fCurso,
        fTipoSala,
        fStatus,
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

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma disciplina encontrada.
                </div>
            ) : (
                /* min-w-0 é o que permite este filho de flex encolher e ativar o scroll */
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={pagina}
                        getRowKey={(d) => d.id}
                        columns={[
                            {
                                key: "nome",
                                label: (
                                    <TableSortHead
                                        label="Nome"
                                        labels={["A-Z", "Z-A"]}
                                        direcao={ordem.campo === "nome" ? ordem.direcao : null}
                                        onSort={ordenar("nome")}
                                    />
                                ),
                            },
                            {
                                key: "cargaHoraria",
                                label: (
                                    <TableSortHead
                                        label="Carga horária"
                                        labels={["Menor para maior", "Maior para menor"]}
                                        direcao={
                                            ordem.campo === "cargaHoraria" ? ordem.direcao : null
                                        }
                                        onSort={ordenar("cargaHoraria")}
                                    />
                                ),
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
                                        options={[
                                            { label: "Manhã", value: "Manhã" },
                                            { label: "Tarde", value: "Tarde" },
                                            { label: "Noite", value: "Noite" },
                                        ]}
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
                                label: (
                                    <TableSortHead
                                        label="Código"
                                        labels={["Menor para maior", "Maior para menor"]}
                                        direcao={ordem.campo === "codigo" ? ordem.direcao : null}
                                        onSort={ordenar("codigo")}
                                    />
                                ),
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
                                        options={CURSOS_DISPONIVEIS.map((c) => ({
                                            label: c,
                                            value: c,
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
                                        options={[
                                            { label: "Laboratório", value: "Laboratório" },
                                            { label: "Sala", value: "Sala" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                key: "status",
                                label: (
                                    <TableFilterHead
                                        label="Status"
                                        value={fStatus}
                                        onChange={filtrar(setFStatus)}
                                        options={[
                                            { label: "Ativo", value: "Ativo" },
                                            { label: "Inativo", value: "Inativo" },
                                        ]}
                                    />
                                ),
                                render: (d) =>
                                    d.status === "Ativo" ? (
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
                                label: "Editar",
                                icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                                onClick: (d) => {
                                    setSelecionada(d);
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