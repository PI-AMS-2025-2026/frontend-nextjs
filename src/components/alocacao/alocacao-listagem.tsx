"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { formatarData, type Grade } from "./tipos";

type AlocacaoListagemProps = {
  grades: Grade[];
  onAbrir: (gradeId: string) => void;
};

export default function AlocacaoListagem({
  grades,
  onAbrir,
}: AlocacaoListagemProps) {
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(6);

  const cursos = Array.from(new Set(grades.map((grade) => grade.curso)));
  const periodos = Array.from(
    new Set(grades.map((grade) => grade.periodoLetivo)),
  );
  const campos: ComponentProps<typeof TableFilters>["fields"] = [
    {
      name: "versao",
      label: "Versão",
      type: "input",
      inputType: "number",
      placeholder: "Todas",
      width: "w-full sm:w-[140px]",
    },
    {
      name: "dataCriacao",
      label: "Data de criação",
      type: "input",
      inputType: "date",
      width: "w-full sm:w-[180px]",
    },
    {
      name: "curso",
      label: "Curso",
      type: "select",
      placeholder: "Todos",
      options: cursos.map((curso) => ({ label: curso, value: curso })),
      width: "w-full sm:w-[160px]",
    },
    {
      name: "periodoLetivo",
      label: "Período letivo",
      type: "select",
      placeholder: "Todos",
      options: periodos.map((periodo) => ({ label: periodo, value: periodo })),
      width: "w-full sm:w-[240px]",
    },
  ];
  const filtradas = grades.filter(
    (grade) =>
      (!filtros.versao || Number(filtros.versao) === grade.versao) &&
      (!filtros.dataCriacao || filtros.dataCriacao === grade.dataCriacao) &&
      (!filtros.curso || filtros.curso === grade.curso) &&
      (!filtros.periodoLetivo || filtros.periodoLetivo === grade.periodoLetivo),
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / itensPorPagina),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const visiveis = filtradas.slice(inicio, inicio + itensPorPagina);

  return (
    <section className="min-w-0 space-y-5" aria-label="Grades cadastradas">
      <TableFilters
        fields={campos}
        className="flex-wrap gap-y-4 py-4 [&>div:last-child]:ml-0 [&>div:last-child>button]:translate-y-0"
        onChange={(valores) => {
          setFiltros(valores);
          setPagina(1);
        }}
      />
      <div className="max-w-full overflow-x-auto">
        <DataTable<Grade>
          className="w-full min-w-[800px]"
          data={visiveis}
          getRowKey={(grade) => grade.id}
          emptyMessage="Nenhuma grade encontrada para estes filtros."
          columns={[
            {
              key: "versao",
              label: "Versão",
              render: (grade) => String(grade.versao).padStart(2, "0"),
            },
            {
              key: "dataCriacao",
              label: "Data de criação",
              render: (grade) => formatarData(grade.dataCriacao),
            },
            { key: "curso", label: "Curso" },
            { key: "periodoLetivo", label: "Período letivo" },
            {
              key: "alocacao",
              label: "Alocação",
              render: (grade) => (
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  className="h-8 rounded-lg px-4 text-sm"
                  onClick={() => onAbrir(grade.id)}
                >
                  Abrir
                </Button>
              ),
            },
          ]}
        />
      </div>
      <div className="max-w-full overflow-x-auto">
        <Pagination
          totalItems={filtradas.length}
          currentPage={paginaAtual}
          itemsPerPage={itensPorPagina}
          className="mt-0 min-w-[970px] px-0 [&>div]:w-full [&>div>div:first-child]:w-[230px]"
          onPageChange={setPagina}
          onItemsPerPageChange={(quantidade) => {
            setItensPorPagina(quantidade);
            setPagina(1);
          }}
        />
      </div>
    </section>
  );
}
