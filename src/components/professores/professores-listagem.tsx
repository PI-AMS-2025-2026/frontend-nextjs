"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowLeft,
  CircleCheck,
  CircleMinus,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { TableFilters } from "@/components/ui/tablefilters";
import { TableFilterHead } from "@/components/ui/table-filter-head";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { professoresService } from "@/services/professores.service";
import { useServerPage } from "@/hooks/use-server-page";

import {
  ProfessorFormModal,
  type DadosProfessor,
  type Professor,
} from "./professor-form-modal";

type Formulario =
  | { modo: "cadastrar" }
  | { modo: "editar"; professor: Professor };

function mensagemErro(erro: unknown, padrao: string) {
  return erro instanceof Error && erro.message
    ? erro.message
    : padrao;
}

export function ProfessoresListagem() {
  const pathname = usePathname();
  const isCoordinatorRoute = pathname.startsWith("/coordenador/");
  const hrefVoltar = pathname.startsWith("/coordenador/")
    ? "/coordenador/home"
    : "/administrador/home";
  const [busca, setBusca] = React.useState("");
  const [fNome, setFNome] = React.useState("");
  const [fEmail, setFEmail] = React.useState("");
  const [fStatus, setFStatus] = React.useState("");

  const [paginaAtual, setPaginaAtual] = React.useState(1);
  const [itensPorPagina, setItensPorPagina] = React.useState(6);
  const filtros = React.useMemo(() => ({ busca: busca.trim() || undefined, nome: fNome.trim() || undefined, email: fEmail.trim() || undefined, status: fStatus || undefined }), [busca, fNome, fEmail, fStatus]);
  const { data: pageData, loading: carregando, error: erro, reload } = useServerPage(
    (query) => professoresService.listar(query as Parameters<typeof professoresService.listar>[0]),
    filtros, paginaAtual, itensPorPagina,
  );
  const professores = pageData.content;

  const [formulario, setFormulario] =
    React.useState<Formulario | null>(null);

  const [salvando, setSalvando] = React.useState(false);
  const salvandoRef = React.useRef(false);

  const [erroFormulario, setErroFormulario] =
    React.useState<string | null>(null);

  const [sucesso, setSucesso] =
    React.useState<string | null>(null);

  const paginaSegura = Math.min(paginaAtual, Math.max(1, pageData.totalPages));

  function tentarNovamente() {
    reload();
  }

  function abrirFormulario(professor?: Professor) {
    if (salvandoRef.current) return;

    setErroFormulario(null);

    setFormulario(
      professor
        ? { modo: "editar", professor }
        : { modo: "cadastrar" },
    );
  }

  function fecharFormulario() {
    if (salvandoRef.current) return;

    setFormulario(null);
    setErroFormulario(null);
  }

  async function salvarProfessor(dados: DadosProfessor) {
    if (!formulario || salvandoRef.current) return;

    const selecionado =
      formulario.modo === "editar"
        ? formulario.professor
        : null;

    salvandoRef.current = true;
    setSalvando(true);
    setErroFormulario(null);

    try {
      if (selecionado) {
        await professoresService.atualizar(
            selecionado.id,
            dados,
          );
      } else {
        await professoresService.criar(dados);
      }

      // Atualiza a tabela com os dados devolvidos pelo backend.
      reload();

      if (!selecionado) {
        setPaginaAtual(1);
      }

      setFormulario(null);

      setSucesso(
        selecionado
          ? "Professor editado com sucesso!"
          : "Professor cadastrado com sucesso!",
      );
    } catch (erro) {
      setErroFormulario(
        mensagemErro(
          erro,
          selecionado
            ? "Não foi possível editar o professor."
            : "Não foi possível cadastrar o professor.",
        ),
      );
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1100px] flex-1 flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={hrefVoltar}
            aria-label="Voltar"
            className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 hover:bg-[#F2F2F2]"
          >
            <ArrowLeft className="size-6" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-[#17264D]">
              Professores
            </h1>

            <p className="text-sm text-[#17264D]/70">
              {isCoordinatorRoute
                ? "Visualize os professores da instituição"
                : "Gerencie os professores da instituição"}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="min-w-0 flex-1 sm:w-64">
            <SearchInput
              aria-label="Pesquisar professores"
              placeholder="Pesquisar..."
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value);
                setPaginaAtual(1);
              }}
            />
          </div>

          {!isCoordinatorRoute && (
            <Button
              variant="secondary"
              size="small"
              className="gap-2"
              disabled={carregando || Boolean(erro)}
              onClick={() => abrirFormulario()}
            >
              <Plus className="size-5" />
              Cadastrar
            </Button>
          )}
        </div>
      </div>

      <TableFilters
        className="flex-wrap"
        fields={[
          {
            name: "nome",
            label: "Nome",
            type: "input",
            placeholder: "Filtrar por nome",
          },
          {
            name: "email",
            label: "E-mail",
            type: "input",
            placeholder: "Filtrar por e-mail",
          },
        ]}
        onChange={(filtros) => {
          setFNome(filtros.nome ?? "");
          setFEmail(filtros.email ?? "");
          setPaginaAtual(1);
        }}
        onClear={() => {
          setBusca("");
          setFNome("");
          setFEmail("");
          setFStatus("");
          setPaginaAtual(1);
        }}
      />

      {Boolean(erro) && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]"
        >
          <span>{mensagemErro(erro, "Não foi possível carregar os professores.")}</span>

          <Button
            variant="ghost"
            size="small"
            onClick={tentarNovamente}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {carregando ? (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-20 text-[#17264D]/70"
        >
          <Loader2 className="size-6 animate-spin text-[#0099AA]" />
          Carregando professores...
        </div>
      ) : !erro ? (
        <>
          <div className="min-w-0 overflow-x-auto pb-2">
            <DataTable
              data={professores}
              getRowKey={(professor) => professor.id}
              emptyMessage="Nenhum professor encontrado."
              columns={[
                {
                  key: "nome",
                  label: "Nome",
                  headerClassName: "min-w-[180px]",
                },
                {
                  key: "email",
                  label: "E-mail",
                  headerClassName: "min-w-[250px]",
                },
                {
                  key: "status",
                  label: (
                    <TableFilterHead
                      label="Status"
                      value={fStatus}
                      onChange={(valor) => {
                        setFStatus(valor);
                        setPaginaAtual(1);
                      }}
                      options={[
                        { label: "Ativo", value: "ATIVO" },
                        { label: "Inativo", value: "INATIVO" },
                      ]}
                    />
                  ),
                  headerClassName: "min-w-[140px]",
                  render: (professor) =>
                    professor.status === "ATIVO" ? (
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
              actions={isCoordinatorRoute ? [] : [
                {
                  label: "Editar",
                  icon: (
                    <Pencil
                      className="size-[21px]"
                      strokeWidth={2}
                    />
                  ),
                  onClick: (professor) =>
                    abrirFormulario(professor),
                },
              ]}
            />
          </div>

          <div className="w-full overflow-x-auto pb-2">
            <Pagination
              className="mt-2 min-w-max px-0"
              totalItems={pageData.totalElements}
              currentPage={paginaSegura}
              itemsPerPage={itensPorPagina}
              onPageChange={setPaginaAtual}
              onItemsPerPageChange={(quantidade) => {
                setItensPorPagina(quantidade);
                setPaginaAtual(1);
              }}
            />
          </div>
        </>
      ) : null}

      {!isCoordinatorRoute && formulario && (
        <ProfessorFormModal
          key={
            formulario.modo === "editar"
              ? formulario.professor.id
              : "cadastrar"
          }
          professor={
            formulario.modo === "editar"
              ? formulario.professor
              : undefined
          }
          salvando={salvando}
          erroExterno={erroFormulario}
          onClose={fecharFormulario}
          onConfirm={salvarProfessor}
        />
      )}

      <Modal
        open={sucesso !== null}
        onClose={() => setSucesso(null)}
        type="success"
        message={sucesso ?? ""}
      />
    </div>
  );
}
