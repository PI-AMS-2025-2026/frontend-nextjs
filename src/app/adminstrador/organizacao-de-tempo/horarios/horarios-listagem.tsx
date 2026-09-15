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

import {
    calcDuracao,
    carregarHorariosSalvos,
    gerarHorariosMock,
    salvarHorarios,
    type Horario,
} from "@/lib/horarios";

export function HorariosListagem() {
    const [horarios, setHorarios] = React.useState<Horario[] | null>(null);

    React.useEffect(() => {
        const salvos = carregarHorariosSalvos();
        setHorarios(salvos ?? gerarHorariosMock());
    }, []);

    React.useEffect(() => {
        if (horarios === null) return;
        salvarHorarios(horarios);
    }, [horarios]);

    const [busca, setBusca] = React.useState("");
    const [filtroInicio, setFiltroInicio] = React.useState("");
    const [filtroFim, setFiltroFim] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [excluirAberto, setExcluirAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<Horario | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    // fecha o modal de sucesso sozinho
    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const filtrados = React.useMemo(() => {
        if (horarios === null) return [];
        return horarios.filter((h) => {
            const buscaOk =
                !busca || h.inicio.includes(busca) || h.fim.includes(busca);
            const inicioOk = !filtroInicio || h.inicio >= filtroInicio;
            const fimOk = !filtroFim || h.fim <= filtroFim;
            return buscaOk && inicioOk && fimOk;
        });
    }, [horarios, busca, filtroInicio, filtroFim]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    function confirmarCadastro(dados: { inicio: string; fim: string }) {
        setHorarios((prev) => [
            ...(prev ?? []),
            { id: crypto.randomUUID(), ...dados },
        ]);
        setCadastrarAberto(false);
        setSucesso("Horário cadastrado com sucesso!");
    }

    function confirmarEdicao(dados: { inicio: string; fim: string }) {
        if (!selecionado) return;
        setHorarios((prev) =>
            (prev ?? []).map((h) =>
                h.id === selecionado.id ? { ...h, ...dados } : h
            )
        );
        setEditarAberto(false);
        setSelecionado(null);
        setSucesso("Horário editado com sucesso!");
    }

    function confirmarExclusao() {
        if (!selecionado) return;
        setHorarios((prev) => (prev ?? []).filter((h) => h.id !== selecionado.id));
        setExcluirAberto(false);
        setSelecionado(null);
        setSucesso("Horário excluído com sucesso!");
    }

    if (horarios === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">
                    Carregando horários...
                </span>
            </div>
        );
    }

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
                    { name: "inicio", label: "Horário Início", type: "input", inputType: "time" },
                    { name: "fim", label: "Horário Fim", type: "input", inputType: "time" },
                ]}
                onChange={(f) => {
                    setFiltroInicio(f.inicio ?? "");
                    setFiltroFim(f.fim ?? "");
                    setPaginaAtual(1);
                }}
            />

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhum horário encontrado.
                </div>
            ) : (
                <DataTable
                    data={pagina}
                    getRowKey={(h) => h.id}
                    columns={[
                        { key: "inicio", label: "Início" },
                        { key: "fim", label: "Fim" },
                        {
                            key: "duracao",
                            label: "Duração",
                            render: (h) => calcDuracao(h.inicio, h.fim),
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
                totalItems={filtrados.length}
                currentPage={paginaSegura}
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