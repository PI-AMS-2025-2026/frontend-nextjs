"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api";
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
    DisciplinaResponse,
    ProfessorResponse,
} from "@/types/api";
import { useServerPage } from "@/hooks/use-server-page";

const TAMANHO_MAXIMO = 1000;
type Feedback = { tipo: "success" | "error"; mensagem: string };

export function ProfessorDisciplinaListagem() {
    const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
    const [disciplinas, setDisciplinas] = React.useState<DisciplinaResponse[]>([]);
    const [busca, setBusca] = React.useState("");
    const [filtroProfessor, setFiltroProfessor] = React.useState("");
    const [filtroDisciplina, setFiltroDisciplina] = React.useState("");
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const filtros = React.useMemo(() => ({
        busca: busca.trim() || undefined,
        professor_nome: filtroProfessor.trim() || undefined,
        disciplina_nome: filtroDisciplina.trim() || undefined,
    }), [busca, filtroProfessor, filtroDisciplina]);
    const { data: pageData, loading, error: erroPagina, reload } = useServerPage(
        (query) => professoresDisciplinasService.listar(query as Parameters<typeof professoresDisciplinasService.listar>[0]),
        filtros, paginaAtual, itensPorPagina,
    );
    const [vincularAberto, setVincularAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<VinculoComNomes | null>(null);
    const [feedback, setFeedback] = React.useState<Feedback | null>(null);
    const [erroCarga, setErroCarga] = React.useState(false);

    React.useEffect(() => {
        async function carregar() {
            try {
                const [profs, discs] = await Promise.all([
                    professoresService.listar({ size: TAMANHO_MAXIMO }),
                    disciplinasService.listar({ size: TAMANHO_MAXIMO }),
                ]);
                setProfessores(profs.content);
                setDisciplinas(discs.content);
            } catch (error) {
                setErroCarga(true);
                setFeedback({
                    tipo: "error",
                    mensagem:
                        error instanceof ApiError
                            ? error.message
                            : "Não foi possível carregar os vínculos.",
                });
            }
        }
        carregar();
    }, []);

    React.useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 2400);
        return () => clearTimeout(timer);
    }, [feedback]);

    const vinculosComNomes = React.useMemo<VinculoComNomes[]>(() => {
        return pageData.content.map((v) => ({
            ...v,
            professorNome: v.professor?.nome ?? `Professor #${v.professorId} (não encontrado)`,
            disciplinaNome: v.disciplina?.nome ?? `Disciplina #${v.disciplinaId} (não encontrada)`,
        }));
    }, [pageData.content]);
    const paginaSegura = Math.min(paginaAtual, Math.max(1, pageData.totalPages));

    async function confirmarVinculo(dados: { professorId: number; disciplinaId: number }) {
        try {
            await professoresDisciplinasService.criar({
                professor: { id: dados.professorId },
                disciplina: { id: dados.disciplinaId },
            });
            reload();
            setVincularAberto(false);
            setFeedback({ tipo: "success", mensagem: "Professor vinculado à disciplina com sucesso!" });
        } catch (error) {
            throw new Error(
                error instanceof ApiError
                    ? error.message
                    : "Não foi possível vincular o professor à disciplina.",
            );
        }
    }

    async function confirmarExclusao() {
        if (!selecionado) return;
        try {
            await professoresDisciplinasService.deletar(selecionado.id);
            reload();
            setFeedback({ tipo: "success", mensagem: "Vínculo excluído com sucesso!" });
        } catch (error) {
            setFeedback({
                tipo: "error",
                mensagem:
                    error instanceof ApiError
                        ? error.message
                        : "Não foi possível excluir o vínculo.",
            });
        }
        setSelecionado(null);
    }

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
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
                        <h1 className="text-3xl font-bold text-[#17264D]">
                            Vínculo de Professores às Disciplinas
                        </h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie os professores vinculados às disciplinas que podem lecionar
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
                        placeholder: "Filtrar por professor",
                        width: "w-[240px]",
                    },
                    {
                        name: "disciplina",
                        label: "Disciplina",
                        type: "input",
                        placeholder: "Filtrar por disciplina",
                        width: "w-[240px]",
                    },
                ]}
                onChange={(f) => {
                    setFiltroProfessor(f.professor ?? "");
                    setFiltroDisciplina(f.disciplina ?? "");
                    setPaginaAtual(1);
                }}
            />
            {loading && vinculosComNomes.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#17264D]/70">Carregando vínculos...</div>
            ) : vinculosComNomes.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    {erroCarga || erroPagina
                        ? "Não foi possível carregar os vínculos. Verifique se a API está disponível e recarregue a página."
                        : "Nenhum vínculo encontrado."}
                </div>
            ) : (
                <DataTable
                    data={vinculosComNomes}
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
                            className: "text-[#BA1A1A] hover:bg-red-50",
                            onClick: (v) => setSelecionado(v),
                        },
                    ]}
                />
            )}
            <Pagination
                totalItems={pageData.totalElements}
                currentPage={paginaSegura}
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
