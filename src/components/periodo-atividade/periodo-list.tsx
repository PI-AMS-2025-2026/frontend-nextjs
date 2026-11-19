
"use client";

import * as React from "react";
import Link from "next/link";

import {
  Plus,
  Pencil,
  ArrowLeft,
  CircleCheck,
  CircleMinus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { TableFilterHead } from "@/components/ui/table-filter-head";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { ApiError } from "@/lib/api";
import { periodoAtividadeQuadroService } from "@/services/periodo-atividade-quadro.service";

import type {
  Status,
  PeriodoAtividadeQuadroRequest,
  PeriodoAtividadeQuadroResponse,
} from "@/types/api";

import {
  formatarData,
  rotuloTipoPeriodo,
} from "./periodo-data";
import { PeriodoModal } from "./periodo-modal";

const PAGE_SIZE_DEFAULT = 10;

function mensagemErro(
  error: unknown,
  fallback: string
) {
  return error instanceof Error
    ? error.message
    : fallback;
}

export function PeriodoList() {
  const [periodos, setPeriodos] = React.useState<
    PeriodoAtividadeQuadroResponse[]
  >([]);

  const [totalPeriodos, setTotalPeriodos] =
    React.useState(0);

  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const [busca, setBusca] = React.useState("");
  const [fPeriodo, setFPeriodo] = React.useState("");
  const [fAno, setFAno] = React.useState("");
  const [fStatus, setFStatus] =
    React.useState<Status | "">("");

  const [itensPorPagina, setItensPorPagina] =
    React.useState(PAGE_SIZE_DEFAULT);

  const [paginaAtual, setPaginaAtual] = React.useState(1);

  const [cadastrarAberto, setCadastrarAberto] =
    React.useState(false);

  const [editarAberto, setEditarAberto] =
    React.useState(false);

  const [selecionada, setSelecionada] =
    React.useState<PeriodoAtividadeQuadroResponse | null>(
      null
    );

  const [sucesso, setSucesso] =
    React.useState<string | null>(null);

  const requisicaoAtual = React.useRef(0);

  const carregarPeriodos = React.useCallback(
    async (pagina = paginaAtual) => {
      const idRequisicao = ++requisicaoAtual.current;

      setLoading(true);
      setErro(null);

      try {
        const resposta =
          await periodoAtividadeQuadroService.listar({
            page: pagina - 1,
            size: itensPorPagina,
            periodo: fPeriodo
              ? Number(fPeriodo)
              : undefined,
            ano: fAno ? Number(fAno) : undefined,
            status: fStatus || undefined,
          });

        if (idRequisicao === requisicaoAtual.current) {
          setPeriodos(resposta.content);
          setTotalPeriodos(resposta.totalElements);
        }
      } catch (error) {
        if (idRequisicao === requisicaoAtual.current) {
          setErro(
            mensagemErro(
              error,
              "Não foi possível carregar os períodos."
            )
          );

          setPeriodos([]);
          setTotalPeriodos(0);
        }
      } finally {
        if (idRequisicao === requisicaoAtual.current) {
          setLoading(false);
        }
      }
    },
    [
      paginaAtual,
      itensPorPagina,
      fPeriodo,
      fAno,
      fStatus,
    ]
  );

  React.useEffect(() => {
    let vivo = true;

    void Promise.resolve().then(() => {
      if (vivo) void carregarPeriodos();
    });

    return () => {
      vivo = false;
      requisicaoAtual.current += 1;
    };
  }, [carregarPeriodos]);

  React.useEffect(() => {
    if (!sucesso) return;

    const timer = setTimeout(() => {
      setSucesso(null);
    }, 1800);

    return () => clearTimeout(timer);
  }, [sucesso]);

  async function salvarPeriodo(
    dados: PeriodoAtividadeQuadroRequest,
    modo: "criar" | "editar"
  ) {
    try {
      if (modo === "criar") {
        await periodoAtividadeQuadroService.criar(dados);

        setCadastrarAberto(false);
        setSucesso("Período atividade quadro cadastrado com sucesso!");
      } else if (selecionada) {
        await periodoAtividadeQuadroService.atualizar(
          selecionada.id,
          dados
        );

        setEditarAberto(false);
        setSelecionada(null);
        setSucesso("Período atividade quadro editado com sucesso!");
      } else {
        return;
      }

      if (paginaAtual !== 1) {
        setPaginaAtual(1);
      } else {
        await carregarPeriodos(1);
      }
    } catch (error) {
      const fallback =
        modo === "criar"
          ? "Não foi possível cadastrar o período atividade quadro."
          : "Não foi possível editar o período atividade quadro.";

      throw new Error(
        error instanceof ApiError
          ? error.message
          : mensagemErro(error, fallback)
      );
    }
  }

  const periodosFiltrados = React.useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) return periodos;

    return periodos.filter((item) => {
      return (
        String(item.id).includes(texto) ||
        String(item.periodo).includes(texto) ||
        String(item.ano).includes(texto) ||
        formatarData(item.dataInicio).includes(texto) ||
        formatarData(item.dataFim).includes(texto) ||
        rotuloTipoPeriodo(
          item.tipoPeridoAtividadeQuadro
        )
          .toLowerCase()
          .includes(texto) ||
        item.status.toLowerCase().includes(texto)
      );
    });
  }, [periodos, busca]);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
      {/* CABEÇALHO */}
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
            <h1 className="text-3xl font-bold text-[#17264D]">
              Listagem de Períodos Atividade Quadro
            </h1>

            <p className="text-sm text-[#17264D]/70">
              Gerencie os períodos de atividade da instituição
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchInput
              placeholder="Pesquisar..."
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value);
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

      {/* FILTROS */}
      <TableFilters
        fields={[
          {
            name: "periodo",
            label: "Período",
            type: "input",
            inputType: "number",
            placeholder: "Número do período",
            width: "w-[190px]",
          },
          {
            name: "ano",
            label: "Ano",
            type: "input",
            inputType: "number",
            placeholder: "Ex.: 2026",
            width: "w-[150px]",
          },
        ]}
        onChange={(filters) => {
          setFPeriodo(filters.periodo ?? "");
          setFAno(filters.ano ?? "");
          setPaginaAtual(1);
        }}
        onClear={() => {
          setFStatus("");
          setBusca("");
          setPaginaAtual(1);
        }}
      />

      {/* ERROS */}
      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]"
        >
          <span>{erro}</span>

          <Button
            variant="ghost"
            size="small"
            onClick={() => void carregarPeriodos()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* TABELA */}
      {loading ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-3 py-24"
          role="status"
        >
          <Loader2 className="size-6 animate-spin text-[#0099AA]" />

          <span className="text-sm text-[#17264D]/70">
            Carregando períodos...
          </span>
        </div>
      ) : (
        <div className="min-w-0 pb-2">
          <DataTable
            data={periodosFiltrados}
            getRowKey={(periodo) => periodo.id}
            emptyMessage="Nenhum período encontrado."
            columns={[
              {
                key: "id",
                label: "ID",
                headerClassName: "min-w-[60px]",
              },
              {
                key: "periodo",
                label: "Período",
                headerClassName: "min-w-[90px]",
                render: (item) =>
                  String(item.periodo).padStart(2, "0"),
              },
              {
                key: "ano",
                label: "Ano",
                headerClassName: "min-w-[80px]",
              },
              {
                key: "dataInicio",
                label: "Data de início",
                headerClassName: "min-w-[130px]",
                render: (item) =>
                  formatarData(item.dataInicio),
              },
              {
                key: "dataFim",
                label: "Data de término",
                headerClassName: "min-w-[140px]",
                render: (item) =>
                  formatarData(item.dataFim),
              },
              {
                key: "tipoPeridoAtividadeQuadro",
                label: "Tipo período",
                headerClassName: "min-w-[130px]",
                render: (item) =>
                  rotuloTipoPeriodo(
                    item.tipoPeridoAtividadeQuadro
                  ),
              },
              {
                key: "status",
                label: (
                  <TableFilterHead
                    label="Status"
                    value={fStatus}
                    onChange={(status) => {
                      setFStatus(status as Status | "");
                      setPaginaAtual(1);
                    }}
                    options={[
                      {
                        label: "Ativo",
                        value: "ATIVO",
                      },
                      {
                        label: "Inativo",
                        value: "INATIVO",
                      },
                    ]}
                  />
                ),
                headerClassName: "min-w-[130px]",
                render: (item) =>
                  item.status === "ATIVO" ? (
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
            actions={[
              {
                label: "Editar",
                icon: (
                  <Pencil
                    className="size-[21px]"
                    strokeWidth={2}
                  />
                ),
                onClick: (periodo) => {
                  setSelecionada(periodo);
                  setEditarAberto(true);
                },
              },
            ]}
          />
        </div>
      )}

      {/* PAGINAÇÃO */}
      <Pagination
        totalItems={totalPeriodos}
        currentPage={paginaAtual}
        itemsPerPage={itensPorPagina}
        onPageChange={setPaginaAtual}
        onItemsPerPageChange={(quantidade) => {
          setItensPorPagina(quantidade);
          setPaginaAtual(1);
        }}
      />

      {/* CADASTRAR */}
      <PeriodoModal
        open={cadastrarAberto}
        mode="cadastrar"
        onClose={() => setCadastrarAberto(false)}
        onConfirm={(dados) =>
          salvarPeriodo(dados, "criar")
        }
      />

      {/* EDITAR */}
      <PeriodoModal
        open={editarAberto}
        mode="editar"
        periodo={selecionada}
        onClose={() => {
          setEditarAberto(false);
          setSelecionada(null);
        }}
        onConfirm={(dados) =>
          salvarPeriodo(dados, "editar")
        }
      />

      {/* SUCESSO */}
      <Modal
        open={sucesso !== null}
        onClose={() => setSucesso(null)}
        type="success"
        message={sucesso ?? ""}
      />
    </div>
  );
}
