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
} from "lucide-react";

type Historico = {
  id: number;
  usuario: string;
  data: string;
  dataOrdenacao: string;
  justificativa: string;
  campoAlterado: string;
  valorAnterior: string;
  valorAtual: string;
  alocacao: string;
};

const historicoInicial: Historico[] = [
  { id: 1, usuario: "André Siqueira", data: "12/12/2026", dataOrdenacao: "2026-12-12", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "1 alocação" },
  { id: 2, usuario: "Gustavo Lima", data: "13/12/2026", dataOrdenacao: "2026-12-13", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "0 alocações" },
  { id: 3, usuario: "Michael Jackson", data: "14/12/2026", dataOrdenacao: "2026-12-14", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "3 alocações" },
  { id: 4, usuario: "Marisa do Monte", data: "15/12/2026", dataOrdenacao: "2026-12-15", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "1 alocação" },
  { id: 5, usuario: "Michael Jackson", data: "14/12/2026", dataOrdenacao: "2026-12-14", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "3 alocações" },
  { id: 6, usuario: "Marisa do Monte", data: "15/12/2026", dataOrdenacao: "2026-12-15", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "1 alocação" },
  { id: 7, usuario: "Larissa Manoela", data: "16/12/2026", dataOrdenacao: "2026-12-16", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "4 alocações" },
  { id: 8, usuario: "Helder Pestana", data: "17/12/2026", dataOrdenacao: "2026-12-17", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 2", valorAtual: "Sala 02", alocacao: "0 alocações" },
  { id: 9, usuario: "Camila Oliveira", data: "18/12/2026", dataOrdenacao: "2026-12-18", justificativa: "Atualização cadastral", campoAlterado: "Capacidade", valorAnterior: "30", valorAtual: "35", alocacao: "2 alocações" },
  { id: 10, usuario: "Rafael Souza", data: "19/12/2026", dataOrdenacao: "2026-12-19", justificativa: "Ajuste de informação", campoAlterado: "Bloco", valorAnterior: "Bloco A", valorAtual: "Bloco B", alocacao: "1 alocação" },
  { id: 11, usuario: "Beatriz Costa", data: "20/12/2026", dataOrdenacao: "2026-12-20", justificativa: "Correção de cadastro", campoAlterado: "Código", valorAnterior: "Lab 1", valorAtual: "Lab 01", alocacao: "2 alocações" },
  { id: 12, usuario: "Pedro Henrique", data: "21/12/2026", dataOrdenacao: "2026-12-21", justificativa: "Atualização de sala", campoAlterado: "Capacidade", valorAnterior: "25", valorAtual: "28", alocacao: "0 alocações" },
  { id: 13, usuario: "Juliana Martins", data: "22/12/2026", dataOrdenacao: "2026-12-22", justificativa: "Correção de dados", campoAlterado: "Código", valorAnterior: "Sala 5", valorAtual: "Sala 05", alocacao: "3 alocações" },
  { id: 14, usuario: "André Siqueira", data: "23/12/2026", dataOrdenacao: "2026-12-23", justificativa: "Ajuste solicitado", campoAlterado: "Tipo de sala", valorAnterior: "Comum", valorAtual: "Laboratório", alocacao: "1 alocação" },
  { id: 15, usuario: "Gustavo Lima", data: "24/12/2026", dataOrdenacao: "2026-12-24", justificativa: "Correção de cadastro", campoAlterado: "Código", valorAnterior: "Sala 8", valorAtual: "Sala 08", alocacao: "0 alocações" },
  { id: 16, usuario: "Marisa do Monte", data: "25/12/2026", dataOrdenacao: "2026-12-25", justificativa: "Atualização cadastral", campoAlterado: "Capacidade", valorAnterior: "20", valorAtual: "24", alocacao: "2 alocações" },
  { id: 17, usuario: "Larissa Manoela", data: "26/12/2026", dataOrdenacao: "2026-12-26", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 9", valorAtual: "Sala 09", alocacao: "4 alocações" },
  { id: 18, usuario: "Helder Pestana", data: "27/12/2026", dataOrdenacao: "2026-12-27", justificativa: "Ajuste de informação", campoAlterado: "Bloco", valorAnterior: "Bloco B", valorAtual: "Bloco C", alocacao: "0 alocações" },
  { id: 19, usuario: "Camila Oliveira", data: "28/12/2026", dataOrdenacao: "2026-12-28", justificativa: "Atualização de sala", campoAlterado: "Código", valorAnterior: "Sala 3", valorAtual: "Sala 03", alocacao: "1 alocação" },
  { id: 20, usuario: "Rafael Souza", data: "29/12/2026", dataOrdenacao: "2026-12-29", justificativa: "Correção de cadastro", campoAlterado: "Capacidade", valorAnterior: "40", valorAtual: "45", alocacao: "3 alocações" },
  { id: 21, usuario: "Beatriz Costa", data: "30/12/2026", dataOrdenacao: "2026-12-30", justificativa: "Ajuste solicitado", campoAlterado: "Código", valorAnterior: "Sala 4", valorAtual: "Sala 04", alocacao: "2 alocações" },
  { id: 22, usuario: "Pedro Henrique", data: "02/01/2027", dataOrdenacao: "2027-01-02", justificativa: "Atualização cadastral", campoAlterado: "Tipo de sala", valorAnterior: "Comum", valorAtual: "Multimídia", alocacao: "1 alocação" },
  { id: 23, usuario: "Juliana Martins", data: "03/01/2027", dataOrdenacao: "2027-01-03", justificativa: "Correção de dados", campoAlterado: "Código", valorAnterior: "Sala 6", valorAtual: "Sala 06", alocacao: "0 alocações" },
  { id: 24, usuario: "André Siqueira", data: "04/01/2027", dataOrdenacao: "2027-01-04", justificativa: "Ajuste de informação", campoAlterado: "Capacidade", valorAnterior: "32", valorAtual: "36", alocacao: "2 alocações" },
  { id: 25, usuario: "Gustavo Lima", data: "05/01/2027", dataOrdenacao: "2027-01-05", justificativa: "Correção de cadastro", campoAlterado: "Código", valorAnterior: "Lab 2", valorAtual: "Lab 02", alocacao: "3 alocações" },
  { id: 26, usuario: "Michael Jackson", data: "06/01/2027", dataOrdenacao: "2027-01-06", justificativa: "Atualização de sala", campoAlterado: "Bloco", valorAnterior: "Bloco A", valorAtual: "Bloco D", alocacao: "1 alocação" },
  { id: 27, usuario: "Marisa do Monte", data: "07/01/2027", dataOrdenacao: "2027-01-07", justificativa: "Correção de dados da sala", campoAlterado: "Código", valorAnterior: "Sala 7", valorAtual: "Sala 07", alocacao: "4 alocações" },
  { id: 28, usuario: "Larissa Manoela", data: "08/01/2027", dataOrdenacao: "2027-01-08", justificativa: "Ajuste solicitado", campoAlterado: "Capacidade", valorAnterior: "18", valorAtual: "22", alocacao: "0 alocações" },
  { id: 29, usuario: "Helder Pestana", data: "09/01/2027", dataOrdenacao: "2027-01-09", justificativa: "Atualização cadastral", campoAlterado: "Código", valorAnterior: "Sala 10", valorAtual: "Sala 10A", alocacao: "2 alocações" },
  { id: 30, usuario: "Camila Oliveira", data: "10/01/2027", dataOrdenacao: "2027-01-10", justificativa: "Correção de cadastro", campoAlterado: "Tipo de sala", valorAnterior: "Laboratório", valorAtual: "Laboratório de informática", alocacao: "3 alocações" },
];

type Coluna = keyof Pick<Historico, "usuario" | "dataOrdenacao" | "justificativa" | "campoAlterado" | "valorAnterior" | "valorAtual" | "alocacao">;

const colunas: { chave: Coluna; titulo: string; largura: string }[] = [
  { chave: "usuario", titulo: "Usuário", largura: "165px" },
  { chave: "dataOrdenacao", titulo: "Data", largura: "105px" },
  { chave: "justificativa", titulo: "Justificativa", largura: "185px" },
  { chave: "campoAlterado", titulo: "Campo Alterado", largura: "145px" },
  { chave: "valorAnterior", titulo: "Valor anterior", largura: "130px" },
  { chave: "valorAtual", titulo: "Valor atual", largura: "120px" },
  { chave: "alocacao", titulo: "Alocação", largura: "130px" },
];

export function HistoricoAlteracoes() {
  const [busca, setBusca] = React.useState("");
  const [itensPorPagina, setItensPorPagina] = React.useState(8);
  const [paginaAtual, setPaginaAtual] = React.useState(1);
  const [ordenacao, setOrdenacao] = React.useState<{ coluna: Coluna; direcao: "asc" | "desc" } | null>(null);

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    let resultado = historicoInicial.filter((item) =>
      [item.usuario, item.data, item.justificativa, item.campoAlterado, item.valorAnterior, item.valorAtual, item.alocacao]
        .some((valor) => valor.toLocaleLowerCase("pt-BR").includes(termo)),
    );

    if (ordenacao) {
      resultado = [...resultado].sort((a, b) => {
        const valorA = String(a[ordenacao.coluna]).toLocaleLowerCase("pt-BR");
        const valorB = String(b[ordenacao.coluna]).toLocaleLowerCase("pt-BR");
        const comparacao = valorA.localeCompare(valorB, "pt-BR", { numeric: true });
        return ordenacao.direcao === "asc" ? comparacao : -comparacao;
      });
    }
    return resultado;
  }, [busca, ordenacao]);

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
            <p className="text-[12px] text-[#555]">Gerencie as alterações feitas nesta instituição</p>
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

      <div className="w-full overflow-x-auto rounded-[9px] border border-[#D0D4D8]">
        <table className="w-full min-w-[1040px] table-fixed border-collapse">
          <colgroup>
            {colunas.map((coluna) => <col key={coluna.chave} style={{ width: coluna.largura }} />)}
          </colgroup>
          <thead>
            <tr className="h-[38px] bg-[#3199A9] text-white">
              {colunas.map((coluna) => {
                const ativa = ordenacao?.coluna === coluna.chave;
                return (
                  <th key={coluna.chave} className="px-3 text-left text-[11px] font-semibold">
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
            {registrosPagina.map((item, index) => (
              <tr key={item.id} className={`h-[37px] border-b border-[#D5D9DC] last:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-[#F0F0F0]"}`}>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={item.usuario}>{item.usuario}</td>
                <td className="whitespace-nowrap px-3 text-[11px] text-[#171717]">{item.data}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]" title={item.justificativa}>{item.justificativa}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]">{item.campoAlterado}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]">{item.valorAnterior}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]">{item.valorAtual}</td>
                <td className="truncate px-3 text-[11px] text-[#171717]">{item.alocacao}</td>
              </tr>
            ))}
            {registrosPagina.length === 0 && (
              <tr>
                <td colSpan={colunas.length} className="h-24 text-center text-sm text-[#6B7280]">
                  Nenhum registro encontrado.
                </td>
              </tr>
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
            className="h-full w-9 border-l border-[#D0D7DB] bg-white text-center outline-none"
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
