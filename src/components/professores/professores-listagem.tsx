"use client";

import * as React from "react";
import Link from "next/link";

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

import {
  ProfessorFormModal,
  type DadosProfessor,
  type Professor,
} from "./professor-form-modal";

type Formulario =
  | { modo: "cadastrar" }
  | { modo: "editar"; professor: Professor };

function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mensagemErro(erro: unknown, padrao: string) {
  return erro instanceof Error && erro.message
    ? erro.message
    : padrao;
}

// Carrega todas as páginas para manter a busca e os filtros no frontend.
async function buscarTodosProfessores(): Promise<Professor[]> {
  const primeira = await professoresService.listar({
    page: 0,
    size: 100,
  });

  const lista = [...primeira.content];

  for (let page = 1; page < primeira.totalPages; page++) {
    const proxima = await professoresService.listar({
      page,
      size: primeira.size,
    });

    lista.push(...proxima.content);
  }

  return lista;
}

export function ProfessoresListagem() {
  const [professores, setProfessores] =
    React.useState<Professor[]>([]);

  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);

  const [busca, setBusca] = React.useState("");
  const [fNome, setFNome] = React.useState("");
  const [fEmail, setFEmail] = React.useState("");
  const [fStatus, setFStatus] = React.useState("");

  const [paginaAtual, setPaginaAtual] = React.useState(1);
  const [itensPorPagina, setItensPorPagina] = React.useState(6);

  const [formulario, setFormulario] =
    React.useState<Formulario | null>(null);

  const [salvando, setSalvando] = React.useState(false);
  const salvandoRef = React.useRef(false);

  const [erroFormulario, setErroFormulario] =
    React.useState<string | null>(null);

  const [sucesso, setSucesso] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const lista = await buscarTodosProfessores();

        if (ativo) {
          setProfessores(lista);
        }
      } catch (erro) {
        if (ativo) {
          setErro(
            mensagemErro(
              erro,
              "Não foi possível carregar os professores.",
            ),
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const filtrados = React.useMemo(() => {
    const buscaNormalizada = normalizar(busca);
    const nome = normalizar(fNome);
    const email = normalizar(fEmail);

    return professores.filter((professor) => {
      const nomeProfessor = normalizar(professor.nome);
      const emailProfessor = normalizar(professor.email);

      const correspondeBusca =
        !buscaNormalizada ||
        nomeProfessor.includes(buscaNormalizada) ||
        emailProfessor.includes(buscaNormalizada);

      return (
        correspondeBusca &&
        nomeProfessor.includes(nome) &&
        emailProfessor.includes(email) &&
        (!fStatus || professor.status === fStatus)
      );
    });
  }, [professores, busca, fNome, fEmail, fStatus]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / itensPorPagina),
  );

  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * itensPorPagina;
  const pagina = filtrados.slice(inicio, inicio + itensPorPagina);

  function tentarNovamente() {
    setErro(null);
    setCarregando(true);
    setTentativa((valor) => valor + 1);
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
      const salvo = selecionado
        ? await professoresService.atualizar(
            selecionado.id,
            dados,
          )
        : await professoresService.criar(dados);

      // Atualiza a tabela com os dados devolvidos pelo backend.
      setProfessores((lista) =>
        selecionado
          ? lista.map((professor) =>
              professor.id === selecionado.id
                ? salvo
                : professor,
            )
          : [salvo, ...lista],
      );

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
            href="/adminstrador/home"
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
              Gerencie os professores da instituição
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

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]"
        >
          <span>{erro}</span>

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
              data={pagina}
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
              actions={[
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
              totalItems={filtrados.length}
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

      {formulario && (
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