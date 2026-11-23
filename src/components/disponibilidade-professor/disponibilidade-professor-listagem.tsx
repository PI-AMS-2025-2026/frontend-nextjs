"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, LoaderCircle, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProfessorCombobox } from "./professor-combobox";
import { DIAS_SEMANA, formatarHora } from "./dias-semana";
import { blocoHorariosService, disponibilidadesProfessoresService, professoresService } from "@/services";
import { ApiError } from "@/lib/api";
import type {
  BlocoHorarioResponse,
  DisponibilidadeProfessorResponse,
  ProfessorResponse,
} from "@/types/api";
import {
  normalizarDisponibilidades,
  type DisponibilidadeProfessorApi,
} from "./disponibilidade-professor-api";

const TAMANHO_CATALOGO = 1000;
const DIAS_UTEIS = DIAS_SEMANA.slice(0, 5).map((dia) => dia.value);

function chaveHorario(dia: string, blocoId: number) {
  return `${dia}:${blocoId}`;
}

function horariosSelecionados(disponibilidades: DisponibilidadeProfessorApi[]) {
  return new Set(normalizarDisponibilidades(disponibilidades).map(
    (item) => chaveHorario(item.diaSemana, item.blocoHorario.id),
  ));
}

async function carregarCatalogo<T>(listar: (page: number) => Promise<{ content: T[]; totalPages: number }>) {
  const itens: T[] = [];
  let page = 0;
  let totalPages = 1;
  do {
    const resposta = await listar(page);
    itens.push(...resposta.content);
    totalPages = resposta.totalPages;
    page += 1;
  } while (page < totalPages);
  return itens;
}

export function DisponibilidadeProfessorListagem() {
  const [professores, setProfessores] = React.useState<ProfessorResponse[]>([]);
  const [blocos, setBlocos] = React.useState<BlocoHorarioResponse[]>([]);
  const [professor, setProfessor] = React.useState<ProfessorResponse | null>(null);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());
  const [originais, setOriginais] = React.useState<Set<string>>(new Set());
  const [carregandoCatalogos, setCarregandoCatalogos] = React.useState(true);
  const [carregandoGrade, setCarregandoGrade] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [confirmarRemocoes, setConfirmarRemocoes] = React.useState(false);
  const [diaOrigem, setDiaOrigem] = React.useState(DIAS_SEMANA[0].value);
  const [diasDestino, setDiasDestino] = React.useState<string[]>([]);

  const blocosOrdenados = React.useMemo(
    () => [...blocos].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [blocos],
  );
  const alterada = !mesmoConjunto(selecionados, originais);
  const removidos = [...originais].some((horario) => !selecionados.has(horario));
  const professorBloqueado = carregandoCatalogos || carregandoGrade || salvando || alterada;

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregandoCatalogos(true);
      try {
        const [listaProfessores, listaBlocos] = await Promise.all([
          carregarCatalogo((page) => professoresService.listar({ page, size: TAMANHO_CATALOGO })),
          carregarCatalogo((page) => blocoHorariosService.listar({ page, size: TAMANHO_CATALOGO })),
        ]);
        if (!ativo) return;
        setProfessores(listaProfessores);
        setBlocos(listaBlocos);
      } catch (error) {
        if (ativo) setErro(mensagemErro(error, "Não foi possível carregar professores e blocos de horário."));
      } finally {
        if (ativo) setCarregandoCatalogos(false);
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, []);

  async function selecionarProfessor(novoProfessor: ProfessorResponse | null) {
    if (!novoProfessor) {
      setProfessor(null);
      setSelecionados(new Set());
      setOriginais(new Set());
      setErro("");
      setFeedback("");
      return;
    }
    if (novoProfessor.id === professor?.id) return;
    setProfessor(novoProfessor);
    setSelecionados(new Set());
    setOriginais(new Set());
    setErro("");
    setFeedback("");
    setCarregandoGrade(true);
    try {
      const registros = await carregarCatalogo((page) => disponibilidadesProfessoresService.listar({
        professor: novoProfessor.id,
        page,
        size: TAMANHO_CATALOGO,
      }));
      const grade = horariosSelecionados(registros as DisponibilidadeProfessorApi[]);
      setSelecionados(grade);
      setOriginais(new Set(grade));
    } catch (error) {
      setErro(mensagemErro(error, "Não foi possível carregar a grade deste professor."));
      setProfessor(null);
      setSelecionados(new Set());
      setOriginais(new Set());
    } finally {
      setCarregandoGrade(false);
    }
  }

  function alternarHorario(dia: string, blocoId: number) {
    const chave = chaveHorario(dia, blocoId);
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
    setFeedback("");
  }

  function alternarDia(dia: string) {
    const chavesDia = blocosOrdenados.map((bloco) => chaveHorario(dia, bloco.id));
    const todosMarcados = chavesDia.length > 0 && chavesDia.every((chave) => selecionados.has(chave));
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      chavesDia.forEach((chave) => todosMarcados ? proximo.delete(chave) : proximo.add(chave));
      return proximo;
    });
    setFeedback("");
  }

  function copiarParaDias(destinos: string[]) {
    const horariosOrigem = blocosOrdenados
      .filter((bloco) => selecionados.has(chaveHorario(diaOrigem, bloco.id)))
      .map((bloco) => bloco.id);
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      destinos.filter((dia) => dia !== diaOrigem).forEach((dia) => {
        blocosOrdenados.forEach((bloco) => proximo.delete(chaveHorario(dia, bloco.id)));
        horariosOrigem.forEach((blocoId) => proximo.add(chaveHorario(dia, blocoId)));
      });
      return proximo;
    });
    setFeedback("");
  }

  function descartarAlteracoes() {
    setSelecionados(new Set(originais));
    setErro("");
    setFeedback("");
  }

  async function salvarGrade() {
    if (!professor || salvando) return;
    const horarios = blocosOrdenados.flatMap((bloco) => DIAS_SEMANA
      .filter((dia) => selecionados.has(chaveHorario(dia.value, bloco.id)))
      .map((dia) => ({ diaSemana: dia.value as DisponibilidadeProfessorResponse["diaSemana"], blocoHorarioId: bloco.id })));

    setSalvando(true);
    setErro("");
    setFeedback("");
    try {
      const resposta = await disponibilidadesProfessoresService.sincronizarGrade(professor.id, { horarios });
      const gradeAtualizada = horariosSelecionados(resposta as unknown as DisponibilidadeProfessorApi[]);
      setSelecionados(gradeAtualizada);
      setOriginais(new Set(gradeAtualizada));
      setFeedback("Grade de disponibilidade salva com sucesso.");
      setConfirmarRemocoes(false);
    } catch (error) {
      setErro(mensagemErro(error, "Não foi possível salvar a grade. Suas seleções foram mantidas."));
      setConfirmarRemocoes(false);
    } finally {
      setSalvando(false);
    }
  }

  function solicitarSalvamento() {
    if (!professor || !alterada) return;
    if (removidos) {
      setConfirmarRemocoes(true);
      return;
    }
    void salvarGrade();
  }

  const opcoesDias = DIAS_SEMANA.map((dia) => ({ label: dia.label, value: dia.value }));

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/administrador/home" aria-label="Voltar" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]">
            <ArrowLeft className="size-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#17264D]">Disponibilidade de Professor</h1>
            <p className="text-sm text-[#17264D]/70">Monte e atualize a semana do professor em uma única grade.</p>
          </div>
        </div>
      </header>

      {erro && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      {feedback && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p>}

      <section className="space-y-5 rounded-xl border border-[#D0D7DB] bg-white p-5 shadow-sm" aria-label="Editor de disponibilidade semanal">
        <div className="grid gap-4 sm:grid-cols-[minmax(260px,420px)_1fr] sm:items-end">
          <ProfessorCombobox
            professores={professores}
            selecionado={professor}
            erro=""
            disabled={professorBloqueado}
            onSelect={(selecionado) => { void selecionarProfessor(selecionado); }}
          />
          {alterada && <div className="text-sm text-amber-800" role="status">Há alterações ainda não salvas. Salve ou descarte antes de trocar de professor.</div>}
        </div>

        {!professor && !carregandoCatalogos && (
          <div className="rounded-lg border border-dashed border-[#B8C8CE] bg-[#F7FBFC] px-5 py-10 text-center text-sm text-[#17264D]/70">
            Selecione um professor para carregar a grade semanal.
          </div>
        )}
        {carregandoGrade && <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-[#17264D]/70"><LoaderCircle className="size-5 animate-spin" />Carregando horários...</div>}

        {professor && !carregandoGrade && (
          <>
            <section className="rounded-lg bg-[#F4F9FA] p-4" aria-label="Atalhos de replicação">
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex min-w-[180px] flex-col gap-1.5 text-sm font-medium text-[#17264D]">
                  Copiar horários de
                  <select value={diaOrigem} onChange={(event) => setDiaOrigem(event.target.value)} disabled={salvando} className="h-10 rounded-lg border border-[#AEBBC0] bg-white px-3 font-normal outline-none focus:border-[#0099AA]">
                    {opcoesDias.map((dia) => <option key={dia.value} value={dia.value}>{dia.label}</option>)}
                  </select>
                </label>
                <fieldset className="min-w-0 flex-1">
                  <legend className="mb-2 text-sm font-medium text-[#17264D]">Para outros dias</legend>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {DIAS_SEMANA.filter((dia) => dia.value !== diaOrigem).map((dia) => (
                      <label key={dia.value} className="inline-flex items-center gap-2 text-sm text-[#17264D]">
                        <input type="checkbox" checked={diasDestino.includes(dia.value)} disabled={salvando} onChange={(event) => setDiasDestino((atual) => event.target.checked ? [...atual, dia.value] : atual.filter((item) => item !== dia.value))} />
                        {dia.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Button type="button" variant="secondary" size="small" disabled={salvando || diasDestino.length === 0} onClick={() => copiarParaDias(diasDestino)} className="gap-2 text-sm">
                  <Copy className="size-4" />Copiar dia
                </Button>
                <Button type="button" variant="ghost" size="small" disabled={salvando} onClick={() => copiarParaDias(DIAS_UTEIS)} className="text-sm text-[#17264D]">
                  Aplicar aos dias úteis
                </Button>
              </div>
            </section>

            {blocosOrdenados.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#B8C8CE] px-5 py-10 text-center text-sm text-[#17264D]/70">Cadastre blocos de horário antes de montar a disponibilidade.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#D0D7DB]">
                <table className="w-full min-w-[850px] border-collapse text-sm">
                  <caption className="sr-only">Grade semanal de disponibilidade para {professor.nome}</caption>
                  <thead>
                    <tr className="bg-[#1B4D62] text-white">
                      <th scope="col" className="sticky left-0 z-10 min-w-[150px] bg-[#1B4D62] px-4 py-3 text-left font-semibold">Bloco de horário</th>
                      {DIAS_SEMANA.map((dia) => {
                        const chavesDia = blocosOrdenados.map((bloco) => chaveHorario(dia.value, bloco.id));
                        const todosMarcados = chavesDia.length > 0 && chavesDia.every((chave) => selecionados.has(chave));
                        return (
                          <th key={dia.value} scope="col" className="min-w-[96px] px-2 py-2 text-center font-semibold">
                            <button type="button" disabled={salvando} onClick={() => alternarDia(dia.value)} aria-label={`${todosMarcados ? "Limpar" : "Marcar"} todos os horários de ${dia.label}`} className="rounded-md px-2 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{dia.label}</button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {blocosOrdenados.map((bloco, index) => (
                      <tr key={bloco.id} className={index % 2 === 0 ? "bg-white" : "bg-[#F4F7F8]"}>
                        <th scope="row" className="sticky left-0 z-[1] border-t border-[#D8E0E3] bg-inherit px-4 py-3 text-left font-medium text-[#17264D]">{formatarHora(bloco.horaInicio)}–{formatarHora(bloco.horaFim)}</th>
                        {DIAS_SEMANA.map((dia) => {
                          const chave = chaveHorario(dia.value, bloco.id);
                          const marcado = selecionados.has(chave);
                          return (
                            <td key={dia.value} className="border-t border-[#D8E0E3] px-2 py-2 text-center">
                              <button
                                type="button"
                                aria-label={`${marcado ? "Remover" : "Adicionar"} disponibilidade ${dia.label}, ${formatarHora(bloco.horaInicio)} a ${formatarHora(bloco.horaFim)}`}
                                aria-pressed={marcado}
                                disabled={salvando}
                                onClick={() => alternarHorario(dia.value, bloco.id)}
                                className={`inline-flex size-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] disabled:opacity-50 ${marcado ? "border-[#00899A] bg-[#0099AA] text-white hover:bg-[#087C8A]" : "border-[#B7C6CB] bg-white text-transparent hover:bg-[#E5F5F7]"}`}
                              >
                                <Check className="size-5" aria-hidden="true" />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#17264D]/70" aria-live="polite">{selecionados.size} horário(s) selecionado(s){alterada ? " · alterações pendentes" : ""}</p>
              <div className="flex flex-wrap justify-end gap-3">
                {alterada && <Button type="button" variant="ghost" size="small" disabled={salvando} onClick={descartarAlteracoes}>Descartar alterações</Button>}
                <Button type="button" variant="secondary" size="small" disabled={!alterada || salvando} onClick={solicitarSalvamento} className="gap-2 text-sm">
                  {salvando ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {salvando ? "Salvando..." : "Salvar grade"}
                </Button>
              </div>
            </footer>
          </>
        )}
      </section>

      <Modal open={confirmarRemocoes} onClose={() => setConfirmarRemocoes(false)} labelledBy="confirmar-remocoes-titulo" describedBy="confirmar-remocoes-descricao" closeDisabled={salvando} className="max-w-lg">
        <div className="space-y-5 pr-8">
          <div>
            <h2 id="confirmar-remocoes-titulo" className="text-xl font-semibold">Remover horários da grade?</h2>
            <p id="confirmar-remocoes-descricao" className="mt-2 text-sm text-[#475569]">Os horários desmarcados deixarão de ser considerados na disponibilidade de {professor?.nome}. Essa alteração não pode ser desfeita automaticamente.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setConfirmarRemocoes(false)} disabled={salvando}>Voltar à grade</Button>
            <Button type="button" variant="danger" onClick={() => { void salvarGrade(); }} disabled={salvando} className="gap-2 text-sm">
              {salvando ? <LoaderCircle className="size-4 animate-spin" /> : <X className="size-4" />}
              Confirmar remoções
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function mesmoConjunto(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((item) => b.has(item));
}

function mensagemErro(error: unknown, fallback: string) {
  return error instanceof ApiError && error.message ? error.message : fallback;
}
