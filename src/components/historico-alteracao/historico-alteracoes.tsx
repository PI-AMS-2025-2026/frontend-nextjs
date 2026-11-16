"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
} from "lucide-react";

import { historicosAlteracoesService } from "@/services/historicos-alteracoes.service";
import type { HistoricoVersaoAlocacaoResponse } from "@/types/api";

type Coluna = "usuario" | "dataAlteracao" | "campoAlterado" | "valorAntigo" | "valorNovo" | "alocacao";
type Ordenacao = { coluna: Coluna; direcao: "asc" | "desc" } | null;

const PAGE_SIZE = 100;

const colunas: { chave: Coluna; titulo: string; largura: string }[] = [
  { chave: "usuario", titulo: "Usuário", largura: "170px" },
  { chave: "dataAlteracao", titulo: "Data", largura: "125px" },
  { chave: "campoAlterado", titulo: "Campo alterado", largura: "160px" },
  { chave: "valorAntigo", titulo: "Valor anterior", largura: "150px" },
  { chave: "valorNovo", titulo: "Valor atual", largura: "150px" },
  { chave: "alocacao", titulo: "Alocação", largura: "260px" },
];

function dataFormatada(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  if (!ano || !mes || !dia) return data;
  return new Intl.DateTimeFormat("pt-BR").format(new Date(ano, mes - 1, dia));
}

function descricaoAlocacao(item: HistoricoVersaoAlocacaoResponse) {
  const alocacao = item.alocacao;
  return [
    alocacao.disciplina?.nome,
    alocacao.turma?.codigo,
    alocacao.sala?.codigo ? `Sala ${alocacao.sala.codigo}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ") || `Alocação #${alocacao.id}`;
}

function valorOrdenacao(item: HistoricoVersaoAlocacaoResponse, coluna: Coluna) {
  switch (coluna) {
    case "usuario": return item.usuario.nome;
    case "dataAlteracao": return item.dataAlteracao;
    case "campoAlterado": return item.campoAlterado;
    case "valorAntigo": return item.valorAntigo ?? "";
    case "valorNovo": return item.valorNovo ?? "";
    case "alocacao": return descricaoAlocacao(item);
  }
}

export function HistoricoAlteracoes() {
  const [historicos, setHistoricos] = React.useState<HistoricoVersaoAlocacaoResponse[]>([]);
  const [busca, setBusca] = React.useState("");
  const [itensPorPagina, setItensPorPagina] = React.useState(8);
  const [paginaAtual, setPaginaAtual] = React.useState(1);
  const [ordenacao, setOrdenacao] = React.useState<Ordenacao>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState("");

  React.useEffect(() => {
    let cancelado = false;

    async function carregarHistorico() {
      setCarregando(true);
      setErro("");
      try {
        const primeiraPagina = await historicosAlteracoesService.listar({ page: 0, size: PAGE_SIZE });
        const registros = [...primeiraPagina.content];

        for (let page = 1; page < primeiraPagina.totalPages; page += 1) {
          const resposta = await historicosAlteracoesService.listar({ page, size: PAGE_SIZE });
          registros.push(...resposta.content);
        }

        if (!cancelado) setHistoricos(registros);
      } catch (error) {
        console.error("Erro ao carregar histórico de alterações:", error);
        if (!cancelado) setErro("Não foi possível carregar o histórico. Tente novamente.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregarHistorico();
    return () => { cancelado = true; };
  }, []);

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    let resultado = historicos.filter((item) => {
      const valores = [
        item.usuario.nome,
        item.dataAlteracao,
        dataFormatada(item.dataAlteracao),
        item.campoAlterado,
        item.valorAntigo ?? "",
        item.valorNovo ?? "",
        descricaoAlocacao(item),
      ];
      return valores.some((valor) => valor.toLocaleLowerCase("pt-BR").includes(termo));
    });

    if (ordenacao) {
      resultado = [...resultado].sort((a, b) => {
        const comparacao = valorOrdenacao(a, ordenacao.coluna).localeCompare(
          valorOrdenacao(b, ordenacao.coluna),
          "pt-BR",
          { numeric: true, sensitivity: "base" },
        );
        return ordenacao.direcao === "asc" ? comparacao : -comparacao;
      });
    }
    return resultado;
  }, [busca, historicos, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * itensPorPagina;
  const registrosPagina = filtrados.slice(inicio, inicio + itensPorPagina);
  const primeiroRegistro = filtrados.length === 0 ? 0 : inicio + 1;
  const ultimoRegistro = Math.min(inicio + itensPorPagina, filtrados.length);

  function ordenar(coluna: Coluna) {
    setOrdenacao((atual) => ({
      coluna,
      direcao: atual?.coluna === coluna && atual.direcao === "asc" ? "desc" : "asc",
    }));
    setPaginaAtual(1);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-150px)] w-full max-w-[1180px] flex-col px-6 py-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/adminstrador/home"
            aria-label="Voltar"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#17264D] transition-colors hover:bg-[#F2F2F2]"
          >
            <ArrowLeft className="size-6" />
          </Link>
          <div>
            <h1 className="text-[26px] font-bold leading-tight text-[#171717]">Histórico de alterações</h1>
            <p className="text-[12px] text-[#555]">Consulte as alterações realizadas nas alocações</p>
          </div>
        </div>

        <div className="relative w-full sm:w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#555]" />
          <input
            type="search"
            value={busca}
            onChange={(event) => {
              setBusca(event.target.value);
              setPaginaAtual(1);
            }}
            placeholder="Pesquisar..."
            aria-label="Pesquisar no histórico"
            className="h-9 w-full rounded-[9px] border border-[#AEB4B8] bg-[#F2F2F2] pl-9 pr-3 text-xs text-[#171717] outline-none transition focus:border-[#0099AA] focus:bg-white"
          />
        </div>
      </div>

      {erro && <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div className="w-full overflow-x-auto rounded-[9px] border border-[#D0D4D8]">
        <table className="w-full min-w-[1015px] table-fixed border-collapse">
          <colgroup>
            {colunas.map((coluna) => <col key={coluna.chave} style={{ width: coluna.largura }} />)}
          </colgroup>
          <thead>
            <tr className="h-[38px] bg-[#3199A9] text-white">
              {colunas.map((coluna) => {
                const ativa = ordenacao?.coluna === coluna.chave;
                return (
                  <th
                    key={coluna.chave}
                    className="px-3 text-left text-[11px] font-semibold"
                    aria-sort={ativa ? (ordenacao.direcao === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button
                      type="button"
                      onClick={() => ordenar(coluna.chave)}
                      className="inline-flex max-w-full items-center gap-1 whitespace-nowrap outline-none hover:text-white/80"
                      aria-label={`Ordenar por ${coluna.titulo}`}
                    >
                      {coluna.titulo}
                      {ativa && ordenacao.direcao === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className={`size-3 ${ativa ? "" : "opacity-70"}`} />}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={colunas.length} className="h-24 text-center text-sm text-[#6B7280]"><span className="inline-flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" />Carregando histórico...</span></td></tr>
            ) : registrosPagina.map((item, index) => (
              <tr key={item.id} className={`h-[37px] border-b border-[#D5D9DC] last:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-[#F0F0F0]"}`}>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={item.usuario.nome}>{item.usuario.nome}</td>
                <td className="whitespace-nowrap px-3 text-[11px] text-[#171717]">{dataFormatada(item.dataAlteracao)}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={item.campoAlterado}>{item.campoAlterado}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={item.valorAntigo ?? "—"}>{item.valorAntigo || "—"}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={item.valorNovo ?? "—"}>{item.valorNovo || "—"}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={descricaoAlocacao(item)}>{descricaoAlocacao(item)}</td>
              </tr>
            ))}
            {!carregando && registrosPagina.length === 0 && (
              <tr><td colSpan={colunas.length} className="h-24 text-center text-sm text-[#6B7280]">{erro ? "Não foi possível exibir os registros." : busca ? "Nenhum registro encontrado para esta pesquisa." : "Nenhuma alteração registrada."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#171717]">
        <label className="flex h-8 items-center overflow-hidden rounded-md border border-[#D0D7DB] bg-white">
          <span className="px-3 whitespace-nowrap">Itens por página:</span>
          <select
            value={itensPorPagina}
            onChange={(event) => {
              setItensPorPagina(Number(event.target.value));
              setPaginaAtual(1);
            }}
            className="h-full w-10 border-l border-[#D0D7DB] bg-white text-center outline-none"
            aria-label="Itens por página"
          >
            {[8, 10, 15, 20, 30].map((quantidade) => <option key={quantidade} value={quantidade}>{quantidade}</option>)}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPaginaAtual(1)} disabled={paginaSegura === 1} aria-label="Primeira página" className="flex size-8 items-center justify-center rounded-md border border-[#9FC8D1] bg-[#A8DCE5] disabled:opacity-40"><ChevronsLeft className="size-4" /></button>
          <button type="button" onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1} aria-label="Página anterior" className="flex size-8 items-center justify-center rounded-md border border-[#9FC8D1] bg-[#A8DCE5] disabled:opacity-40"><ChevronLeft className="size-4" /></button>
          <span className="flex h-8 min-w-[125px] items-center justify-center rounded-md border border-[#82C4D0] bg-[#9DD5DF] px-3 tabular-nums">Página {paginaSegura} de {totalPaginas}</span>
          <button type="button" onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} aria-label="Próxima página" className="flex size-8 items-center justify-center rounded-md border border-[#9FC8D1] bg-[#A8DCE5] disabled:opacity-40"><ChevronRight className="size-4" /></button>
          <button type="button" onClick={() => setPaginaAtual(totalPaginas)} disabled={paginaSegura === totalPaginas} aria-label="Última página" className="flex size-8 items-center justify-center rounded-md border border-[#9FC8D1] bg-[#A8DCE5] disabled:opacity-40"><ChevronsRight className="size-4" /></button>
        </div>

        <div className="flex h-8 items-center justify-center rounded-md border border-[#D0D7DB] bg-white px-3 whitespace-nowrap tabular-nums">
          Mostrando {primeiroRegistro} a {ultimoRegistro} de {filtrados.length} registros
        </div>
      </div>
    </main>
  );
}
