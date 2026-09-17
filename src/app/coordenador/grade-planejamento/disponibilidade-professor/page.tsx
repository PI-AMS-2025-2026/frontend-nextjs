"use client";

import * as React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Header, type HeaderConfig } from "@/components/header";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { SearchInput } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";

interface Disponibilidade {
  id: string;
  professorNome: string;
  professorEmail: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

const headerConfig: HeaderConfig = {
  homeHref: "/coordenador/grade-planejamento",
  navigationGroups: [
    {
      label: "Grade",
      links: [
        { label: "Planejamento", href: "/coordenador/grade-planejamento" },
        {
          label: "Disponibilidades",
          href: "/coordenador/grade-planejamento/disponibilidade-professor",
        },
      ],
    },
  ],
};

const mockUser = {
  name: "Coordenador",
  role: "Coordenador de Cursos",
};

export default function DisponibilidadeProfessorPage() {
  const [disponibilidades, setDisponibilidades] = React.useState<Disponibilidade[] | null>(null);

  React.useEffect(() => {
    const mock: Disponibilidade[] = [
      {
        id: "1",
        professorNome: "João Silva",
        professorEmail: "joao@email.com",
        diaSemana: "Segunda",
        horaInicio: "08:00",
        horaFim: "12:00",
        ativo: true,
      },
      {
        id: "2",
        professorNome: "Maria Santos",
        professorEmail: "maria@email.com",
        diaSemana: "Terça",
        horaInicio: "14:00",
        horaFim: "18:00",
        ativo: true,
      },
      {
        id: "3",
        professorNome: "Pedro Oliveira",
        professorEmail: "pedro@email.com",
        diaSemana: "Quarta",
        horaInicio: "09:00",
        horaFim: "13:00",
        ativo: false,
      },
      {
        id: "4",
        professorNome: "Ana Costa",
        professorEmail: "ana@email.com",
        diaSemana: "Quinta",
        horaInicio: "10:00",
        horaFim: "14:00",
        ativo: true,
      },
      {
        id: "5",
        professorNome: "Carlos Mendes",
        professorEmail: "carlos@email.com",
        diaSemana: "Sexta",
        horaInicio: "13:00",
        horaFim: "17:00",
        ativo: true,
      },
    ];
    setDisponibilidades(mock);
  }, []);

  const [busca, setBusca] = React.useState("");
  const [filtros, setFiltros] = React.useState<Record<string, string>>({});
  const [itensPorPagina, setItensPorPagina] = React.useState(6);
  const [paginaAtual, setPaginaAtual] = React.useState(1);

  const filtradas = React.useMemo(() => {
    if (disponibilidades === null) return [];
    const b = busca.trim().toLowerCase();
    const professorFiltro = (filtros.professor ?? "").trim().toLowerCase();
    const diaFiltro = (filtros.dia ?? "").trim().toLowerCase();

    return disponibilidades.filter((disp) => {
      const buscaOk =
        !b ||
        disp.professorNome.toLowerCase().includes(b) ||
        disp.professorEmail.toLowerCase().includes(b);
      const professorOk = !professorFiltro || disp.professorNome.toLowerCase().includes(professorFiltro);
      const diaOk = !diaFiltro || disp.diaSemana.toLowerCase().includes(diaFiltro);
      return buscaOk && professorOk && diaOk;
    });
  }, [disponibilidades, busca, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicioIndice = (paginaSegura - 1) * itensPorPagina;
  const pagina = filtradas.slice(inicioIndice, inicioIndice + itensPorPagina);

  function limparFiltros() {
    setBusca("");
    setFiltros({});
    setPaginaAtual(1);
  }

  if (disponibilidades === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="size-6 animate-spin text-[#0099AA]" />
        <span className="text-sm text-[#17264D]/70">Carregando disponibilidades...</span>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <Header {...headerConfig} user={mockUser} />

      {/* Conteúdo Principal */}
      <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-6 px-6 py-8">
      {/* Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            aria-label="Voltar"
            className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
          >
            <ArrowLeft className="size-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#17264D]">Disponibilidades de Professores</h1>
            <p className="text-sm text-[#17264D]/70">Gerencie as disponibilidades dos professores</p>
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

      {/* TableFilters */}
      <TableFilters
        fields={[
          {
            name: "professor",
            label: "Professor",
            type: "input",
            placeholder: "Nome do professor",
            width: "200px",
          },
          {
            name: "dia",
            label: "Dia da Semana",
            type: "select",
            options: [
              { label: "Segunda", value: "Segunda" },
              { label: "Terça", value: "Terça" },
              { label: "Quarta", value: "Quarta" },
              { label: "Quinta", value: "Quinta" },
              { label: "Sexta", value: "Sexta" },
            ],
          },
        ]}
        onChange={(newFiltros) => {
          setFiltros(newFiltros);
          setPaginaAtual(1);
        }}
        onClear={limparFiltros}
      />

      {/* DataTable */}
      <DataTable
        columns={[
          { key: "professorNome", label: "Professor" },
          { key: "professorEmail", label: "Email" },
          { key: "diaSemana", label: "Dia da Semana" },
          { key: "horaInicio", label: "Hora Início" },
          { key: "horaFim", label: "Hora Fim" },
          {
            key: "ativo",
            label: "Status",
            render: (item: Disponibilidade) => (
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  item.ativo
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.ativo ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        data={pagina}
      />

      {/* Paginação */}
      {filtradas.length > 0 && (
        <Pagination
          currentPage={paginaSegura}
          totalItems={filtradas.length}
          itemsPerPage={itensPorPagina}
          onPageChange={setPaginaAtual}
          onItemsPerPageChange={(n: number) => {
            setItensPorPagina(n);
            setPaginaAtual(1);
          }}
        />
      )}
      </div>
    </>
  );
}
