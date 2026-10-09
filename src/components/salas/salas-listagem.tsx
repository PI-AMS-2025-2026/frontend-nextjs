"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Wrench, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { SalaFormModal, type DadosSala } from "@/components/salas/sala-form-modal";
import { ExcluirSalaModal } from "@/components/salas/excluir-sala-modal";
import { RecursosSalaModal } from "@/components/salas/recursos-sala-modal";

import { ApiError } from "@/lib/api";
import { salasService } from "@/services/salas.service";
import { tiposSalaService } from "@/services/tipos-sala.service";
import type { Id, SalaResponse, TipoSalaResponse } from "@/types/api";

// Linha exibida na tabela (as chaves batem com as colunas do DataTable)
interface SalaRow {
    id: Id;
    codigo: string;
    capacidade: number;
    tipo: string;
}

function paraRow(s: SalaResponse): SalaRow {
    return {
        id: s.id,
        codigo: s.codigo,
        capacidade: s.capacidade,
        tipo: s.tipoSala?.nome ?? "",
    };
}

function mensagemErro(e: unknown, padrao: string) {
    if (e instanceof ApiError) {
        if (e.status === 401) return "Sessão expirada. Faça login novamente.";
        if (e.status === 403) return "Você não tem permissão para essa ação.";
        if (e.status === 409)
            return e.message || "Conflito: essa sala já existe ou está em uso.";
    }
    return e instanceof Error && e.message ? e.message : padrao;
}

export function SalasListagem() {
    const [salas, setSalas] = React.useState<SalaResponse[] | null>(null);
    const [tiposSala, setTiposSala] = React.useState<TipoSalaResponse[]>([]);
    const [erro, setErro] = React.useState<string | null>(null);
    const [erroForm, setErroForm] = React.useState<string | null>(null);
    const [salvando, setSalvando] = React.useState(false);

    const carregar = React.useCallback(async () => {
        try {
            setErro(null);
            const [pagina, tipos] = await Promise.all([
                // busca tudo de uma vez; filtro e paginação continuam no cliente
                salasService.listar({ page: 0, size: 1000 }),
                tiposSalaService.listar(),
            ]);
            setSalas(pagina.content);
            setTiposSala(tipos);
        } catch (e) {
            setErro(mensagemErro(e, "Não foi possível carregar as salas."));
            setSalas((atual) => atual ?? []);
        }
    }, []);

    React.useEffect(() => {
        carregar();
    }, [carregar]);

    const [busca, setBusca] = React.useState("");
    const [fCodigo, setFCodigo] = React.useState("");
    const [fCapacidade, setFCapacidade] = React.useState("");
    const [fTipo, setFTipo] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [excluirAberto, setExcluirAberto] = React.useState(false);
    const [recursosAberto, setRecursosAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<SalaResponse | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const filtradas = React.useMemo(() => {
        if (salas === null) return [];
        const b = busca.trim().toLowerCase();
        const c = fCodigo.trim().toLowerCase();
        const t = fTipo.trim().toLowerCase();

        return salas.map(paraRow).filter((s) => {
            const buscaOk =
                !b ||
                s.codigo.toLowerCase().includes(b) ||
                s.tipo.toLowerCase().includes(b);
            const codigoOk = !c || s.codigo.toLowerCase().includes(c);
            const capacidadeOk = !fCapacidade || String(s.capacidade).includes(fCapacidade);
            const tipoOk = !t || s.tipo.toLowerCase().includes(t);
            return buscaOk && codigoOk && capacidadeOk && tipoOk;
        });
    }, [salas, busca, fCodigo, fCapacidade, fTipo]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    function selecionar(row: SalaRow) {
        setSelecionada(salas?.find((s) => s.id === row.id) ?? null);
    }

    async function confirmarCadastro(dados: DadosSala) {
        try {
            setSalvando(true);
            setErroForm(null);
            await salasService.criar({
                codigo: dados.codigo,
                capacidade: dados.capacidade,
                tipoSala: { id: dados.tipoSalaId },
            });
            await carregar();
            setCadastrarAberto(false);
            setSucesso("Sala cadastrada com sucesso!");
        } catch (e) {
            setErroForm(mensagemErro(e, "Erro ao cadastrar a sala."));
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarEdicao(dados: DadosSala) {
        if (!selecionada) return;
        try {
            setSalvando(true);
            setErroForm(null);
            await salasService.atualizar(selecionada.id, {
                codigo: dados.codigo,
                capacidade: dados.capacidade,
                tipoSala: { id: dados.tipoSalaId },
            });
            await carregar();
            setEditarAberto(false);
            setSelecionada(null);
            setSucesso("Sala editada com sucesso!");
        } catch (e) {
            setErroForm(mensagemErro(e, "Erro ao editar a sala."));
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarExclusao() {
        if (!selecionada) return;
        try {
            setSalvando(true);
            setErro(null);
            await salasService.deletar(selecionada.id);
            await carregar();
            setExcluirAberto(false);
            setSelecionada(null);
            setSucesso("Sala excluída com sucesso!");
        } catch (e) {
            // fecha o modal e mostra o erro no banner da página
            setExcluirAberto(false);
            setSelecionada(null);
            setErro(mensagemErro(e, "Erro ao excluir a sala."));
        } finally {
            setSalvando(false);
        }
    }

    if (salas === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando salas...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
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
                        <h1 className="text-3xl font-bold text-[#17264D]">Salas</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie as salas da instituição
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
                        onClick={() => {
                            setErroForm(null);
                            setCadastrarAberto(true);
                        }}
                    >
                        <Plus className="size-5" />
                        Cadastrar
                    </Button>
                </div>
            </div>

            {erro && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-[#FF0000]/40 bg-red-50 px-4 py-3 text-sm text-[#FF0000]"
                >
                    <span>{erro}</span>
                    <button
                        type="button"
                        onClick={carregar}
                        className="font-semibold underline underline-offset-2"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            <TableFilters
                fields={[
                    { name: "codigo", label: "Código", type: "input", placeholder: "Digite aqui..." },
                    {
                        name: "capacidade",
                        label: "Capacidade",
                        type: "input",
                        placeholder: "Digite aqui...",
                    },
                    { name: "tipo", label: "Tipo", type: "input", placeholder: "Digite aqui..." },
                ]}
                onChange={(f) => {
                    setFCodigo(f.codigo ?? "");
                    setFCapacidade(f.capacidade ?? "");
                    setFTipo(f.tipo ?? "");
                    setPaginaAtual(1);
                }}
            />

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma sala encontrada.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={pagina}
                        getRowKey={(s) => s.id}
                        columns={[
                            { key: "codigo", label: "Código", headerClassName: "min-w-[160px]" },
                            { key: "capacidade", label: "Capacidade", headerClassName: "min-w-[160px]" },
                            { key: "tipo", label: "Tipo", headerClassName: "min-w-[220px]" },
                        ]}
                        actions={[
                            {
                                label: "Ver Recursos",
                                icon: <Wrench className="size-[21px]" strokeWidth={2} />,
                                onClick: (s) => {
                                    selecionar(s);
                                    setRecursosAberto(true);
                                },
                            },
                            {
                                label: "Editar",
                                icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                                onClick: (s) => {
                                    selecionar(s);
                                    setErroForm(null);
                                    setEditarAberto(true);
                                },
                            },
                            {
                                label: "Excluir",
                                icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                                className: "text-[#FF0000] hover:bg-red-50",
                                onClick: (s) => {
                                    selecionar(s);
                                    setExcluirAberto(true);
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

            <SalaFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                tiposSala={tiposSala}
                salvando={salvando}
                erroExterno={erroForm}
                onConfirm={confirmarCadastro}
            />

            <SalaFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionada(null);
                }}
                mode="editar"
                sala={selecionada}
                tiposSala={tiposSala}
                salvando={salvando}
                erroExterno={erroForm}
                onConfirm={confirmarEdicao}
            />

            <ExcluirSalaModal
                open={excluirAberto}
                onClose={() => {
                    setExcluirAberto(false);
                    setSelecionada(null);
                }}
                onConfirm={confirmarExclusao}
            />

            <RecursosSalaModal
                open={recursosAberto}
                onClose={() => {
                    setRecursosAberto(false);
                    setSelecionada(null);
                }}
                sala={selecionada}
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