"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import {
    DisponibilidadeProfessorFormModal,
    type DadosDisponibilidade,
} from "./disponibilidade-professor-form-modal";
import { DisponibilidadeProfessorExclusaoModal } from "./disponibilidade-professor-exclusao-modal";
import { DIAS_SEMANA, formatarHora, mesmoDia, rotuloDia } from "./dias-semana";

import {
    blocoHorariosService,
    disponibilidadesProfessoresService,
    professoresService,
} from "@/services";
import type {
    BlocoHorarioResponse,
    DisponibilidadeProfessorRequest,
    LongDTO,
    ProfessorResponse,
} from "@/types/api";
import {
    normalizarDisponibilidades,
    type DisponibilidadeProfessor,
    type DisponibilidadeProfessorApi,
} from "./disponibilidade-professor-api";

const TAMANHO_MAXIMO = 1000;

type Feedback = { tipo: "success" | "error"; mensagem: string };

function montarRequest(dados: DadosDisponibilidade): DisponibilidadeProfessorRequest {
    return {
        professor: { id: dados.professorId },
        // O backend espera o enum do dia (string); o tipo do request em types/api.ts
        // declara LongDTO. O contrato não foi alterado.
        diaSemana: dados.diaSemana as unknown as LongDTO,
        blocoHorario: { id: dados.blocoHorarioId },
    };
}

export function DisponibilidadeProfessorListagem() {
    const [disponibilidades, setDisponibilidades] = React.useState<
        DisponibilidadeProfessor[] | null
    >(null);
    const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
    const [blocos, setBlocos] = React.useState<BlocoHorarioResponse[]>([]);

    const [busca, setBusca] = React.useState("");
    const [filtroProfessor, setFiltroProfessor] = React.useState("");
    const [filtroDia, setFiltroDia] = React.useState("");
    const [filtroHorario, setFiltroHorario] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastroAberto, setCadastroAberto] = React.useState(false);
    const [editando, setEditando] = React.useState<DisponibilidadeProfessor | null>(null);
    const [excluindo, setExcluindo] = React.useState<DisponibilidadeProfessor | null>(null);
    const [feedback, setFeedback] = React.useState<Feedback | null>(null);

    const carregarDisponibilidades = React.useCallback(async () => {
        const resposta = await disponibilidadesProfessoresService.listar({ size: TAMANHO_MAXIMO });
        // a resposta real não segue DisponibilidadeProfessorResponse (ver ...-api.ts)
        setDisponibilidades(
            normalizarDisponibilidades(resposta.content as unknown as DisponibilidadeProfessorApi[]),
        );
    }, []);

    React.useEffect(() => {
        async function carregar() {
            try {
                const [, profs, blocosResposta] = await Promise.all([
                    carregarDisponibilidades(),
                    professoresService.listar({ size: TAMANHO_MAXIMO }),
                    blocoHorariosService.listar({ size: TAMANHO_MAXIMO }),
                ]);
                setProfessores(profs.content);
                setBlocos(blocosResposta.content);
            } catch {
                setDisponibilidades([]);
                setFeedback({ tipo: "error", mensagem: "Não foi possível carregar as disponibilidades!" });
            }
        }
        carregar();
    }, [carregarDisponibilidades]);

    React.useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 1800);
        return () => clearTimeout(timer);
    }, [feedback]);

    const filtrados = React.useMemo(() => {
        if (disponibilidades === null) return [];
        const b = busca.trim().toLowerCase();
        const p = filtroProfessor.trim().toLowerCase();
        const h = filtroHorario.trim();

        return disponibilidades.filter((d) => {
            const professor = d.professor.nome.toLowerCase();
            const dia = rotuloDia(d.diaSemana).toLowerCase();
            const horario = formatarHora(d.blocoHorario.horaInicio);

            const buscaOk = !b || professor.includes(b) || dia.includes(b) || horario.includes(b);
            const professorOk = !p || professor.includes(p);
            const diaOk = !filtroDia || mesmoDia(d.diaSemana, filtroDia);
            const horarioOk = !h || horario.includes(h);
            return buscaOk && professorOk && diaOk && horarioOk;
        });
    }, [disponibilidades, busca, filtroProfessor, filtroDia, filtroHorario]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    async function confirmarCadastro(dados: DadosDisponibilidade) {
        try {
            await disponibilidadesProfessoresService.criar(montarRequest(dados));
            await carregarDisponibilidades();
            setFeedback({ tipo: "success", mensagem: "Disponibilidade cadastrada com sucesso!" });
        } catch {
            setFeedback({ tipo: "error", mensagem: "Não foi possível cadastrar a disponibilidade!" });
        }
        setCadastroAberto(false);
    }

    async function confirmarEdicao(dados: DadosDisponibilidade) {
        if (!editando) return;
        try {
            await disponibilidadesProfessoresService.atualizar(editando.id, montarRequest(dados));
            await carregarDisponibilidades();
            setFeedback({ tipo: "success", mensagem: "Disponibilidade editada com sucesso!" });
        } catch {
            setFeedback({ tipo: "error", mensagem: "Não foi possível editar a disponibilidade!" });
        }
        setEditando(null);
    }

    async function confirmarExclusao() {
        if (!excluindo) return;
        try {
            await disponibilidadesProfessoresService.deletar(excluindo.id);
            await carregarDisponibilidades();
            setFeedback({ tipo: "success", mensagem: "Disponibilidade excluída com sucesso!" });
        } catch {
            setFeedback({ tipo: "error", mensagem: "Não foi possível excluir a disponibilidade!" });
        }
        setExcluindo(null);
    }

    if (disponibilidades === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando disponibilidades...</span>
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
                            Disponibilidade de Professor
                        </h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie as disponibilidades de professores da instituição
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
                        placeholder: "Filtrar por dia",
                        options: DIAS_SEMANA,
                        maxVisibleOptions: 4,
                        width: "w-[200px]",
                    },
                    {
                        name: "horario",
                        label: "Horário",
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

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma disponibilidade encontrada.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={pagina}
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
                                label: "Horário",
                                render: (d) => formatarHora(d.blocoHorario.horaInicio),
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
                                className: "text-[#FF0000] hover:bg-red-50",
                                onClick: (d) => setExcluindo(d),
                            },
                        ]}
                    />
                </div>
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
                open={feedback !== null}
                onClose={() => setFeedback(null)}
                type={feedback?.tipo}
                message={feedback?.mensagem ?? ""}
            />
        </div>
    );
}
