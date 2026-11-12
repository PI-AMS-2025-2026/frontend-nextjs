"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CircleCheck, CircleMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

import { gerarProfessoresMock, type Professor } from "@/lib/professores";

export function ProfessoresListagem() {
    const router = useRouter();

    const [professores, setProfessores] = React.useState<Professor[] | null>(null);

    React.useEffect(() => {
        setProfessores(gerarProfessoresMock());
    }, []);

    const [busca, setBusca] = React.useState("");
    const [filtroNome, setFiltroNome] = React.useState("");
    const [filtroEmail, setFiltroEmail] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(6);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const filtrados = React.useMemo(() => {
        if (professores === null) return [];
        const b = busca.trim().toLowerCase();

        return professores.filter((p) => {
            const buscaOk =
                !b ||
                p.nome.toLowerCase().includes(b) ||
                p.email.toLowerCase().includes(b);
            const nomeOk = !filtroNome || p.nome.toLowerCase().includes(filtroNome.toLowerCase());
            const emailOk = !filtroEmail || p.email.toLowerCase().includes(filtroEmail.toLowerCase());
            return buscaOk && nomeOk && emailOk;
        });
    }, [professores, busca, filtroNome, filtroEmail]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicioIndice, inicioIndice + itensPorPagina);

    function limparFiltros() {
        setBusca("");
        setFiltroNome("");
        setFiltroEmail("");
        setPaginaAtual(1);
    }

    if (professores === null) {
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
                        onChange={(e) => {
                            setBusca(e.target.value);
                            setPaginaAtual(1);
                        }}
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
                        onChange={(e) => {
                            setFiltroNome(e.target.value);
                            setPaginaAtual(1);
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">E-mail:</label>
                    <Input
                        placeholder="Filtrar por e-mail"
                        className="w-56"
                        value={filtroEmail}
                        onChange={(e) => {
                            setFiltroEmail(e.target.value);
                            setPaginaAtual(1);
                        }}
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

            {pagina.length === 0 ? (
                <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                    Nenhum professor encontrado.
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto pb-2">
                    <DataTable
                        data={pagina}
                        getRowKey={(p) => p.id}
                        columns={[
                            { key: "nome", label: "Nome", headerClassName: "min-w-[160px]" },
                            { key: "email", label: "E-mail", headerClassName: "min-w-[200px]" },
                            {
                                key: "status",
                                label: "Status",
                                headerClassName: "min-w-[140px]",
                                render: (p) =>
                                    p.status === "Ativo" ? (
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
                totalItems={filtrados.length}
                currentPage={paginaSegura}
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