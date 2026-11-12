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
    DisciplinaResponse,
    ProfessorDisciplinaResponse,
    ProfessorResponse,
} from "@/types/api";

const TAMANHO_MAXIMO = 1000;

type Feedback = { tipo: "success" | "error"; mensagem: string };

export function ProfessorDisciplinaListagem() {
    const [vinculos, setVinculos] = React.useState<ProfessorDisciplinaResponse[] | null>(null);
    const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
    const [disciplinas, setDisciplinas] = React.useState<DisciplinaResponse[]>([]);

    const [busca, setBusca] = React.useState("");
    const [filtroProfessor, setFiltroProfessor] = React.useState("");
    const [filtroDisciplina, setFiltroDisciplina] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [vincularAberto, setVincularAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<VinculoComNomes | null>(null);
    const [feedback, setFeedback] = React.useState<Feedback | null>(null);
    const [erroCarga, setErroCarga] = React.useState(false);

    const carregarVinculos = React.useCallback(async () => {
        const resposta = await professoresDisciplinasService.listar({ size: TAMANHO_MAXIMO });
        return resposta.content;
    }, []);

    React.useEffect(() => {
        async function carregar() {
            try {
                const [vins, profs, discs] = await Promise.all([
                    carregarVinculos(),
                    professoresService.listar({ size: TAMANHO_MAXIMO }),
                    disciplinasService.listar({ size: TAMANHO_MAXIMO }),
                ]);
                setVinculos(vins);
                setProfessores(profs.content);
                setDisciplinas(discs.content);
            } catch {
                setVinculos([]);
                setErroCarga(true);
                setFeedback({ tipo: "error", mensagem: "Não foi possível carregar os vínculos!" });
            }
        }
        carregar();
    }, [carregarVinculos]);

    React.useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 1800);
        return () => clearTimeout(timer);
    }, [feedback]);

    // A API devolve apenas os ids; os nomes vêm das listas de professores e disciplinas.
    const vinculosComNomes = React.useMemo<VinculoComNomes[]>(() => {
        if (vinculos === null) return [];
        const professoresPorId = new Map(professores.map((p) => [p.id, p.nome]));
        const disciplinasPorId = new Map(disciplinas.map((d) => [d.id, d.nome]));

        return vinculos.map((v) => ({
            ...v,
            professorNome:
                professoresPorId.get(v.professorId) ?? `Professor #${v.professorId} (não encontrado)`,
            disciplinaNome:
                disciplinasPorId.get(v.disciplinaId) ?? `Disciplina #${v.disciplinaId} (não encontrada)`,
        }));
    }, [vinculos, professores, disciplinas]);

    const filtrados = React.useMemo(() => {
        const b = busca.trim().toLowerCase();
        const p = filtroProfessor.trim().toLowerCase();
        const d = filtroDisciplina.trim().toLowerCase();

        return vinculosComNomes.filter((v) => {
            const professor = v.professorNome.toLowerCase();
            const disciplina = v.disciplinaNome.toLowerCase();
            const buscaOk = !b || professor.includes(b) || disciplina.includes(b);
            const professorOk = !p || professor.includes(p);
            const disciplinaOk = !d || disciplina.includes(d);
            return buscaOk && professorOk && disciplinaOk;
        });
    }, [vinculosComNomes, busca, filtroProfessor, filtroDisciplina]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    async function confirmarVinculo(dados: { professorId: number; disciplinaId: number }) {
        try {
            await professoresDisciplinasService.criar({
                professor: { id: dados.professorId },
                disciplina: { id: dados.disciplinaId },
            });
            setVinculos(await carregarVinculos());
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
            setVinculos(await carregarVinculos());
            setFeedback({ tipo: "success", mensagem: "Vínculo excluído com sucesso!" });
        } catch {
            setFeedback({ tipo: "error", mensagem: "Não foi possível excluir o vínculo!" });
        }
        setSelecionado(null);
    }

    if (vinculos === null) {
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

            {pagina.length === 0 ? (
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
                totalItems={filtrados.length}
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
