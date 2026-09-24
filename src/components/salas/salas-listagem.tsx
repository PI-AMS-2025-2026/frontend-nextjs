"use client";

import * as React from "react";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";

import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";

import { SalaRecursosModal } from "@/components/salas/sala-recursos-modal";
import { gerarSalasMock, type Sala } from "@/lib/salas";

export function SalasListagem() {
    const [salas] = React.useState<Sala[]>(() => gerarSalasMock());

    const [busca, setBusca] = React.useState("");
    const [fCodigo, setFCodigo] = React.useState("");
    const [fCapacidade, setFCapacidade] = React.useState("");
    const [fTipo, setFTipo] = React.useState("");

    const [itensPorPagina, setItensPorPagina] = React.useState(10);
    const [paginaAtual, setPaginaAtual] = React.useState(1);

    const [detalhesAberto, setDetalhesAberto] = React.useState(false);
    const [salaDetalhe, setSalaDetalhe] = React.useState<Sala | null>(null);

    const filtradas = React.useMemo(() => {
        const b = busca.trim().toLowerCase();

        return salas.filter((s) => {
            const buscaOk =
                !b ||
                s.codigo.toLowerCase().includes(b) ||
                s.tipo.toLowerCase().includes(b) ||
                String(s.capacidade).includes(b);
            const codigoOk = !fCodigo || s.codigo.toLowerCase().includes(fCodigo.toLowerCase());
            const capacidadeOk = !fCapacidade || String(s.capacidade).includes(fCapacidade);
            const tipoOk = !fTipo || s.tipo.toLowerCase().includes(fTipo.toLowerCase());
            return buscaOk && codigoOk && capacidadeOk && tipoOk;
        });
    }, [salas, busca, fCodigo, fCapacidade, fTipo]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioIndice = (paginaSegura - 1) * itensPorPagina;
    const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

    function abrirDetalhes(sala: Sala) {
        setSalaDetalhe(sala);
        setDetalhesAberto(true);
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
                        <h1 className="text-3xl font-bold text-[#17264D]">Salas</h1>
                        <p className="text-sm text-[#17264D]/70">
                            Visualize as salas da instituição
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

            <TableFilters
                fields={[
                    { name: "codigo", label: "Código", type: "text", placeholder: "Digite aqui..." },
                    { name: "capacidade", label: "Capacidade", type: "text", placeholder: "Digite aqui..." },
                    { name: "tipo", label: "Tipo", type: "text", placeholder: "Digite aqui..." },
                ]}
                onChange={(f) => {
                    setFCodigo(f.codigo ?? "");
                    setFCapacidade(f.capacidade ?? "");
                    setFTipo(f.tipo ?? "");
                    setPaginaAtual(1);
                }}
            />

            <div className="min-w-0 overflow-x-auto pb-2">
                <DataTable
                    data={pagina}
                    className={pagina.length === 0 ? "rounded-b-none border-b-0" : undefined}
                    getRowKey={(s) => s.id}
                    columns={[
                        { key: "codigo", label: "Código", headerClassName: "min-w-[120px]" },
                        { key: "capacidade", label: "Capacidade", headerClassName: "min-w-[120px]" },
                        { key: "tipo", label: "Tipo", headerClassName: "min-w-[160px]" },
                    ]}
                    actions={[
                        {
                            label: "Ver Recursos",
                            icon: <Wrench className="size-[21px]" strokeWidth={2} />,
                            onClick: (s) => abrirDetalhes(s),
                        },
                    ]}
                />

                {pagina.length === 0 && (
                    <div className="rounded-b-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
                        Nenhuma sala encontrada.
                    </div>
                )}
            </div>

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

            <SalaRecursosModal
                open={detalhesAberto}
                onClose={() => {
                    setDetalhesAberto(false);
                    setSalaDetalhe(null);
                }}
                sala={salaDetalhe}
            />
        </div>
    );
}
