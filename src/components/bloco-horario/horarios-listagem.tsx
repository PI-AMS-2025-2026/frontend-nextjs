"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { HorarioFormModal } from "./horarios-form-modal";
import { ExcluirHorarioModal } from "./excluir-horario-modal";
import { blocoHorariosService } from "@/services/bloco-horarios.service";
import type { BlocoHorarioResponse, PageResponse } from "@/types/api";
import { ApiError } from "@/lib/api";

function formatarHorario(horario: string | null | undefined): string {
  if (!horario) return "-";
  return horario.slice(0, 5);
}

export function HorariosListagem() {
  const [pageData, setPageData] = React.useState<
    PageResponse<BlocoHorarioResponse>
  >({
    content: [],
    page: 0,
    size: 6,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [busca, setBusca] = React.useState("");
  const [filtroInicio, setFiltroInicio] = React.useState("");
  const [filtroFim, setFiltroFim] = React.useState("");
  const [itensPorPagina, setItensPorPagina] = React.useState(6);
  const [paginaAtual, setPaginaAtual] = React.useState(1);
  const [cadastrarAberto, setCadastrarAberto] = React.useState(false);
  const [editarAberto, setEditarAberto] = React.useState(false);
  const [excluirAberto, setExcluirAberto] = React.useState(false);
  const [selecionado, setSelecionado] =
    React.useState<BlocoHorarioResponse | null>(null);
  const [sucesso, setSucesso] = React.useState<string | null>(null);
  const [vinculosExclusao, setVinculosExclusao] = React.useState<{
    alocacoes: number;
    disponibilidades: number;
  } | null>(null);

  const carregarHorarios = React.useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await blocoHorariosService.listar({
        page: paginaAtual - 1,
        size: itensPorPagina,
        hora_inicio: filtroInicio || undefined,
        hora_fim: filtroFim || undefined,
      });
      setPageData(res);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os blocos de horário.",
      );
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, itensPorPagina, filtroInicio, filtroFim]);

  React.useEffect(() => {
    let vivo = true;
    void Promise.resolve().then(() => {
      if (vivo) void carregarHorarios();
    });
    return () => {
      vivo = false;
    };
  }, [carregarHorarios]);

  React.useEffect(() => {
    if (!sucesso) return;
    const timer = setTimeout(() => setSucesso(null), 1800);
    return () => clearTimeout(timer);
  }, [sucesso]);

  async function confirmarCadastro(dados: {
    horaInicio: string;
    horaFim: string;
  }) {
    try {
      await blocoHorariosService.criar(dados);
      setCadastrarAberto(false);
      setSucesso("Bloco de horário cadastrado com sucesso!");
      void carregarHorarios();
    } catch (err) {
      throw new Error(
        err instanceof ApiError
          ? err.message
          : "Não foi possível cadastrar o bloco de horário.",
      );
    }
  }

  async function confirmarEdicao(dados: {
    horaInicio: string;
    horaFim: string;
  }) {
    if (!selecionado) return;
    try {
      await blocoHorariosService.atualizar(selecionado.id, dados);
      setEditarAberto(false);
      setSelecionado(null);
      setSucesso("Bloco de horário editado com sucesso!");
      void carregarHorarios();
    } catch (err) {
      throw new Error(
        err instanceof ApiError
          ? err.message
          : "Não foi possível editar o bloco de horário.",
      );
    }
  }

  async function confirmarExclusao() {
    if (!selecionado) return;
    try {
      await blocoHorariosService.deletar(selecionado.id, vinculosExclusao !== null);
      setExcluirAberto(false);
      setSelecionado(null);
      setVinculosExclusao(null);
      setErro(null);
      setSucesso("Bloco de horário excluído com sucesso!");
      void carregarHorarios();
    } catch (err) {
      const data = err instanceof ApiError
        ? err.data as { code?: string; allocationCount?: number; availabilityCount?: number } | undefined
        : undefined;
      if (data?.code === "BLOCO_HORARIO_COM_VINCULOS") {
        setVinculosExclusao({
          alocacoes: data.allocationCount ?? 0,
          disponibilidades: data.availabilityCount ?? 0,
        });
        return;
      }
      setExcluirAberto(false);
      setSelecionado(null);
      setVinculosExclusao(null);
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir o bloco de horário.",
      );
    }
  }

  const exibidos = React.useMemo(() => {
    if (!busca.trim()) return pageData.content;
    const b = busca.trim();
    return pageData.content.filter(
      (h) => h.horaInicio.includes(b) || h.horaFim.includes(b),
    );
  }, [pageData.content, busca]);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#17264D] sm:text-3xl">
            Blocos de Horário
          </h1>
          <p className="text-sm text-[#17264D]/70">
            Gerencie os blocos de horário da instituição
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Pesquisar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
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

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]"
        >
          <span>{erro}</span>
          <Button
            variant="ghost"
            size="small"
            onClick={() => void carregarHorarios()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      <TableFilters
        fields={[
          {
            name: "inicio",
            label: "Horário Início",
            type: "input",
            inputType: "time",
          },
          {
            name: "fim",
            label: "Horário Término",
            type: "input",
            inputType: "time",
          },
        ]}
        onChange={(f) => {
          setFiltroInicio(f.inicio ?? "");
          setFiltroFim(f.fim ?? "");
          setPaginaAtual(1);
        }}
      />

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="size-6 animate-spin text-[#0099AA]" />
          <span className="text-sm text-[#17264D]/70">
            Carregando blocos de horário...
          </span>
        </div>
      ) : exibidos.length === 0 ? (
        <div className="rounded-[10px] border border-[#C8CDD2] py-10 text-center text-sm text-[#17264D]/70">
          Nenhum bloco de horário encontrado.
        </div>
      ) : (
        <DataTable
          data={exibidos}
          getRowKey={(h) => h.id}
          columns={[
            {
              key: "horaInicio",
              label: "Início",
              render: (h) => formatarHorario(h.horaInicio),
            },
            {
              key: "horaFim",
              label: "Término",
              render: (h) => formatarHorario(h.horaFim),
            },
            {
              key: "duracao",
              label: "Duração (min)",
              render: (h) => (h.duracao ? `${h.duracao} min` : "-"),
            },
          ]}
          actions={[
            {
              label: "Editar",
              icon: <Pencil className="size-[21px]" strokeWidth={2} />,
              onClick: (h) => {
                setSelecionado(h);
                setEditarAberto(true);
              },
            },
            {
              label: "Excluir",
              icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
              className: "text-[#BA1A1A] hover:bg-red-50",
              onClick: (h) => {
                setSelecionado(h);
                setExcluirAberto(true);
              },
            },
          ]}
        />
      )}

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

      <HorarioFormModal
        open={cadastrarAberto}
        onClose={() => setCadastrarAberto(false)}
        mode="cadastrar"
        onConfirm={confirmarCadastro}
      />
      <HorarioFormModal
        open={editarAberto}
        onClose={() => {
          setEditarAberto(false);
          setSelecionado(null);
        }}
        mode="editar"
        horario={selecionado}
        onConfirm={confirmarEdicao}
      />
      <ExcluirHorarioModal
        open={excluirAberto}
        onClose={() => {
          setExcluirAberto(false);
          setSelecionado(null);
          setVinculosExclusao(null);
        }}
        onConfirm={confirmarExclusao}
        alocacoesVinculadas={vinculosExclusao?.alocacoes ?? null}
        disponibilidadesVinculadas={vinculosExclusao?.disponibilidades ?? null}
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
