"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { authService } from "@/services/auth.service";
import { turmasService } from "@/services/turmas.service";
import { periodoAtividadeQuadroService } from "@/services/periodo-atividade-quadro.service";
import { quadroHorariosService } from "@/services/quadro-horarios.service";
import type { PageResponse, PeriodoAtividadeQuadroResponse, QuadroHorarioResponse, TurmaResponse, UsuarioResponse } from "@/types/api";
import { erroAlocacao } from "./integracao";

async function todasPaginas<T>(buscar: (page: number) => Promise<PageResponse<T>>): Promise<T[]> {
  const itens: T[] = [];
  let pagina = 0;
  let total = 1;
  do {
    const resultado = await buscar(pagina);
    itens.push(...resultado.content);
    total = resultado.totalPages;
    pagina += 1;
  } while (pagina < total);
  return itens;
}

export function SelecaoQuadro({ aoSelecionar }: { aoSelecionar: (id: number) => void }) {
  const [curso, setCurso] = useState<UsuarioResponse["curso"]>();
  const [turmas, setTurmas] = useState<TurmaResponse[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoAtividadeQuadroResponse[]>([]);
  const [turmaId, setTurmaId] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    const usuario = authService.getUser() as UsuarioResponse | null;
    if (!usuario || usuario.tipoUsuario !== "COORDENADOR" || !usuario.curso?.id) {
      setErro("Não foi possível identificar o curso do coordenador. Entre novamente ou solicite a associação do curso.");
      setCarregando(false);
      return () => { ativo = false; };
    }
    const cursoUsuario = usuario.curso;
    setCurso(cursoUsuario);
    setCarregando(true);
    setErro("");
    Promise.all([
      todasPaginas(page => turmasService.listar({ curso: cursoUsuario.id, status: "ATIVO", page, size: 100 })),
      todasPaginas(page => periodoAtividadeQuadroService.listar({ status: "ATIVO", page, size: 100 })),
    ]).then(([turmasApi, periodosApi]) => {
      if (!ativo) return;
      setTurmas(turmasApi.filter(t => t.status === "ATIVO" && t.curso.id === cursoUsuario.id));
      setPeriodos(periodosApi.filter(p => p.status === "ATIVO"));
    }).catch(error => { if (ativo) setErro(erroAlocacao(error)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  async function abrir() {
    const turma = turmas.find(t => String(t.id) === turmaId);
    const periodo = periodos.find(p => String(p.id) === periodoId);
    if (!curso || !turma || !periodo || abrindo) return;
    setAbrindo(true);
    setErro("");
    try {
      const quadros = await todasPaginas<QuadroHorarioResponse>(page => quadroHorariosService.listar({
        curso: curso.id, turma: turma.id, periodo_atividade_quadro: periodo.id, page, size: 100,
      }));
      const correspondentes = quadros.filter(q => q.curso.id === curso.id && q.turma?.id === turma.id && q.periodoAtividadeQuadro.id === periodo.id);
      const ativos = correspondentes.filter(q => q.status === "ATIVO");
      if (ativos.length > 1) throw new Error("ALOCACAO:Há mais de um quadro ativo para esta turma e período. Entre em contato com o administrador.");
      let quadro = ativos[0];
      if (!quadro && correspondentes.length) throw new Error("ALOCACAO:Não há quadro ativo para esta turma e período; existe histórico inativo. Solicite a reativação ou uma nova versão.");
      if (!quadro) quadro = await quadroHorariosService.criar({ versao: 1, status: "ATIVO", curso: { id: curso.id }, turma: { id: turma.id }, periodoAtividadeQuadro: { id: periodo.id } });
      if (quadro.curso.id !== curso.id || quadro.turma?.id !== turma.id || quadro.periodoAtividadeQuadro.id !== periodo.id || quadro.status !== "ATIVO") {
        throw new Error("ALOCACAO:O quadro retornado não corresponde à turma e ao período selecionados.");
      }
      aoSelecionar(quadro.id);
    } catch (error) { setErro(erroAlocacao(error)); }
    finally { setAbrindo(false); }
  }

  return <main className="mx-auto max-w-3xl p-6 md:p-10">
    <h1 className="text-2xl font-semibold text-[#17264D]">Montar horários</h1>
    <p className="mt-2 text-sm text-[#555]">Selecione uma turma cadastrada e o período letivo. Se ainda não existir quadro, será criado o primeiro.</p>
    {curso && <p className="mt-4 text-sm">Curso: <strong>{curso.nome}</strong></p>}
    {carregando ? <p role="status" className="mt-6">Carregando turmas e períodos...</p> : <div className="mt-6 grid gap-5">
      <div><label className="mb-2 block text-sm font-medium">Turma</label><Select aria-label="Turma" value={turmaId} onChange={setTurmaId} placeholder="Selecione a turma" options={turmas.map(t => ({ value: String(t.id), label: `${t.codigo} · ${t.ano} · ${t.periodo}º ${curso?.periodicidade?.toLowerCase() === "anual" ? "ano" : "semestre"}` }))} disabled={abrindo || !turmas.length} />{!turmas.length && !erro && <p className="mt-2 text-sm">Nenhuma turma ativa cadastrada para este curso.</p>}</div>
      <div><label className="mb-2 block text-sm font-medium">Período letivo</label><Select aria-label="Período letivo" value={periodoId} onChange={setPeriodoId} placeholder="Selecione o período letivo" options={periodos.map(p => ({ value: String(p.id), label: `${p.periodo}º período de ${p.ano}` }))} disabled={abrindo || !periodos.length} />{!periodos.length && !erro && <p className="mt-2 text-sm">Nenhum período letivo ativo cadastrado.</p>}</div>
      <Button onClick={() => void abrir()} disabled={!turmaId || !periodoId || abrindo}>{abrindo ? "Abrindo..." : "Abrir ou criar quadro"}</Button>
    </div>}
    {erro && <div role="alert" className="mt-5 text-sm text-red-700">{erro}{!carregando && <Button onClick={() => setTentativa(n => n + 1)}>Tentar novamente</Button>}</div>}
  </main>;
}
