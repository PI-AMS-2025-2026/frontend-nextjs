"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api";
import {
    DisponibilidadeProfessorFormModal,
    type DadosDisponibilidade,
} from "./disponibilidade-professor-form-modal";
import { DisponibilidadeProfessorExclusaoModal } from "./disponibilidade-professor-exclusao-modal";
import { DIAS_SEMANA, formatarHora, rotuloDia } from "./dias-semana";
import {
    blocoHorariosService,
    disponibilidadesProfessoresService,
    professoresService,
} from "@/services";
import type {
    BlocoHorarioResponse,
    DiaSemana,
    DisponibilidadeProfessorRequest,
    ProfessorResponse,
} from "@/types/api";
import { useServerPage } from "@/hooks/use-server-page";
import {
    normalizarDisponibilidades,
    type DisponibilidadeProfessor,
    type DisponibilidadeProfessorApi,
} from "./disponibilidade-professor-api";

const TAMANHO_MAXIMO = 1000;
type Feedback = { tipo: "success" | "error"; mensagem: string };

function formatarIntervalo(bloco: BlocoHorarioResponse) {
    return `${formatarHora(bloco.horaInicio)} - ${formatarHora(bloco.horaFim)}`;
}

function montarRequest(dados: DadosDisponibilidade): DisponibilidadeProfessorRequest {
    return {
        professor: { id: dados.professorId },
        diaSemana: dados.diaSemana as DiaSemana,
        blocoHorario: { id: dados.blocoHorarioId },
    };
}

async function carregarCatalogoProfessores() {
    const professores: ProfessorResponse[] = [];
    let pagina = 0;
    let totalPaginas: number;
    do {
        const resposta = await professoresService.listar({ page: pagina, size: TAMANHO_MAXIMO });
        professores.push(...resposta.content);
        totalPaginas = resposta.totalPages;
        pagina++;
    } while (pagina < totalPaginas);
    return professores;
}

export function DisponibilidadeProfessorListagem() {
    const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
    const [blocos, setBlocos] = React.useState<BlocoHorarioResponse[]>([]);
    const [busca, setBusca] = React.useState("");
    const [filtroProfessor, setFiltroProfessor] = React.useState("");
    const [filtroDia, setFiltroDia] = React.useState("");
    const [filtroHorario, setFiltroHorario] = React.useState("");
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const filtros = React.useMemo(() => ({
        busca: busca.trim() || undefined,
        professor_nome: filtroProfessor.trim() || undefined,
        dia_semana: filtroDia || undefined,
        horario: filtroHorario.trim() || undefined,
    }), [busca, filtroProfessor, filtroDia, filtroHorario]);
    const { data: pageData, loading, error: erroLista, reload } = useServerPage(
        (query) => disponibilidadesProfessoresService.listar(query as Parameters<typeof disponibilidadesProfessoresService.listar>[0]),
        filtros, paginaAtual, itensPorPagina,
    );
    const disponibilidades = normalizarDisponibilidades(pageData.content as unknown as DisponibilidadeProfessorApi[]);
    const [cadastroAberto, setCadastroAberto] = React.useState(false);
    const [editando, setEditando] = React.useState<DisponibilidadeProfessor | null>(null);
    const [excluindo, setExcluindo] = React.useState<DisponibilidadeProfessor | null>(null);
    const [feedback, setFeedback] = React.useState<Feedback | null>(null);

    React.useEffect(() => {
        async function carregar() {
            try {
                const [profs, blocosResposta] = await Promise.all([
                    carregarCatalogoProfessores(),
                    blocoHorariosService.listar({ size: TAMANHO_MAXIMO }),
                ]);
                setProfessores(profs);
                setBlocos(blocosResposta.content);
            } catch (error) {
                setFeedback({
                    tipo: "error",
                    mensagem:
                        error instanceof ApiError
                            ? error.message
                            : "Não foi possível carregar as disponibilidades.",
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


    const paginaSegura = Math.min(paginaAtual, Math.max(1, pageData.totalPages));

    async function confirmarCadastro(dados: DadosDisponibilidade) {
        try {
            await disponibilidadesProfessoresService.criar(montarRequest(dados));
            reload();
            setCadastroAberto(false);
            setFeedback({ tipo: "success", mensagem: "Disponibilidade cadastrada com sucesso!" });
        } catch (error) {
            throw new Error(
                error instanceof ApiError
                    ? error.message
                    : "Não foi possível cadastrar a disponibilidade.",
            );
        }
    }

    async function confirmarEdicao(dados: DadosDisponibilidade) {
        if (!editando) return;
        try {
            await disponibilidadesProfessoresService.atualizar(editando.id, montarRequest(dados));
            reload();
            setEditando(null);
            setFeedback({ tipo: "success", mensagem: "Disponibilidade editada com sucesso!" });
        } catch (error) {
            throw new Error(
                error instanceof ApiError
                    ? error.message
                    : "Não foi possível editar a disponibilidade.",
            );
        }
    }

    async function confirmarExclusao() {
        if (!excluindo) return;
        try {
            await disponibilidadesProfessoresService.deletar(excluindo.id);
            reload();
            setFeedback({ tipo: "success", mensagem: "Disponibilidade excluída com sucesso!" });
        } catch (error) {
            setFeedback({
                tipo: "error",
                mensagem:
                    error instanceof ApiError
                        ? error.message
                        : "Não foi possível excluir a disponibilidade.",
            });
        }
        setExcluindo(null);
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
                            Disponibilidade de Professor
                        </h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie as disponibilidades dos professores da instituição
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
                        onClick={() => setCadastroAberto(true)}
                    >
                        <Plus className="size-5" />
                        Cadastrar
                    </Button>
                </div>
            </div>
            <TableFilters
                className="flex-wrap"
                fields={[
                    {
                        name: "professor",
                        label: "Professor",
                        type: "input",
                        placeholder: "Filtrar por professor",
                        width: "w-[200px]",
                    },
                    {
                        name: "dia",
                        label: "Dia da Semana",
                        type: "select",
                        placeholder: "Todos",
                        options: DIAS_SEMANA,
                        maxVisibleOptions: 4,
                        width: "w-[200px]",
                    },
                    {
                        name: "horario",
                        label: "Bloco de Horário",
                        type: "input",
                        placeholder: "Filtrar por horário",
                        width: "w-[200px]",
                    },
                ]}
                onChange={(f) => {
                    setFiltroProfessor(f.professor ?? "");
                    setFiltroDia(f.dia ?? "");
                    setFiltroHorario(f.horario ?? "");
                    setPaginaAtual(1);
                }}
            />
            {loading && disponibilidades.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#17264D]/70">Carregando disponibilidades...</div>
            ) : disponibilidades.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma disponibilidade encontrada.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={disponibilidades}
                        getRowKey={(d) => d.id}
                        columns={[
                            { key: "professor", label: "Professor", render: (d) => d.professor.nome },
                            {
                                key: "diaSemana",
                                label: "Dia da Semana",
                                render: (d) => rotuloDia(d.diaSemana),
                            },
                            {
                                key: "horario",
                                label: "Bloco de Horário",
                                render: (d) => formatarIntervalo(d.blocoHorario),
                            },
                        ]}
                        actions={[
                            {
                                label: "Editar",
                                icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                                onClick: (d) => setEditando(d),
                            },
                            {
                                label: "Excluir",
                                icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                                className: "text-[#BA1A1A] hover:bg-red-50",
                                onClick: (d) => setExcluindo(d),
                            },
                        ]}
                    />
                </div>
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
            <DisponibilidadeProfessorFormModal
                open={cadastroAberto}
                onClose={() => setCadastroAberto(false)}
                professores={professores}
                blocos={blocos}
                onConfirm={confirmarCadastro}
            />
            <DisponibilidadeProfessorFormModal
                open={editando !== null}
                onClose={() => setEditando(null)}
                disponibilidade={editando}
                professores={professores}
                blocos={blocos}
                onConfirm={confirmarEdicao}
            />
            <DisponibilidadeProfessorExclusaoModal
                open={excluindo !== null}
                onClose={() => setExcluindo(null)}
                disponibilidade={excluindo}
                onConfirm={confirmarExclusao}
            />
            <Modal
                open={feedback !== null || Boolean(erroLista)}
                onClose={() => setFeedback(null)}
                type={feedback?.tipo ?? "error"}
                message={feedback?.mensagem ?? (erroLista instanceof Error ? erroLista.message : "Não foi possível carregar as disponibilidades.")}
            />
        </div>
    );
}
