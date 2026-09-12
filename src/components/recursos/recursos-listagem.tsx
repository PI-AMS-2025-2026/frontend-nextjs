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

import {
    carregarRecursosSalvos,
    gerarRecursosMock,
    salvarRecursos,
    TIPOS_PADRAO,
    type Recurso,
} from "@/lib/recursos";

export function RecursosListagem() {
    const [recursos, setRecursos] = React.useState<Recurso[] | null>(null);

    React.useEffect(() => {
        const salvos = carregarRecursosSalvos();
        setRecursos(salvos ?? gerarRecursosMock());
    }, []);

    React.useEffect(() => {
        if (recursos === null) return;
        salvarRecursos(recursos);
    }, [recursos]);

    const [busca, setBusca] = React.useState("");
    const [fNome, setFNome] = React.useState("");
    const [fTipo, setFTipo] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [excluirAberto, setExcluirAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<Recurso | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    // Tipos criados pelo usuário via "+ Novo tipo" (exibem a etiqueta "Novo")
    const [tiposCustomizados, setTiposCustomizados] = React.useState<string[]>([]);

    const tiposDisponiveis = React.useMemo(() => {
        const doAcervo = (recursos ?? []).map((r) => r.tipo);
        return Array.from(new Set([...TIPOS_PADRAO, ...doAcervo, ...tiposCustomizados]));
    }, [recursos, tiposCustomizados]);

    function isTipoCustomizado(tipo: string) {
        return tiposCustomizados.includes(tipo);
    }

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
                !b || r.nome.toLowerCase().includes(b) || r.tipo.toLowerCase().includes(b);
            const nomeOk = !fNome || r.nome.toLowerCase().includes(fNome.toLowerCase());
            const tipoOk = !fTipo || r.tipo.toLowerCase().includes(fTipo.toLowerCase());
            return buscaOk && nomeOk && tipoOk;
        });
    }, [recursos, busca, fNome, fTipo]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    function registrarTipoSeNovo(tipo: string) {
        const jaExiste = TIPOS_PADRAO.includes(tipo) || (recursos ?? []).some((r) => r.tipo === tipo);
        if (!jaExiste) {
            setTiposCustomizados((prev) => (prev.includes(tipo) ? prev : [...prev, tipo]));
        }
    }

    function confirmarCadastro(dados: { nome: string; tipo: string }) {
        registrarTipoSeNovo(dados.tipo);
        setRecursos((prev) => [...(prev ?? []), { id: crypto.randomUUID(), ...dados }]);
        setCadastrarAberto(false);
        setSucesso("Recurso cadastrado com sucesso!");
    }

    function confirmarEdicao(dados: { nome: string; tipo: string }) {
        if (!selecionado) return;
        registrarTipoSeNovo(dados.tipo);
        setRecursos((prev) =>
            (prev ?? []).map((r) => (r.id === selecionado.id ? { ...r, ...dados } : r))
        );
        setEditarAberto(false);
        setSelecionado(null);
        setSucesso("Recurso editado com sucesso!");
    }

    function confirmarExclusao() {
        if (!selecionado) return;
        setRecursos((prev) => (prev ?? []).filter((r) => r.id !== selecionado.id));
        setExcluirAberto(false);
        setSelecionado(null);
        setSucesso("Recurso excluído com sucesso!");
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
                    { name: "nome", label: "Nome", type: "text", placeholder: "Digite aqui..." },
                    { name: "tipo", label: "Tipo", type: "text", placeholder: "Digite aqui..." },
                ]}
                onChange={(f) => {
                    setFNome(f.nome ?? "");
                    setFTipo(f.tipo ?? "");
                    setPaginaAtual(1);
                }}
            />

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
                                        {r.tipo}
                                        {isTipoCustomizado(r.tipo) && (
                                            <span className="rounded-full bg-[#0099AA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                Novo
                                            </span>
                                        )}
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
                isTipoCustomizado={isTipoCustomizado}
                onConfirm={confirmarCadastro}
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
                isTipoCustomizado={isTipoCustomizado}
                onConfirm={confirmarEdicao}
            />

            <RecursoExcluirModal
                open={excluirAberto}
                onClose={() => {
                    setExcluirAberto(false);
                    setSelecionado(null);
                }}
                recurso={selecionado}
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
