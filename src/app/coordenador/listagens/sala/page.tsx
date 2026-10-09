"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, SearchIcon, WrenchIcon, Loader2 } from "lucide-react";

import { salasService } from "@/services/salas.service";
import { recursoSalaService } from "@/services/recurso-sala.service";
import type { SalaResponse, RecursoSalaResponse, PageResponse } from "@/types/api";

export default function SalasCoordenadorPage() {
  const router = useRouter();

  // -- Filtros --
  const [busca, setBusca] = useState("");
  const [filtroCapacidade, setFiltroCapacidade] = useState("");

  // -- Paginação --
  const [itensPorPagina, setItensPorPagina] = useState(6);
  const [paginaAtual, setPaginaAtual] = useState(1);

  // -- Modal de detalhes (Ver Recursos) --
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [salaDetalhe, setSalaDetalhe] = useState<SalaResponse | null>(null);
  const [recursosSala, setRecursosSala] = useState<RecursoSalaResponse[]>([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);

  // Estado da API
  const [pageData, setPageData] = useState<PageResponse<SalaResponse>>({
    content: [],
    page: 0,
    size: 6,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const carregarSalas = useCallback(async () => {
    setLoading(true);
    try {
      const capNum = filtroCapacidade ? Number(filtroCapacidade) : undefined;
      const res = await salasService.listar({
        page: paginaAtual - 1,
        size: itensPorPagina,
        capacidade: isNaN(capNum!) ? undefined : capNum,
      });
      setPageData(res);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, itensPorPagina, filtroCapacidade]);

  useEffect(() => {
    carregarSalas();
  }, [carregarSalas]);

  function abrirModalDetalhes(sala: SalaResponse) {
    setSalaDetalhe(sala);
    setModalDetalhesAberto(true);
    setLoadingRecursos(true);
    recursoSalaService
      .listar({ salaId: sala.id })
      .then((res) => setRecursosSala(res?.content || []))
      .catch((err) => console.error("Erro ao carregar recursos:", err))
      .finally(() => setLoadingRecursos(false));
  }

  const salasFiltradas = pageData.content.filter((s) => {
    if (!busca.trim()) return true;
    const b = busca.toLowerCase();
    return (
      s.codigo.toLowerCase().includes(b) ||
      s.tipoSala?.nome?.toLowerCase().includes(b) ||
      String(s.capacidade).includes(b)
    );
  });

  function limparFiltros() {
    setBusca("");
    setFiltroCapacidade("");
    setPaginaAtual(1);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between border-b border-[#AAC1C9]/40 bg-white px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="small"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="h-9 w-9 p-0 text-[#17264D] hover:bg-[#F1FBFD]"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#17264D]">Salas</h1>
        </div>

        <div className="relative flex w-80 items-center">
          <SearchIcon className="absolute left-3 h-4 w-4 text-[#AAC1C9]" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
            }}
            className="h-9 w-full rounded-md border-[#AAC1C9] bg-white pl-9 text-sm text-[#17264D] placeholder:text-[#AAC1C9] focus-visible:ring-[#0099AA]"
          />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mb-6 rounded-lg border border-[#AAC1C9]/40 bg-[#F1FBFD] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label htmlFor="filtroCapacidade" className="text-xs font-semibold text-[#17264D]">
                Capacidade
              </Label>
              <Input
                id="filtroCapacidade"
                placeholder="Ex: 40"
                value={filtroCapacidade}
                onChange={(e) => {
                  setFiltroCapacidade(e.target.value);
                  setPaginaAtual(1);
                }}
                className="mt-1 h-9 border-[#AAC1C9] bg-white text-sm text-[#17264D]"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                size="small"
                onClick={limparFiltros}
                className="h-9 w-full border border-[#AAC1C9] text-xs font-semibold text-[#17264D] hover:bg-[#AAC1C9]/20"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#AAC1C9]/40 bg-white">
          {loading ? (
            <div className="flex h-32 items-center justify-center gap-2 text-[#17264D]/60">
              <Loader2 className="h-5 w-5 animate-spin text-[#0099AA]" />
              <span>Carregando salas...</span>
            </div>
          ) : salasFiltradas.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-[#17264D]/60">
              Nenhuma sala encontrada.
            </div>
          ) : (
            <DataTable
              data={salasFiltradas}
              getRowKey={(sala) => sala.id}
              columns={[
                { key: "codigo", label: "Código" },
                {
                  key: "capacidade",
                  label: "Capacidade",
                  render: (sala) => `${sala.capacidade} alunos`,
                },
                {
                  key: "tipoSala",
                  label: "Tipo",
                  render: (sala) => sala.tipoSala?.nome || "-",
                },
              ]}
              actions={[
                {
                  label: "Ver Recursos",
                  icon: <WrenchIcon className="h-4 w-4" />,
                  onClick: (sala) => abrirModalDetalhes(sala),
                },
              ]}
            />
          )}
        </div>

        <Pagination
          totalItems={pageData.totalElements}
          currentPage={paginaAtual}
          itemsPerPage={itensPorPagina}
          onPageChange={setPaginaAtual}
          onItemsPerPageChange={(n) => {
            setItensPorPagina(n);
            setPaginaAtual(1);
          }}
        />
      </main>

      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#17264D]">
              Recursos — {salaDetalhe?.codigo}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <p className="text-xs text-[#17264D]/70">
              Tipo: <span className="font-semibold">{salaDetalhe?.tipoSala?.nome}</span> | Capacidade:{" "}
              <span className="font-semibold">{salaDetalhe?.capacidade}</span>
            </p>
            <hr className="border-[#AAC1C9]/30" />
            {loadingRecursos ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-[#0099AA]" />
              </div>
            ) : recursosSala.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#17264D]/60">
                Nenhum recurso cadastrado nesta sala.
              </p>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {recursosSala.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-[#AAC1C9]/30 bg-[#F1FBFD] p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#17264D]">{item.recurso?.nome}</p>
                      <p className="text-[#17264D]/60">{item.recurso?.tipo?.nome}</p>
                    </div>
                    <span className="rounded-full bg-[#0099AA] px-2.5 py-1 text-xs font-semibold text-white">
                      {item.quantidade}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
