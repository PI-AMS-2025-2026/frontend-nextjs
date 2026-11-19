"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LoaderCircle,
  UsersRound,
} from "lucide-react";

import { cursosService } from "@/services/cursos.service";
import { professoresService } from "@/services/professores.service";
import { usuariosService } from "@/services/usuarios.service";

type ResumoId = "professores" | "usuarios" | "cursos";

type ResumoState = {
  total: number | null;
  carregando: boolean;
  erro: boolean;
};

const carregarTotal: Record<ResumoId, () => Promise<number>> = {
  professores: async () =>
    (await professoresService.listar({ size: 1 })).totalElements,
  usuarios: async () =>
    (await usuariosService.listar({ size: 1 })).totalElements,
  cursos: async () =>
    (await cursosService.listar({ size: 1 })).totalElements,
};

const acessosRapidos = [
  {
    titulo: "Professores",
    descricao: "Cadastre, edite e gerencie os professores da instituição",
    href: "/administrador/gestao-usuarios/professores",
    cor: "#0BAFA8",
    icone: UsersRound,
  },
  {
    titulo: "Usuários",
    descricao: "Cadastre, edite e gerencie os usuários da instituição",
    href: "/administrador/gestao-usuarios/usuarios",
    cor: "#7B47C3",
    icone: BookOpen,
  },
  {
    titulo: "Cursos",
    descricao: "Cadastre, edite e gerencie os cursos da instituição",
    href: "/administrador/estrutura-academica/cursos",
    cor: "#1F59D6",
    icone: GraduationCap,
  },
] as const;

const resumoInfraestrutura = [
  {
    id: "professores",
    titulo: "Professores cadastrados",
    href: "/administrador/gestao-usuarios/professores",
    icone: UsersRound,
  },
  {
    id: "usuarios",
    titulo: "Usuários cadastrados",
    href: "/administrador/gestao-usuarios/usuarios",
    icone: BookOpen,
  },
  {
    id: "cursos",
    titulo: "Cursos cadastrados",
    href: "/administrador/estrutura-academica/cursos",
    icone: GraduationCap,
  },
] as const;

const estadoInicial: Record<ResumoId, ResumoState> = {
  professores: { total: null, carregando: true, erro: false },
  usuarios: { total: null, carregando: true, erro: false },
  cursos: { total: null, carregando: true, erro: false },
};

function formatarTotal(total: number) {
  return new Intl.NumberFormat("pt-BR").format(total);
}

export function AdministratorDashboard() {
  const [resumo, setResumo] = React.useState(estadoInicial);
  const requisicoes = React.useRef<Record<ResumoId, number>>({
    professores: 0,
    usuarios: 0,
    cursos: 0,
  });

  const carregarResumo = React.useCallback(async (id: ResumoId) => {
    const requisicao = ++requisicoes.current[id];
    setResumo((atual) => ({
      ...atual,
      [id]: { ...atual[id], carregando: true, erro: false },
    }));

    try {
      const total = await carregarTotal[id]();
      if (requisicoes.current[id] !== requisicao) return;

      setResumo((atual) => ({
        ...atual,
        [id]: { total, carregando: false, erro: false },
      }));
    } catch {
      if (requisicoes.current[id] !== requisicao) return;

      setResumo((atual) => ({
        ...atual,
        [id]: { total: null, carregando: false, erro: true },
      }));
    }
  }, []);

  React.useEffect(() => {
    const controleRequisicoes = requisicoes.current;
    let ativo = true;
    void Promise.resolve().then(() => {
      if (ativo) resumoInfraestrutura.forEach((item) => void carregarResumo(item.id));
    });

    return () => {
      ativo = false;
      resumoInfraestrutura.forEach((item) => {
        controleRequisicoes[item.id] += 1;
      });
    };
  }, [carregarResumo]);

  return (
    <main className="w-full bg-white px-4 pb-8 pt-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1450px]">
        <section aria-labelledby="acessos-rapidos">
          <div className="mb-5">
            <h1
              id="acessos-rapidos"
              className="text-[18px] leading-6 font-bold text-black"
            >
              Acessos Rápidos
            </h1>
            <p className="text-[12px] leading-4 text-[#858585]">
              Clique em um módulo para acessar as funcionalidades
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {acessosRapidos.map((acesso) => {
              const Icone = acesso.icone;

              return (
                <Link
                  key={acesso.titulo}
                  href={acesso.href}
                  style={{
                    borderColor: `${acesso.cor}80`,
                    boxShadow: `0 1px 4px ${acesso.cor}55`,
                  }}
                  className="group flex min-h-[116px] items-center gap-4 rounded-[6px] border bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0099AA] focus-visible:outline-none"
                >
                  <Icone
                    size={48}
                    strokeWidth={1.6}
                    color={acesso.cor}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <h2
                      className="text-[17px] leading-6 font-bold"
                      style={{ color: acesso.cor }}
                    >
                      {acesso.titulo}
                    </h2>
                    <p className="mt-3 text-[11px] leading-[14px] text-[#858585]">
                      {acesso.descricao}
                    </p>
                  </div>
                  <ChevronRight
                    size={22}
                    strokeWidth={2}
                    color={acesso.cor}
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="resumo-infraestrutura"
          className="mt-6 rounded-[12px] bg-gradient-to-r from-[#2D879A] to-[#205467] px-7 py-7 text-white sm:px-8"
        >
          <h2
            id="resumo-infraestrutura"
            className="text-[20px] leading-7 font-semibold"
          >
            Resumo da Infraestrutura
          </h2>
          <p className="mt-1 text-[12px] leading-4 text-white/70">
            Acompanhe os principais dados da estrutura física da instituição.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-7 md:grid-cols-3">
            {resumoInfraestrutura.map((item) => {
              const Icone = item.icone;
              const estado = resumo[item.id];

              return (
                <article
                  key={item.id}
                  className="flex min-h-[146px] flex-col rounded-[11px] bg-white/25 px-5 py-5"
                >
                  <div className="flex items-center gap-3">
                    <Icone
                      size={42}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#93B3FF]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h3 className="text-[15px] leading-5 font-semibold">
                        {item.titulo}
                      </h3>
                      <div
                        className="mt-1 min-h-7 text-[26px] leading-7 font-bold"
                        aria-live="polite"
                      >
                        {estado.carregando ? (
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <LoaderCircle
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                            Carregando...
                          </span>
                        ) : estado.erro ? (
                          <span className="text-base font-semibold">—</span>
                        ) : (
                          formatarTotal(estado.total ?? 0)
                        )}
                      </div>
                    </div>
                  </div>

                  {estado.erro ? (
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
                      <p className="text-xs text-white" role="alert">
                        Não foi possível carregar o total.
                      </p>
                      <button
                        type="button"
                        onClick={() => void carregarResumo(item.id)}
                        className="text-xs font-semibold underline underline-offset-2 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="mt-auto flex h-[30px] w-fit items-center gap-2 rounded-[5px] border border-[#365BE5] bg-[#DCE6FF] px-3 text-[12px] font-medium text-[#365BE5] transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      Ver detalhes
                      <ChevronRight size={17} strokeWidth={2} aria-hidden="true" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
