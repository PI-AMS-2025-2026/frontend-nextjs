"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Pencil, Trash2, Wrench, ArrowLeft } from "lucide-react";

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
import { recursoSalaService } from "@/services/recurso-sala.service";
import type { Id, SalaResponse, TipoSalaResponse } from "@/types/api";
import { useServerPage } from "@/hooks/use-server-page";

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

async function sincronizarRecursosSala(
    salaId: Id,
    recursosDesejados: DadosSala["recursos"],
) {
    const vinculados = await recursoSalaService.listar({ salaId, page: 0, size: 1000 });
    const pendentes = new Map(recursosDesejados.map((item) => [item.recursoId, item.quantidade]));

    for (const vinculo of vinculados.content) {
        const quantidade = pendentes.get(vinculo.recurso.id);
        if (quantidade === undefined) {
            await recursoSalaService.deletar(vinculo.id);
            continue;
        }

        if (quantidade !== vinculo.quantidade) {
            await recursoSalaService.atualizar(vinculo.id, {
                sala: { id: salaId },
                recurso: { id: vinculo.recurso.id },
                quantidade,
            });
        }
        pendentes.delete(vinculo.recurso.id);
    }

    for (const [recursoId, quantidade] of pendentes) {
        await recursoSalaService.criar({
            sala: { id: salaId },
            recurso: { id: recursoId },
            quantidade,
        });
    }
}

export function SalasListagem() {
    const pathname = usePathname();
    const isCoordinatorRoute = pathname.startsWith("/coordenador/");
    const [tiposSala, setTiposSala] = React.useState<TipoSalaResponse[]>([]);
    const [erro, setErro] = React.useState<string | null>(null);
    const [erroForm, setErroForm] = React.useState<string | null>(null);
    const [salvando, setSalvando] = React.useState(false);

    const carregarCatalogo = React.useCallback(async () => {
        try {
            setErro(null);
            const tipos = await tiposSalaService.listar();
            setTiposSala(tipos);
        } catch (e) {
            setErro(mensagemErro(e, "Não foi possível carregar as salas."));
        }
    }, []);

    const [busca, setBusca] = React.useState("");
    const [fCodigo, setFCodigo] = React.useState("");
    const [fCapacidade, setFCapacidade] = React.useState("");
    const [fTipoSala, setFTipoSala] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const filtros = React.useMemo(() => ({
        busca: busca.trim() || undefined,
        codigo: fCodigo.trim() || undefined,
        capacidade: /^\d+$/.test(fCapacidade) ? Number(fCapacidade) : undefined,
        tipo_sala: fTipoSala ? Number(fTipoSala) : undefined,
    }), [busca, fCodigo, fCapacidade, fTipoSala]);
    const { data: pageData, loading, error: erroLista, reload } = useServerPage(
        (query) => salasService.listar(query as Parameters<typeof salasService.listar>[0]),
        filtros, paginaAtual, itensPorPagina,
    );
    const salasPagina = pageData.content;

    React.useEffect(() => { void Promise.resolve().then(carregarCatalogo); }, [carregarCatalogo]);

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

    const paginaSegura = Math.min(paginaAtual, Math.max(1, pageData.totalPages));

    function selecionar(row: SalaRow) {
        setSelecionada(salasPagina.find((s) => s.id === row.id) ?? null);
    }

    async function confirmarCadastro(dados: DadosSala) {
        try {
            setSalvando(true);
            setErroForm(null);
            const tipoSalaId = dados.novoTipo
                ? (await tiposSalaService.criar({ nome: dados.novoTipo })).id
                : dados.tipoSalaId;
            if (!tipoSalaId) throw new Error("Selecione ou cadastre um tipo de sala.");

            const criada = await salasService.criar({
                codigo: dados.codigo,
                capacidade: dados.capacidade,
                tipoSala: { id: tipoSalaId },
            });
            await sincronizarRecursosSala(criada.id, dados.recursos);
            reload();
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
            const tipoSalaId = dados.novoTipo
                ? (await tiposSalaService.criar({ nome: dados.novoTipo })).id
                : dados.tipoSalaId;
            if (!tipoSalaId) throw new Error("Selecione ou cadastre um tipo de sala.");

            await salasService.atualizar(selecionada.id, {
                codigo: dados.codigo,
                capacidade: dados.capacidade,
                tipoSala: { id: tipoSalaId },
            });
            await sincronizarRecursosSala(selecionada.id, dados.recursos);
            reload();
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
            reload();
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

    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={isCoordinatorRoute ? "/coordenador/home" : "/administrador/home"}
                        aria-label="Voltar"
                        className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                    >
                        <ArrowLeft className="size-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#17264D]">Salas</h1>
                        <p className="text-sm text-[#17264D]/70">
                            {isCoordinatorRoute
                                ? "Visualize as salas da instituição"
                                : "Gerencie as salas da instituição"}
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

            {Boolean(erro || erroLista) && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-[#FF0000]/40 bg-red-50 px-4 py-3 text-sm text-[#FF0000]"
                >
                    <span>{erro || mensagemErro(erroLista, "Não foi possível carregar as salas.")}</span>
                    <button
                        type="button"
                        onClick={() => { reload(); void carregarCatalogo(); }}
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
                        inputType: "number",
                        min: 0,
                        disableExponent: true,
                        placeholder: "Digite aqui...",
                    },
                    {
                        name: "tipoSala",
                        label: "Tipo",
                        type: "select",
                        placeholder: "Todos",
                        options: tiposSala.map((tipo) => ({ label: tipo.nome, value: String(tipo.id) })),
                    },
                ]}
                onChange={(f) => {
                    setFCodigo(f.codigo ?? "");
                    setFCapacidade(f.capacidade ?? "");
                    setFTipoSala(f.tipoSala ?? "");
                    setPaginaAtual(1);
                }}
            />

            {loading && salasPagina.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#17264D]/70">Carregando salas...</div>
            ) : salasPagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhuma sala encontrada.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={salasPagina.map(paraRow)}
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
                totalItems={pageData.totalElements}
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
