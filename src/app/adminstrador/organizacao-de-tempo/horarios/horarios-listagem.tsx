"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { HorarioFormModal } from "./horarios-form-modal";
import { ExcluirHorarioModal } from "./excluir-horario-modal";

import { blocoHorariosService } from "@/services/bloco-horarios.service";
import type { BlocoHorarioResponse, PageResponse } from "@/types/api";
import { ApiError } from "@/lib/api";

export function HorariosListagem() {
    const [pageData, setPageData] = React.useState<PageResponse<BlocoHorarioResponse>>({
        content: [],
        page: 0,
        size: 6,
        totalElements: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = React.useState(true);

    const [busca, setBusca] = React.useState("");
    const [filtroInicio, setFiltroInicio] = React.useState("");
    const [filtroFim, setFiltroFim] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [excluirAberto, setExcluirAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<BlocoHorarioResponse | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    const carregarHorarios = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await blocoHorariosService.listar({
                page: paginaAtual - 1,
                size: itensPorPagina,
                hora_inicio: filtroInicio || undefined,
                hora_fim: filtroFim || undefined,
            });
            setPageData(res);
        } catch (err) {
            console.error("Erro ao carregar horários:", err);
        } finally {
            setLoading(false);
        }
    }, [paginaAtual, itensPorPagina, filtroInicio, filtroFim]);

    React.useEffect(() => {
        carregarHorarios();
    }, [carregarHorarios]);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    async function confirmarCadastro(dados: { horaInicio: string; horaFim: string }) {
        try {
            await blocoHorariosService.criar(dados);
            setCadastrarAberto(false);
            setSucesso("Horário cadastrado com sucesso!");
            carregarHorarios();
        } catch (err) {
            throw new Error(err instanceof ApiError ? err.message : "Erro ao cadastrar horário.");
        }
    }

    async function confirmarEdicao(dados: { horaInicio: string; horaFim: string }) {
        if (!selecionado) return;
        try {
            await blocoHorariosService.atualizar(selecionado.id, dados);
            setEditarAberto(false);
            setSelecionado(null);
            setSucesso("Horário editado com sucesso!");
            carregarHorarios();
        } catch (err) {
            throw new Error(err instanceof ApiError ? err.message : "Erro ao editar horário.");
        }
    }

    async function confirmarExclusao() {
        if (!selecionado) return;
        try {
            await blocoHorariosService.deletar(selecionado.id);
            setExcluirAberto(false);
            setSelecionado(null);
            setSucesso("Horário excluído com sucesso!");
            carregarHorarios();
        } catch (err) {
            alert(err instanceof ApiError ? err.message : "Erro ao excluir horário.");
        }
    }

    const exibidos = React.useMemo(() => {
        if (!busca.trim()) return pageData.content;
        const b = busca.trim();
        return pageData.content.filter(
            (h) => h.horaInicio.includes(b) || h.horaFim.includes(b)
        );
    }, [pageData.content, busca]);

    return (
        <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-[#17264D] sm:text-3xl">
                    Listagem de horários
                </h1>

                <div className="flex items-center gap-3">
                    <div className="w-full sm:w-64">
                        <SearchInput
                            placeholder="Pesquisar..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
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
                    { name: "inicio", label: "Horário Início", type: "input", inputType: "time" },
                    { name: "fim", label: "Horário Fim", type: "input", inputType: "time" },
                ]}
                onChange={(f) => {
                    setFiltroInicio(f.inicio ?? "");
                    setFiltroFim(f.fim ?? "");
                    setPaginaAtual(1);
                }}
            />

            {loading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                    <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                    <span className="text-sm text-[#17264D]/70">
                        Carregando horários...
                    </span>
                </div>
            ) : exibidos.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhum horário encontrado.
                </div>
            ) : (
                <DataTable
                    data={exibidos}
                    getRowKey={(h) => h.id}
                    columns={[
                        { key: "horaInicio", label: "Início" },
                        { key: "horaFim", label: "Fim" },
                        {
                            key: "duracao",
                            label: "Duração (min)",
                            render: (h) => h.duracao ? `${h.duracao} min` : "-",
                        },
                    ]}
                    actions={[
                        {
                            label: "Editar",
                            icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                            onClick: (h) => {
                                setSelecionado(h);
                                setEditarAberto(true);
                            },
                        },
                        {
                            label: "Excluir",
                            icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                            className: "text-[#FF0000] hover:bg-red-50",
                            onClick: (h) => {
                                setSelecionado(h);
                                setExcluirAberto(true);
                            },
                        },
                    ]}
                />
            )}

            <Pagination
                totalItems={pageData.totalElements}
                currentPage={paginaAtual}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={(n) => {
                    setItensPorPagina(n);
                    setPaginaAtual(1);
                }}
            />

            <HorarioFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                onConfirm={confirmarCadastro}
            />

            <HorarioFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionado(null);
                }}
                mode="editar"
                horario={selecionado}
                onConfirm={confirmarEdicao}
            />

            <ExcluirHorarioModal
                open={excluirAberto}
                onClose={() => {
                    setExcluirAberto(false);
                    setSelecionado(null);
                }}
                onConfirm={confirmarExclusao}
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