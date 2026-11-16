"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { CursoFormModal } from "@/components/cursos/curso-form-modal";
import { ApiError } from "@/lib/api";
import { cursosService } from "@/services/cursos.service";
import type { CursoRequest, CursoResponse } from "@/types/api";

function mensagemErro(error: unknown) {
    if (error instanceof ApiError) {
        if (error.status === 401) return "Sua sessão expirou. Entre novamente.";
        if (error.status === 403) return "Você não tem permissão para gerenciar cursos.";
        return error.message;
    }
    return error instanceof Error ? error.message : "Não foi possível concluir a operação. Tente novamente.";
}

export function CursosListagem() {
    const [cursos, setCursos] = React.useState<CursoResponse[] | null>(null);
    const [erroCarregamento, setErroCarregamento] = React.useState("");
    const [erroFormulario, setErroFormulario] = React.useState("");
    const [carregando, setCarregando] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);

    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroPeriodicidade, setFiltroPeriodicidade] = React.useState("");
    const [filtroDuracao, setFiltroDuracao] = React.useState("");
    const [filtroStatus, setFiltroStatus] = React.useState("");
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionado, setSelecionado] = React.useState<CursoResponse | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);

    const carregarCursos = React.useCallback(async () => {
        setCarregando(true);
        setErroCarregamento("");
        try {
            const primeiraPagina = await cursosService.listar({ page: 0, size: 100 });
            const paginasRestantes = await Promise.all(
                Array.from({ length: Math.max(0, primeiraPagina.totalPages - 1) }, (_, index) =>
                    cursosService.listar({ page: index + 1, size: 100 }),
                ),
            );
            setCursos([...primeiraPagina.content, ...paginasRestantes.flatMap((pagina) => pagina.content)]);
        } catch (error) {
            setCursos(null);
            setErroCarregamento(mensagemErro(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    React.useEffect(() => {
        void Promise.resolve().then(() => carregarCursos());
    }, [carregarCursos]);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const filtrados = React.useMemo(() => {
        const lista = cursos ?? [];
        const b = busca.trim().toLowerCase();
        const n = filtroNome.trim().toLowerCase();
        const d = filtroDuracao.trim().toLowerCase();
        return lista.filter((curso) => {
            const buscaOk = !b || curso.nome.toLowerCase().includes(b);
            const nomeOk = !n || curso.nome.toLowerCase().includes(n);
            const periodicidadeOk = !filtroPeriodicidade || curso.periodicidade === filtroPeriodicidade;
            const duracaoLabel = `${curso.duracao} ${curso.periodicidade === "Anual" ? "anos" : "semestres"}`.toLowerCase();
            const duracaoOk = !d || String(curso.duracao).includes(d) || duracaoLabel.includes(d);
            const statusOk = !filtroStatus || curso.status === (filtroStatus === "Ativo" ? "ATIVO" : "INATIVO");
            return buscaOk && nomeOk && periodicidadeOk && duracaoOk && statusOk;
        });
    }, [cursos, busca, filtroNome, filtroPeriodicidade, filtroDuracao, filtroStatus]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const pagina = filtrados.slice((paginaSegura - 1) * itensPorPagina, paginaSegura * itensPorPagina);

    async function confirmarCadastro(dados: CursoRequest) {
        setSubmitting(true);
        setErroFormulario("");
        try {
            await cursosService.criar(dados);
            setCadastrarAberto(false);
            setSucesso("Curso cadastrado com sucesso!");
            await carregarCursos();
        } catch (error) {
            setErroFormulario(mensagemErro(error));
        } finally {
            setSubmitting(false);
        }
    }

    async function confirmarEdicao(dados: CursoRequest) {
        if (!selecionado) return;
        setSubmitting(true);
        setErroFormulario("");
        try {
            await cursosService.atualizar(selecionado.id, dados);
            setEditarAberto(false);
            setSelecionado(null);
            setSucesso("Curso atualizado com sucesso!");
            await carregarCursos();
        } catch (error) {
            setErroFormulario(mensagemErro(error));
        } finally {
            setSubmitting(false);
        }
    }

    if (carregando && cursos === null) {
        return <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24"><Loader2 className="size-6 animate-spin text-[#0099AA]" /><span className="text-sm text-[#17264D]/70">Carregando cursos...</span></div>;
    }

    if (erroCarregamento && cursos === null) {
        return <div className="mx-auto w-full max-w-[1200px] px-6 py-8"><div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroCarregamento}<Button variant="ghost" size="small" onClick={() => void carregarCursos()}>Tentar novamente</Button></div></div>;
    }

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/adminstrador/home" aria-label="Voltar" className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"><ArrowLeft className="size-6" /></Link>
                    <div><h1 className="text-3xl font-bold text-[#17264D]">Cursos</h1><p className="text-sm text-[#17264D]/70">Gerencie os cursos da instituição</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-64"><SearchInput placeholder="Pesquisar..." value={busca} onChange={(event) => { setBusca(event.target.value); setPaginaAtual(1); }} /></div>
                    <Button variant="secondary" size="small" className="gap-2" onClick={() => { setErroFormulario(""); setCadastrarAberto(true); }} disabled={submitting}><Plus className="size-5" />Cadastrar</Button>
                </div>
            </div>

            {erroCarregamento && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroCarregamento}<Button variant="ghost" size="small" onClick={() => void carregarCursos()}>Atualizar</Button></div>}

            <TableFilters
                fields={[
                    { name: "nome", label: "Nome", type: "input", placeholder: "Filtrar por nome", width: "w-[240px]" },
                    { name: "periodicidade", label: "Periodicidade", type: "select", placeholder: "Selecione...", options: [{ label: "Semestral", value: "Semestral" }, { label: "Anual", value: "Anual" }] },
                    { name: "duracao", label: "Duração", type: "input", placeholder: "Ex: 4" },
                    { name: "status", label: "Status", type: "select", placeholder: "Todos", options: [{ label: "Ativo", value: "Ativo" }, { label: "Inativo", value: "Inativo" }] },
                ]}
                onChange={(filters) => { setFiltroNome(filters.nome ?? ""); setFiltroPeriodicidade(filters.periodicidade ?? ""); setFiltroDuracao(filters.duracao ?? ""); setFiltroStatus(filters.status ?? ""); setPaginaAtual(1); }}
                onClear={() => { setFiltroNome(""); setFiltroPeriodicidade(""); setFiltroDuracao(""); setFiltroStatus(""); setPaginaAtual(1); }}
            />

            {pagina.length === 0 ? <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">Nenhum curso encontrado.</div> : (
                <DataTable
                    data={pagina}
                    getRowKey={(curso) => curso.id}
                    columns={[
                        { key: "nome", label: "Nome" },
                        { key: "periodicidade", label: "Periodicidade" },
                        { key: "duracao", label: "Duração", render: (curso) => `${curso.duracao} ${curso.periodicidade === "Anual" ? "anos" : "semestres"}` },
                        { key: "status", label: "Status", render: (curso) => curso.status === "ATIVO" ? <span className="flex items-center gap-1.5 font-medium text-emerald-600"><CheckCircle2 className="size-4" />Ativo</span> : <span className="flex items-center gap-1.5 font-medium text-[#BA1A1A]"><XCircle className="size-4" />Inativo</span> },
                    ]}
                    actions={[{ label: "Editar", icon: <Pencil className="size-[21px]" strokeWidth={2} />, onClick: (curso) => { setErroFormulario(""); setSelecionado(curso); setEditarAberto(true); }, disabled: () => submitting }]}
                />
            )}

            <Pagination totalItems={filtrados.length} currentPage={paginaSegura} itemsPerPage={itensPorPagina} onPageChange={setPaginaAtual} onItemsPerPageChange={(value) => { setItensPorPagina(value); setPaginaAtual(1); }} />

            <CursoFormModal open={cadastrarAberto} onClose={() => setCadastrarAberto(false)} mode="cadastrar" onConfirm={(dados) => void confirmarCadastro(dados)} submitting={submitting} errorMessage={erroFormulario} />
            <CursoFormModal open={editarAberto} onClose={() => { setEditarAberto(false); setSelecionado(null); }} mode="editar" curso={selecionado} onConfirm={(dados) => void confirmarEdicao(dados)} submitting={submitting} errorMessage={erroFormulario} />
            <Modal open={sucesso !== null} onClose={() => setSucesso(null)} type="success" message={sucesso ?? ""} />
        </div>
    );
}
