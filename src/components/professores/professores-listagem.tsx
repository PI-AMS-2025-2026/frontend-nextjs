"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CircleCheck, CircleMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

import { professoresService } from "@/services/professores.service";
import { ApiError } from "@/lib/api";
import type { ProfessorResponse } from "@/types/api";

export function ProfessoresListagem() {
    const router = useRouter();

    const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
    const [carregando, setCarregando] = React.useState(true);
    const [primeiraCarga, setPrimeiraCarga] = React.useState(true);
    const [erroCarregamento, setErroCarregamento] = React.useState<string | null>(null);
    const [totalElementos, setTotalElementos] = React.useState(0);

    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroEmail, setFiltroEmail] = React.useState("");

    const [nomeDebounced, setNomeDebounced] = React.useState("");
    const [emailDebounced, setEmailDebounced] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    React.useEffect(() => {
        const t = setTimeout(() => {
            setNomeDebounced(filtroNome || busca);
            setEmailDebounced(filtroEmail);
            setPaginaAtual(1);
        }, 400);
        return () => clearTimeout(t);
    }, [busca, filtroNome, filtroEmail]);

    const carregarProfessores = React.useCallback(() => {
        setCarregando(true);
        setErroCarregamento(null);

        professoresService
            .listar({
                page: paginaAtual - 1,
                size: itensPorPagina,
                nome: nomeDebounced || undefined,
                email: emailDebounced || undefined,
            })
            .then((resposta) => {
                setProfessores(resposta.content);
                setTotalElementos(resposta.totalElements);
            })
            .catch((e) => {
                setErroCarregamento(e instanceof ApiError ? e.message : "Erro ao carregar professores.");
                setProfessores([]);
                setTotalElementos(0);
            })
            .finally(() => {
                setCarregando(false);
                setPrimeiraCarga(false);
            });
    }, [paginaAtual, itensPorPagina, nomeDebounced, emailDebounced]);

    React.useEffect(() => {
        carregarProfessores();
    }, [carregarProfessores]);

    function limparFiltros() {
        setBusca("");
        setFiltroNome("");
        setFiltroEmail("");
        setPaginaAtual(1);
    }

    if (primeiraCarga) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando professores...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        aria-label="Voltar"
                        className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                    >
                        <ArrowLeft className="size-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#17264D]">Professores</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Gerencie os professores da instituição
                        </p>
                    </div>
                </div>

                <div className="w-64">
                    <SearchInput
                        placeholder="Pesquisar..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-4 rounded-[10px] border border-[#C8CDD2] bg-[#EAF6FB] px-4 py-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Nome:</label>
                    <Input
                        placeholder="Filtrar por nome"
                        className="w-56"
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">E-mail:</label>
                    <Input
                        placeholder="Filtrar por e-mail"
                        className="w-56"
                        value={filtroEmail}
                        onChange={(e) => setFiltroEmail(e.target.value)}
                    />
                </div>

                <Button
                    variant="secondary"
                    size="small"
                    className="ml-auto"
                    onClick={limparFiltros}
                >
                    Limpar filtros
                </Button>
            </div>

            {erroCarregamento && (
                <div className="rounded-[10px] border border-[#BA1A1A] py-3 text-center text-sm text-[#BA1A1A]">
                    {erroCarregamento}
                </div>
            )}

            {professores.length === 0 && !erroCarregamento ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhum professor encontrado.
                </div>
            ) : (
                <div className={`min-w-0 overflow-x-auto pb-2 transition-opacity ${carregando ? "pointer-events-none opacity-60" : ""}`}>
                    <DataTable
                        data={professores}
                        getRowKey={(p) => p.id}
                        columns={[
                            { key: "nome", label: "Nome", headerClassName: "min-w-[160px]" },
                            { key: "email", label: "E-mail", headerClassName: "min-w-[200px]" },
                            {
                                key: "status",
                                label: "Status",
                                headerClassName: "min-w-[140px]",
                                render: (p) =>
                                    p.status === "ATIVO" ? (
                                        <span className="inline-flex items-center gap-2 font-medium text-[#13B900]">
                                            <CircleCheck className="size-4" />
                                            Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 font-medium text-[#BA1A1A]">
                                            <CircleMinus className="size-4" />
                                            Inativo
                                        </span>
                                    ),
                            },
                        ]}
                    />
                </div>
            )}

            <Pagination
                totalItems={totalElementos}
                currentPage={paginaAtual}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={(n) => {
                    setItensPorPagina(n);
                    setPaginaAtual(1);
                }}
            />
        </div>
    );
}