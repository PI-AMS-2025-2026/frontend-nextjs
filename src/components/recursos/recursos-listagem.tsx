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

import { RecursoFormModal } from "@/components/recursos/recurso-form-modal";
import { RecursoExcluirModal } from "@/components/recursos/recurso-excluir-modal";
import { ApiError } from "@/lib/api";
import { recursosService } from "@/services/recursos.service";
import { tiposRecursoService } from "@/services/tipos-recurso.service";
import type { RecursoResponse, TipoRecursoResponse } from "@/types/api";
import type { DadosRecurso } from "@/components/recursos/recurso-form-modal";

function mensagemErro(e: unknown, padrao: string) {
    if (e instanceof ApiError) {
        if (e.status === 401) return "Sessão expirada. Faça login novamente.";
        if (e.status === 403) return "Você não tem permissão para essa ação.";
        const mensagemApi = e.message.toLowerCase();
        if (
            (e.status === 400 || e.status === 409) &&
            (mensagemApi.includes("integridade") ||
                mensagemApi.includes("foreign key") ||
                mensagemApi.includes("recurso_sala") ||
                mensagemApi.includes("vinculado"))
        ) {
            return "Não é possível excluir este recurso porque ele está vinculado a uma ou mais salas. Remova os vínculos com as salas antes de tentar novamente.";
        }
        if (e.status === 409) return e.message || "Conflito ao salvar o recurso.";
    }
    return e instanceof Error && e.message ? e.message : padrao;
}

export function RecursosListagem() {
    const [recursos, setRecursos] = React.useState<RecursoResponse[] | null>(null);
    const [tiposDisponiveis, setTiposDisponiveis] = React.useState<TipoRecursoResponse[]>([]);
    const [erro, setErro] = React.useState<string | null>(null);
    const [erroForm, setErroForm] = React.useState<string | null>(null);
    const [salvando, setSalvando] = React.useState(false);

    const [busca, setBusca] = React.useState("");
    const [fNome, setFNome] = React.useState("");
    const [fTipo, setFTipo] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [excluirAberto, setExcluirAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<RecursoResponse | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    const carregar = React.useCallback(async () => {
        try {
            setErro(null);
            const [pagina, tipos] = await Promise.all([
                recursosService.listar({ page: 0, size: 1000 }),
                tiposRecursoService.listar(),
            ]);
            setRecursos(pagina.content);
            setTiposDisponiveis(tipos);
        } catch (e) {
            setErro(mensagemErro(e, "Não foi possível carregar os recursos."));
            setRecursos((atual) => atual ?? []);
        }
    }, []);

    React.useEffect(() => {
        const timer = window.setTimeout(() => { void carregar(); }, 0);
        return () => window.clearTimeout(timer);
    }, [carregar]);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const filtrados = React.useMemo(() => {
        if (recursos === null) return [];
        const b = busca.trim().toLowerCase();

        return recursos.filter((r) => {
            const buscaOk =
                !b || r.nome.toLowerCase().includes(b) || (r.tipo?.nome ?? "").toLowerCase().includes(b);
            const nomeOk = !fNome || r.nome.toLowerCase().includes(fNome.toLowerCase());
            const tipoOk = !fTipo || r.tipo?.nome === fTipo;
            return buscaOk && nomeOk && tipoOk;
        });
    }, [recursos, busca, fNome, fTipo]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    async function salvar(dados: DadosRecurso, modo: "criar" | "editar") {
        try {
            setSalvando(true); setErroForm(null);
            const tipo = dados.novoTipo
                ? await tiposRecursoService.criar({ nome: dados.novoTipo })
                : tiposDisponiveis.find((t) => t.id === dados.tipoRecursoId);
            if (!tipo) throw new Error("Tipo de recurso inválido.");
            const request = { nome: dados.nome, tipoRecurso: { id: tipo.id } };
            if (modo === "criar") await recursosService.criar(request);
            else if (selecionado) await recursosService.atualizar(selecionado.id, request);
            await carregar();
            setCadastrarAberto(false); setEditarAberto(false); setSelecionado(null);
            setSucesso(modo === "criar" ? "Recurso cadastrado com sucesso!" : "Recurso editado com sucesso!");
        } catch (e) { setErroForm(mensagemErro(e, "Não foi possível salvar o recurso.")); }
        finally { setSalvando(false); }
    }

    async function confirmarExclusao() {
        if (!selecionado) return;
        try {
            setSalvando(true); await recursosService.deletar(selecionado.id); await carregar();
            setExcluirAberto(false); setSelecionado(null); setSucesso("Recurso excluído com sucesso!");
        } catch (e) { setErro(mensagemErro(e, "Não foi possível excluir o recurso.")); }
        finally { setSalvando(false); }
    }

    if (recursos === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando recursos...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/coordenador/estrutura-academica"
                        aria-label="Voltar"
                        className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                    >
                        <ArrowLeft className="size-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#17264D]">Recursos</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie os recursos da instituição
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
                        onClick={() => setCadastrarAberto(true)}
                    >
                        <Plus className="size-5" />
                        Cadastrar
                    </Button>
                </div>
            </div>

            <TableFilters
                fields={[
                    { name: "nome", label: "Nome", type: "input", placeholder: "Digite aqui..." },
                    {
                        name: "tipo",
                        label: "Tipo",
                        type: "select",
                        placeholder: "Selecione...",
                        options: tiposDisponiveis.map((t) => ({ label: t.nome, value: t.nome })),
                    },
                ]}
                onChange={(f) => {
                    setFNome(f.nome ?? "");
                    setFTipo(f.tipo ?? "");
                    setPaginaAtual(1);
                }}
            />

            {erro && <div role="alert" className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{erro} <button type="button" className="font-semibold underline" onClick={() => void carregar()}>Tentar novamente</button></div>}

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhum recurso encontrado.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={pagina}
                        getRowKey={(r) => r.id}
                        columns={[
                            { key: "nome", label: "Nome", headerClassName: "min-w-[160px]" },
                            {
                                key: "tipo",
                                label: "Tipo",
                                headerClassName: "min-w-[160px]",
                                render: (r) => (
                                    <span className="inline-flex items-center gap-2">
                                        {r.tipo?.nome ?? "-"}
                                    </span>
                                ),
                            },
                        ]}
                        actions={[
                            {
                                label: "Editar",
                                icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                                onClick: (r) => {
                                    setSelecionado(r);
                                    setEditarAberto(true);
                                },
                            },
                            {
                                label: "Excluir",
                                icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                                className: "text-[#BA1A1A] hover:bg-[#BA1A1A]/10",
                                onClick: (r) => {
                                    setSelecionado(r);
                                    setExcluirAberto(true);
                                },
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

            <RecursoFormModal
                open={cadastrarAberto}
                onClose={() => setCadastrarAberto(false)}
                mode="cadastrar"
                tiposDisponiveis={tiposDisponiveis}
                onConfirm={(dados) => void salvar(dados, "criar")}
                salvando={salvando}
                erroExterno={erroForm}
            />

            <RecursoFormModal
                open={editarAberto}
                onClose={() => {
                    setEditarAberto(false);
                    setSelecionado(null);
                }}
                mode="editar"
                recurso={selecionado}
                tiposDisponiveis={tiposDisponiveis}
                onConfirm={(dados) => void salvar(dados, "editar")}
                salvando={salvando}
                erroExterno={erroForm}
            />

            <RecursoExcluirModal
                open={excluirAberto}
                onClose={() => {
                    setExcluirAberto(false);
                    setSelecionado(null);
                }}
                recurso={selecionado}
                onConfirm={() => void confirmarExclusao()}
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
