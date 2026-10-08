"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FilterX,
} from "lucide-react";
import { formatarData, type Grade } from "./tipos";

type GradeListProps = { grades: Grade[]; onAlocar: (gradeId: string) => void };
const CAMPO =
  "h-10 w-full rounded-md border border-[#CDD6DB] bg-white px-3 text-sm text-[#404040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA]";
const FILTROS_VAZIOS = { versao: "", data: "", curso: "", periodo: "" };

export default function GradeList({ grades, onAlocar }: GradeListProps) {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(6);
  const cursos = Array.from(new Set(grades.map((grade) => grade.curso)));
  const periodos = Array.from(new Set(grades.map((grade) => grade.periodoLetivo)));
  const filtradas = grades.filter(
    (grade) =>
      (!filtros.versao || grade.versao === Number(filtros.versao)) &&
      (!filtros.data || grade.dataCriacao === filtros.data) &&
      (!filtros.curso || grade.curso === filtros.curso) &&
      (!filtros.periodo || grade.periodoLetivo === filtros.periodo),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const visiveis = filtradas.slice(inicio, inicio + porPagina);
  function mudarFiltro(chave: keyof typeof filtros, valor: string) {
    setFiltros((atual) => ({ ...atual, [chave]: valor }));
    setPagina(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-lg border border-[#D0DEE2] bg-[#F4FBFC] p-4">
        <label className="min-w-[100px] flex-1 text-xs font-medium text-[#404040]">
          Versão
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Todas"
            value={filtros.versao}
            onChange={(event) => mudarFiltro("versao", event.target.value)}
            className={`mt-1.5 ${CAMPO}`}
          />
        </label>
        <label className="min-w-[165px] flex-[1.5] text-xs font-medium text-[#404040]">
          Data de criação
          <input
            type="date"
            value={filtros.data}
            onChange={(event) => mudarFiltro("data", event.target.value)}
            className={`mt-1.5 ${CAMPO}`}
          />
        </label>
        <label className="min-w-[170px] flex-[1.5] text-xs font-medium text-[#404040]">
          Curso vinculado
          <select
            aria-label="Curso vinculado"
            value={filtros.curso}
            onChange={(event) => mudarFiltro("curso", event.target.value)}
            className={`mt-1.5 ${CAMPO}`}
          >
            <option value="">Todos os cursos</option>
            {cursos.map((curso) => (
              <option key={curso}>{curso}</option>
            ))}
          </select>
        </label>
        <label className="min-w-[220px] flex-[2] text-xs font-medium text-[#404040]">
          Período letivo vinculado
          <select
            aria-label="Período letivo vinculado"
            value={filtros.periodo}
            onChange={(event) => mudarFiltro("periodo", event.target.value)}
            className={`mt-1.5 ${CAMPO}`}
          >
            <option value="">Todos os períodos</option>
            {periodos.map((periodo) => (
              <option key={periodo}>{periodo}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setFiltros(FILTROS_VAZIOS);
            setPagina(1);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0099AA] px-4 text-sm font-medium text-white transition hover:bg-[#008494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] focus-visible:ring-offset-2"
        >
          <FilterX className="h-4 w-4" aria-hidden="true" />
          Limpar filtros
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#D0DEE2]">
        <table
          className="w-full min-w-[710px] border-collapse text-left text-sm"
          aria-label="Grades cadastradas pelo administrador"
        >
          <thead className="bg-[#0099AA] text-white">
            <tr>
              {[
                "Versão",
                "Data de criação",
                "Curso vinculado",
                "Período letivo vinculado",
                "Ações",
              ].map((coluna) => (
                <th
                  key={coluna}
                  scope="col"
                  className={`px-5 py-4 text-xs font-semibold ${coluna === "Ações" ? "text-center" : ""}`}
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((grade, indice) => (
              <tr
                key={grade.id}
                className={`border-t border-[#E0E3E6] ${indice % 2 ? "bg-[#F2F3F4]" : "bg-white"}`}
              >
                <td className="px-5 py-4 tabular-nums">
                  {String(grade.versao).padStart(2, "0")}
                </td>
                <td className="px-5 py-4 tabular-nums">
                  {formatarData(grade.dataCriacao)}
                </td>
                <td className="px-5 py-4">{grade.curso}</td>
                <td className="px-5 py-4">{grade.periodoLetivo}</td>
                <td className="px-5 py-3 text-center">
                  <button
                    type="button"
                    aria-label={`Alocar grade de ${grade.curso}, ${grade.periodoLetivo}, versão ${grade.versao}`}
                    onClick={() => onAlocar(grade.id)}
                    className="rounded-md bg-[#0099AA] px-6 py-2 text-xs font-semibold text-white transition hover:bg-[#008494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] focus-visible:ring-offset-2"
                  >
                    Alocar
                  </button>
                </td>
              </tr>
            ))}
            {!visiveis.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-14 text-center text-[#777777]"
                >
                  Nenhuma grade encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#404040]">
        <label className="flex items-center gap-3">
          Itens por página:
          <select
            aria-label="Itens por página"
            value={porPagina}
            onChange={(event) => {
              setPorPagina(Number(event.target.value));
              setPagina(1);
            }}
            className="rounded-md border border-[#CDD6DB] bg-white px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA]"
          >
            {[6, 12, 24].map((numero) => (
              <option key={numero} value={numero}>
                {numero}
              </option>
            ))}
          </select>
        </label>
        <nav
          aria-label="Paginação das grades"
          className="flex items-center gap-1"
        >
          {[
            {
              label: "Primeira página",
              icon: ChevronsLeft,
              page: 1,
              disabled: paginaAtual === 1,
            },
            {
              label: "Página anterior",
              icon: ChevronLeft,
              page: paginaAtual - 1,
              disabled: paginaAtual === 1,
            },
          ].map(({ label, icon: Icon, page, disabled }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              disabled={disabled}
              onClick={() => setPagina(page)}
              className="rounded bg-[#D9F3F4] p-2 text-[#007A88] hover:bg-[#BDE8EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] disabled:cursor-default disabled:opacity-40"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
          <span aria-live="polite" className="rounded bg-[#D9F3F4] px-4 py-2.5">
            Página {paginaAtual} de {totalPaginas}
          </span>
          {[
            {
              label: "Próxima página",
              icon: ChevronRight,
              page: paginaAtual + 1,
              disabled: paginaAtual === totalPaginas,
            },
            {
              label: "Última página",
              icon: ChevronsRight,
              page: totalPaginas,
              disabled: paginaAtual === totalPaginas,
            },
          ].map(({ label, icon: Icon, page, disabled }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              disabled={disabled}
              onClick={() => setPagina(page)}
              className="rounded bg-[#D9F3F4] p-2 text-[#007A88] hover:bg-[#BDE8EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] disabled:cursor-default disabled:opacity-40"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
        </nav>
        <p aria-live="polite">
          Mostrando {filtradas.length ? inicio + 1 : 0} a{" "}
          {Math.min(inicio + porPagina, filtradas.length)} de {filtradas.length}{" "}
          registros
        </p>
      </div>
    </div>
  );
}
