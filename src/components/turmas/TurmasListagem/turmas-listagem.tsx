"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, ArrowLeft, CircleCheck, CircleMinus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { TableFilterHead } from "@/components/ui/table-filter-head";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { turmasService } from "@/services/turmas.service";
import type { CursoResponse, Status, TurmaRequest, TurmaResponse } from "@/types/api";
import { rotuloPeriodoTurma } from "@/lib/turma-periodo";

import { TurmaFormModal } from "../TurmaFormModal/turma-form-modal";

const PAGE_SIZE_DEFAULT = 10;

function mensagemErro(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function TurmasListagem() {
    const { user, isLoading: carregandoPerfil } = useAuth();
    const cursoCoordenador = user
        ? (user as { curso?: CursoResponse }).curso
        : undefined;
    const [turmas, setTurmas] = React.useState<TurmaResponse[]>([]);
    const [totalTurmas, setTotalTurmas] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [erro, setErro] = React.useState<string | null>(null);
    const [busca, setBusca] = React.useState("");
    const [buscaAplicada, setBuscaAplicada] = React.useState("");
    const [fPeriodo, setFPeriodo] = React.useState("");
    const [fAno, setFAno] = React.useState("");
    const [fStatus, setFStatus] = React.useState<Status | "">("");
    const [itensPorPagina, setItensPorPagina] = React.useState(PAGE_SIZE_DEFAULT);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<TurmaResponse | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);
    const requisicaoAtual = React.useRef(0);

    const carregarTurmas = React.useCallback(async (pagina = paginaAtual) => {
        const idRequisicao = ++requisicaoAtual.current;
        setLoading(true);
        setErro(null);
        try {
            const resposta = await turmasService.listar({
                page: pagina - 1,
                size: itensPorPagina,
                busca: buscaAplicada.trim() || undefined,
                periodo: fPeriodo ? Number(fPeriodo) : undefined,
                ano: fAno ? Number(fAno) : undefined,
                status: fStatus || undefined,
            });
            if (idRequisicao === requisicaoAtual.current) {
                setTurmas(resposta.content);
                setTotalTurmas(resposta.totalElements);
            }
        } catch (error) {
            if (idRequisicao === requisicaoAtual.current) {
                setErro(mensagemErro(error, "Não foi possível carregar as turmas."));
                setTurmas([]);
                setTotalTurmas(0);
            }
        } finally {
            if (idRequisicao === requisicaoAtual.current) setLoading(false);
        }
    }, [buscaAplicada, fAno, fPeriodo, fStatus, itensPorPagina, paginaAtual]);

    React.useEffect(() => {
        const timer = setTimeout(() => setBuscaAplicada(busca), 300);
        return () => clearTimeout(timer);
    }, [busca]);

    React.useEffect(() => {
        let vivo = true;
        void Promise.resolve().then(() => {
            if (vivo) void carregarTurmas();
        });
        return () => {
            vivo = false;
            requisicaoAtual.current += 1;
        };
    }, [carregarTurmas]);

    React.useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(null), 1800);
        return () => clearTimeout(timer);
    }, [sucesso]);

    async function salvarTurma(dados: TurmaRequest, modo: "criar" | "editar") {
        try {
            if (modo === "criar") {
                await turmasService.criar(dados);
                setCadastrarAberto(false);
                setSucesso("Turma cadastrada com sucesso!");
            } else if (selecionada) {
                await turmasService.atualizar(selecionada.id, dados);
                setEditarAberto(false);
                setSelecionada(null);
                setSucesso("Turma editada com sucesso!");
            } else {
                return;
            }

            if (paginaAtual !== 1) setPaginaAtual(1);
            else await carregarTurmas(1);
        } catch (error) {
            const fallback = modo === "criar" ? "Erro ao cadastrar turma." : "Erro ao editar turma.";
            const mensagem = error instanceof ApiError
                ? error.status === 403
                    ? "O curso selecionado não está associado ao seu perfil. Confira a seleção ou solicite a associação do curso ao administrador."
                    : error.message
                : fallback;
            throw new Error(mensagem);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/coordenador/home"
                        aria-label="Voltar"
                        className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                    >
                        <ArrowLeft className="size-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#17264D]">Listagem de Turmas</h1>
                        <p className="text-sm text-[#17264D]/70">Gerencie as turmas da instituição</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-64">
                        <SearchInput
                            placeholder="Pesquisar..."
                            value={busca}
                            onChange={(event) => {
                                setBusca(event.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>
                    <Button variant="secondary" size="small" className="gap-2" onClick={() => setCadastrarAberto(true)}>
                        <Plus className="size-5" />
                        Cadastrar
                    </Button>
                </div>
            </div>

            <TableFilters
                fields={[
                    { name: "periodo", label: "Etapa do curso", type: "input", inputType: "number", placeholder: "Número da etapa", width: "w-[190px]" },
                    { name: "ano", label: "Ano", type: "input", inputType: "number", placeholder: "Ex.: 2026", width: "w-[150px]" },
                ]}
                onChange={(filters) => {
                    setFPeriodo(filters.periodo ?? "");
                    setFAno(filters.ano ?? "");
                    setPaginaAtual(1);
                }}
                onClear={() => {
                    setFStatus("");
                    setPaginaAtual(1);
                }}
            />

            {erro && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]">
                    <span>{erro}</span>
                    <Button variant="ghost" size="small" onClick={() => void carregarTurmas()}>Tentar novamente</Button>
                </div>
            )}

            {loading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24" role="status">
                    <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                    <span className="text-sm text-[#17264D]/70">Carregando turmas...</span>
                </div>
            ) : (
                <div className="min-w-0 pb-2">
                    <DataTable
                        data={turmas}
                        getRowKey={(turma) => turma.id}
                        emptyMessage="Nenhuma turma encontrada."
                        columns={[
                            { key: "id", label: "ID", headerClassName: "min-w-[80px]" },
                            { key: "periodo", label: "Período no curso", headerClassName: "min-w-[140px]", render: (turma) => rotuloPeriodoTurma(turma.curso.periodicidade, turma.periodo) },
                            { key: "ano", label: "Ano", headerClassName: "min-w-[100px]" },
                            { key: "numeroAlunos", label: "Qtd. Alunos", headerClassName: "min-w-[120px]" },
                            { key: "curso", label: "Curso", headerClassName: "min-w-[140px]", render: (turma) => turma.curso.nome },
                            {
                                key: "status",
                                label: <TableFilterHead label="Status" value={fStatus} onChange={(status) => { setFStatus(status as Status | ""); setPaginaAtual(1); }} options={[{ label: "Ativo", value: "ATIVO" }, { label: "Inativo", value: "INATIVO" }]} />,
                                headerClassName: "min-w-[140px]",
                                render: (turma) => turma.status === "ATIVO"
                                    ? <span className="inline-flex items-center gap-2 font-medium text-[#13B900]"><CircleCheck className="size-4" />Ativo</span>
                                    : <span className="inline-flex items-center gap-2 font-medium text-[#BA1A1A]"><CircleMinus className="size-4" />Inativo</span>,
                            },
                        ]}
                        actions={[{
                            label: "Editar",
                            icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                            onClick: (turma) => { setSelecionada(turma); setEditarAberto(true); },
                        }]}
                    />
                </div>
            )}

            <Pagination
                totalItems={totalTurmas}
                currentPage={paginaAtual}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={(quantidade) => { setItensPorPagina(quantidade); setPaginaAtual(1); }}
            />

            <TurmaFormModal open={cadastrarAberto} onClose={() => setCadastrarAberto(false)} mode="cadastrar" cursoCoordenador={cursoCoordenador} carregandoPerfil={carregandoPerfil} onConfirm={(dados) => salvarTurma(dados, "criar")} />
            <TurmaFormModal open={editarAberto} onClose={() => { setEditarAberto(false); setSelecionada(null); }} mode="editar" turma={selecionada} onConfirm={(dados) => salvarTurma(dados, "editar")} />
            <Modal open={sucesso !== null} onClose={() => setSucesso(null)} type="success" message={sucesso ?? ""} />
        </div>
    );
}
