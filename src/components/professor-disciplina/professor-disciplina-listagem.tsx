"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { ProfessorDisciplinaFormModal } from "@/components/professor-disciplina/professor-disciplina-form-modal";
import {
    ProfessorDisciplinaExclusaoModal,
    type VinculoComNomes,
} from "@/components/professor-disciplina/professor-disciplina-exclusao-modal";

import {
    disciplinasService,
    professoresDisciplinasService,
    professoresService,
} from "@/services";
import type {
    ListProfessorDisciplinaParams,
    DisciplinaResponse,
    ProfessorDisciplinaResponse,
    ProfessorResponse,
} from "@/types/api";
import { useRemotePage } from "@/hooks/use-remote-page";

const TAMANHO_OPCOES = 1000;

type Feedback = { tipo: "success" | "error"; mensagem: string };

export function ProfessorDisciplinaListagem() {
    const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
    const [disciplinas, setDisciplinas] = React.useState<DisciplinaResponse[]>([]);
    const [refreshKey, setRefreshKey] = React.useState(0);

    const [busca, setBusca] = React.useState("");
    const [filtroProfessor, setFiltroProfessor] = React.useState("");
    const [filtroDisciplina, setFiltroDisciplina] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [vincularAberto, setVincularAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<VinculoComNomes | null>(null);
    const [feedback, setFeedback] = React.useState<Feedback | null>(null);
    const [erroCarga, setErroCarga] = React.useState(false);

    React.useEffect(() => {
        async function carregar() {
            try {
                const [profs, discs] = await Promise.all([
                    professoresService.listar({ size: TAMANHO_OPCOES }),
                    disciplinasService.listar({ size: TAMANHO_OPCOES }),
                ]);
                setProfessores(profs.content);
                setDisciplinas(discs.content);
            } catch {
                setErroCarga(true);
                setFeedback({ tipo: "error", mensagem: "Não foi possível carregar os filtros de professor e disciplina." });
            }
        }
        carregar();
    }, []);

    const carregarPagina = React.useCallback((params: ListProfessorDisciplinaParams & { page: number; size: number }) =>
        professoresDisciplinasService.listar(params), []);
    const filtrosApi: ListProfessorDisciplinaParams = {
        busca: busca.trim(),
        professor_nome: filtroProfessor.trim(),
        disciplina_nome: filtroDisciplina.trim(),
    };
    const { content: vinculos, totalElements, loading, error: erroVinculos } = useRemotePage(
        carregarPagina, filtrosApi, paginaAtual, itensPorPagina, refreshKey,
    );

    React.useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 1800);
        return () => clearTimeout(timer);
    }, [feedback]);

    // A API devolve apenas os ids; os nomes vêm das listas de professores e disciplinas.
    const vinculosComNomes = React.useMemo<VinculoComNomes[]>(() => {
        const professoresPorId = new Map(professores.map((p) => [p.id, p.nome]));
        const disciplinasPorId = new Map(disciplinas.map((d) => [d.id, d.nome]));

        return vinculos.map((v) => ({
            ...v,
            professorNome: v.professor?.nome ?? professoresPorId.get(v.professorId) ?? `Professor #${v.professorId}`,
            disciplinaNome: v.disciplina?.nome ?? disciplinasPorId.get(v.disciplinaId) ?? `Disciplina #${v.disciplinaId}`,
        }));
    }, [vinculos, professores, disciplinas]);

    const pagina = vinculosComNomes;

    async function confirmarVinculo(dados: { professorId: number; disciplinaId: number }) {
        try {
            await professoresDisciplinasService.criar({
                professor: { id: dados.professorId },
                disciplina: { id: dados.disciplinaId },
            });
            setRefreshKey((key) => key + 1);
            setFeedback({ tipo: "success", mensagem: "Professor Vinculado à Disciplina com sucesso!" });
        } catch {
            setFeedback({ tipo: "error", mensagem: "Não foi possível vincular o professor!" });
        }
        setVincularAberto(false);
    }

    async function confirmarExclusao() {
        if (!selecionado) return;
        try {
            await professoresDisciplinasService.deletar(selecionado.id);
            setRefreshKey((key) => key + 1);
            setFeedback({ tipo: "success", mensagem: "Vínculo excluído com sucesso!" });
        } catch {
            setFeedback({ tipo: "error", mensagem: "Não foi possível excluir o vínculo!" });
        }
        setSelecionado(null);
    }

    if (loading && pagina.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando vínculos...</span>
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
                        <h1 className="text-3xl font-bold text-[#17264D]">
                            Vínculo de Professores às Disciplinas
                        </h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie os Professores vinculados às Disciplinas que podem lecionar
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-64">
                        <SearchInput
                            placeholder="Search..."
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
                        onClick={() => setVincularAberto(true)}
                    >
                        <Plus className="size-5" />
                        Vincular
                    </Button>
                </div>
            </div>

            <TableFilters
                fields={[
                    {
                        name: "professor",
                        label: "Professor",
                        type: "input",
                        placeholder: "Filtrar por Professor",
                        width: "w-[240px]",
                    },
                    {
                        name: "disciplina",
                        label: "Disciplina",
                        type: "input",
                        placeholder: "Filtrar por Disciplina",
                        width: "w-[240px]",
                    },
                ]}
                onChange={(f) => {
                    setFiltroProfessor(f.professor ?? "");
                    setFiltroDisciplina(f.disciplina ?? "");
                    setPaginaAtual(1);
                }}
            />

            {erroVinculos ? (
                <div role="alert" className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{erroVinculos}</div>
            ) : loading ? (
                <div className="py-10 text-center text-sm text-[#17264D]/70">Carregando vínculos...</div>
            ) : pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    {erroCarga
                        ? "Não foi possível carregar os vínculos. Verifique se a API está disponível e recarregue a página."
                        : "Nenhum vínculo encontrado."}
                </div>
            ) : (
                <DataTable
                    data={pagina}
                    getRowKey={(v) => v.id}
                    columns={[
                        {
                            key: "professor",
                            label: "Professor",
                            render: (v) => v.professorNome,
                        },
                        {
                            key: "disciplina",
                            label: "Disciplina",
                            render: (v) => v.disciplinaNome,
                        },
                    ]}
                    actions={[
                        {
                            label: "Excluir",
                            icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                            className: "text-[#FF0000] hover:bg-red-50",
                            onClick: (v) => setSelecionado(v),
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

            <ProfessorDisciplinaFormModal
                open={vincularAberto}
                onClose={() => setVincularAberto(false)}
                professores={professores}
                disciplinas={disciplinas}
                onConfirm={confirmarVinculo}
            />

            <ProfessorDisciplinaExclusaoModal
                open={selecionado !== null}
                onClose={() => setSelecionado(null)}
                vinculo={selecionado}
                onConfirm={confirmarExclusao}
            />

            <Modal
                open={feedback !== null}
                onClose={() => setFeedback(null)}
                type={feedback?.tipo}
                message={feedback?.mensagem ?? ""}
            />
        </div>
    );
}
