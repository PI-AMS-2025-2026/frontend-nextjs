"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, Grid3x3, Loader2, Plus, Pencil, Trash2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { GradeFormModal, type GradeFormValues } from "@/components/grade-horaria/grade-form-modal";
import { CopiarGradeModal } from "@/components/grade-horaria/copiar-grade-modal";
import { SucessoGradeModal } from "@/components/grade-horaria/sucesso-grade-modal";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { periodoAtividadeQuadroService, quadroHorariosService, turmasService } from "@/services";
import type { PeriodoAtividadeQuadroResponse, QuadroHorarioRequest, QuadroHorarioResponse, TurmaResponse, Status } from "@/types/api";

const BASE = "/coordenador/quadro-planejamento/quadro-horaria";

function nomePeriodo(periodo: PeriodoAtividadeQuadroResponse) {
    return periodo.tipoPeridoAtividadeQuadro === "ANUAL"
        ? `${periodo.ano} (Anual)`
        : `${periodo.periodo}º período de ${periodo.ano}`;
}

function dataBR(value: string) {
    const data = value.slice(0, 10);
    const [ano, mes, dia] = data.split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : value;
}

function mensagemErro(error: unknown) {
    if (error instanceof ApiError) {
        if (error.status === 401) return "Sua sessão expirou. Entre novamente.";
        if (error.status === 403) return "Você não tem permissão para esta operação no curso selecionado.";
        return error.message;
    }
    return error instanceof Error ? error.message : "Não foi possível concluir a operação. Tente novamente.";
}

export function GradeListagem() {
    const router = useRouter();
    const { user, isLoading: autenticando } = useAuth();
    const perfilCurso = user ? (user as { curso?: { id?: number; nome?: string } }).curso : undefined;
    const cursoId = perfilCurso?.id;
    const cursoNome = perfilCurso?.nome ?? "Curso do coordenador";

    const [grades, setGrades] = React.useState<QuadroHorarioResponse[] | null>(null);
    const [turmas, setTurmas] = React.useState<TurmaResponse[]>([]);
    const [periodos, setPeriodos] = React.useState<PeriodoAtividadeQuadroResponse[]>([]);
    const [erro, setErro] = React.useState("");
    const [erroModal, setErroModal] = React.useState("");
    const [carregando, setCarregando] = React.useState(true);
    const [mutando, setMutando] = React.useState(false);
    const [busca, setBusca] = React.useState("");
    const [filtroVersao, setFiltroVersao] = React.useState("");
    const [filtroData, setFiltroData] = React.useState("");
    const [filtroPeriodo, setFiltroPeriodo] = React.useState("");
    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
    const [editarAberto, setEditarAberto] = React.useState(false);
    const [copiarAberto, setCopiarAberto] = React.useState(false);
    const [selecionada, setSelecionada] = React.useState<QuadroHorarioResponse | null>(null);
    const [sucesso, setSucesso] = React.useState<string | null>(null);
    const [recemCriadaId, setRecemCriadaId] = React.useState<number | null>(null);

    const carregar = React.useCallback(async () => {
        if (!cursoId) return;
        setCarregando(true);
        setErro("");
        try {
            const [quadros, periodosAtivos, turmasAtivas] = await Promise.all([
                quadroHorariosService.listar({ curso: cursoId, page: 0, size: 1000 }),
                periodoAtividadeQuadroService.listar({ status: "ATIVO", page: 0, size: 1000 }),
                turmasService.listar({ curso: cursoId, status: "ATIVO", page: 0, size: 1000 }),
            ]);
            setGrades(quadros.content);
            setPeriodos(periodosAtivos.content);
            setTurmas(turmasAtivas.content.filter(t => t.curso.id === cursoId && t.status === "ATIVO"));
        } catch (error) {
            setErro(mensagemErro(error));
            setGrades([]);
        } finally {
            setCarregando(false);
        }
    }, [cursoId]);

    React.useEffect(() => {
        if (!autenticando && cursoId) {
            void Promise.resolve().then(() => carregar());
        }
    }, [autenticando, cursoId, carregar]);

    const filtradas = React.useMemo(() => {
        const b = busca.trim().toLowerCase();
        return (grades ?? []).filter((grade) => {
            const buscaOk = !b || grade.curso.nome.toLowerCase().includes(b) || String(grade.versao).includes(b);
            const versaoOk = !filtroVersao || String(grade.versao) === filtroVersao;
            const dataOk = !filtroData || grade.dataCriacao.slice(0, 10) === filtroData;
            const periodoOk = !filtroPeriodo || String(grade.periodoAtividadeQuadro.id) === filtroPeriodo;
            return buscaOk && versaoOk && dataOk && periodoOk;
        });
    }, [grades, busca, filtroVersao, filtroData, filtroPeriodo]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const pagina = filtradas.slice((paginaSegura - 1) * itensPorPagina, paginaSegura * itensPorPagina);

    function request(dados: GradeFormValues, statusOverride?: Status): QuadroHorarioRequest {
        if (!cursoId) throw new Error("Curso do coordenador não encontrado.");
        return {
            versao: dados.versao,
            status: statusOverride ?? dados.status,
            curso: { id: cursoId },
            turma: { id: dados.turmaId },
            periodoAtividadeQuadro: { id: dados.periodoAtividadeQuadroId },
        };
    }

    async function confirmarCadastro(dados: GradeFormValues) {
        setMutando(true);
        setErro("");
        setErroModal("");
        try {
            const criada = await quadroHorariosService.criar(request(dados, "ATIVO"));
            setCadastrarAberto(false);
            setRecemCriadaId(criada.id);
            setSucesso("Quadro horário cadastrado com sucesso!");
            await carregar();
        } catch (error) {
            setErroModal(mensagemErro(error));
        } finally {
            setMutando(false);
        }
    }

    async function confirmarEdicao(dados: GradeFormValues) {
        if (!selecionada) return;
        setMutando(true);
        setErro("");
        setErroModal("");
        try {
            await quadroHorariosService.atualizar(selecionada.id, request(dados));
            setEditarAberto(false);
            setSelecionada(null);
            setRecemCriadaId(null);
            setSucesso("Quadro horário atualizado com sucesso!");
            await carregar();
        } catch (error) {
            setErroModal(mensagemErro(error));
        } finally {
            setMutando(false);
        }
    }

    async function confirmarCopia(periodoId: number) {
        if (!selecionada?.turma) return;
        setMutando(true);
        setErro("");
        setErroModal("");
        try {
            const copia = await quadroHorariosService.copiar(selecionada.id, {
                versao: selecionada.versao,
                status: "ATIVO",
                curso: { id: selecionada.curso.id },
                turma: { id: selecionada.turma.id },
                periodoAtividadeQuadro: { id: periodoId },
            });
            setCopiarAberto(false);
            setSelecionada(null);
            setRecemCriadaId(copia.id);
            setSucesso("Grade horária copiada com sucesso!");
            await carregar();
        } catch (error) {
            setErroModal(mensagemErro(error));
        } finally {
            setMutando(false);
        }
    }

    async function inativar(grade: QuadroHorarioResponse) {
        if (!window.confirm(`Deseja inativar a grade versão ${String(grade.versao).padStart(2, "0")}?`)) return;
        setMutando(true);
        setErro("");
        try {
            await quadroHorariosService.deletar(grade.id);
            setSucesso("Grade horária inativada com sucesso!");
            await carregar();
        } catch (error) {
            setErro(mensagemErro(error));
        } finally {
            setMutando(false);
        }
    }

    if (autenticando || (carregando && cursoId)) {
        return <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24"><Loader2 className="size-6 animate-spin text-[#0099AA]" /><span className="text-sm text-[#17264D]/70">Carregando quadros horários...</span></div>;
    }

    const erroVisivel = !cursoId
        ? "Seu usuário não possui um curso vinculado. Solicite ao administrador que atualize seu cadastro."
        : erro;

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/coordenador/home" aria-label="Voltar" className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"><ArrowLeft className="size-6" /></Link>
                    <div><h1 className="text-3xl font-bold text-[#17264D]">Quadro Horário</h1><p className="text-sm text-[#17264D]/70">Gerencie os quadros horários do curso {cursoNome}</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-64"><SearchInput placeholder="Pesquisar..." value={busca} onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }} /></div>
                    <Button variant="secondary" size="small" className="gap-2" onClick={() => { setErroModal(""); setCadastrarAberto(true); }} disabled={mutando || !periodos.length}><Plus className="size-5" />Cadastrar</Button>
                </div>
            </div>

            {erroVisivel && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroVisivel}{cursoId && <Button variant="ghost" size="small" onClick={() => void carregar()}>Tentar novamente</Button>}</div>}

            <TableFilters
                fields={[
                    { name: "versao", label: "Versão", type: "input", inputType: "number", min: 0, disableExponent: true },
                    { name: "data", label: "Data de Criação", type: "input", inputType: "date" },
                    { name: "periodo", label: "Período Atividade Quadro", type: "select", placeholder: "Selecione...", width: "w-[220px]", options: [...new Map((grades ?? []).map((g) => [g.periodoAtividadeQuadro.id, { label: nomePeriodo(g.periodoAtividadeQuadro), value: String(g.periodoAtividadeQuadro.id) }])).values()] },
                ]}
                onChange={(f) => { setFiltroVersao(f.versao ?? ""); setFiltroData(f.data ?? ""); setFiltroPeriodo(f.periodo ?? ""); setPaginaAtual(1); }}
            />

            {pagina.length === 0 ? <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">{erroVisivel ? "Não foi possível carregar os quadros horários." : "Nenhum quadro horário encontrado para o curso."}</div> : (
                <DataTable
                    data={pagina}
                    getRowKey={(grade) => grade.id}
                    columns={[
                        { key: "versao", label: "Versão", render: (grade) => String(grade.versao).padStart(2, "0") },
                        { key: "dataCriacao", label: "Data de Criação", render: (grade) => dataBR(grade.dataCriacao) },
                        { key: "curso", label: "Curso Vinculado", render: (grade) => grade.curso.nome },
                        { key: "periodoAtividadeQuadro", label: "Período Atividade Quadro", render: (grade) => nomePeriodo(grade.periodoAtividadeQuadro) },
                        { key: "status", label: "Status", render: (grade) => grade.status === "ATIVO" ? <span className="flex items-center gap-1.5 font-medium text-emerald-600"><CheckCircle2 className="size-4" />Ativo</span> : <span className="flex items-center gap-1.5 font-medium text-[#BA1A1A]"><XCircle className="size-4" />Inativo</span> },
                    ]}
                    actions={[
                        { label: "Ver Grade", icon: <Grid3x3 className="size-[21px]" strokeWidth={2} />, onClick: (grade) => router.push(`${BASE}/${grade.id}`) },
                        { label: "Editar", icon: <Pencil className="size-[21px]" strokeWidth={2} />, onClick: (grade) => { setErroModal(""); setSelecionada(grade); setEditarAberto(true); }, disabled: (grade) => mutando || grade.status === "INATIVO" || !grade.turma },
                        { label: "Copiar", icon: <Copy className="size-[21px]" strokeWidth={2} />, onClick: (grade) => { setErroModal(""); setSelecionada(grade); setCopiarAberto(true); }, disabled: (grade) => mutando || !grade.turma },
                        { label: "Inativar", icon: <Trash2 className="size-[21px]" strokeWidth={2} />, onClick: (grade) => void inativar(grade), disabled: (grade) => mutando || grade.status === "INATIVO" },
                    ]}
                />
            )}

            <Pagination totalItems={filtradas.length} currentPage={paginaSegura} itemsPerPage={itensPorPagina} onPageChange={setPaginaAtual} onItemsPerPageChange={(n) => { setItensPorPagina(n); setPaginaAtual(1); }} />

            <GradeFormModal open={cadastrarAberto} onClose={() => setCadastrarAberto(false)} mode="cadastrar" periodos={periodos} turmas={turmas} cursoNome={cursoNome} onConfirm={(dados) => void confirmarCadastro(dados)} submitting={mutando} errorMessage={erroModal} />
            <GradeFormModal open={editarAberto} onClose={() => { setEditarAberto(false); setSelecionada(null); }} mode="editar" grade={selecionada} periodos={periodos} turmas={turmas} cursoNome={cursoNome} onConfirm={(dados) => void confirmarEdicao(dados)} submitting={mutando} errorMessage={erroModal} />
            <CopiarGradeModal key={copiarAberto ? `copiar-${selecionada?.id ?? "grade"}` : "copiar-fechado"} open={copiarAberto} onClose={() => { setCopiarAberto(false); setSelecionada(null); }} periodos={periodos.filter((periodo) => selecionada?.status !== "ATIVO" || periodo.id !== selecionada.periodoAtividadeQuadro.id)} onConfirm={(periodoId) => void confirmarCopia(periodoId)} submitting={mutando} errorMessage={erroModal} />
            <SucessoGradeModal open={sucesso !== null} onClose={() => { setSucesso(null); setRecemCriadaId(null); }} mensagem={sucesso ?? ""} acao={recemCriadaId ? { label: "VISUALIZAR GRADE", onClick: () => router.push(`${BASE}/${recemCriadaId}`) } : undefined} />
        </div>
    );
}
