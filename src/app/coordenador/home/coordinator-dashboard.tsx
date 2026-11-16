
"use client";

import Link from "next/link";
import {
    BookMarked,
    CalendarDays,
    ChevronRight,
    UsersRound,
} from "lucide-react";

const acessosRapidos = [
    {
        titulo: "Turmas",
        descricao: "Cadastre, edite e gerencie as turmas da instituição",
        href: "/coordenador/estrutura-academica/turmas",
        cor: "#7B47C3",
        icone: UsersRound,
    },
    {
        titulo: "Período Letivo",
        descricao:
            "Cadastre, edite e gerencie os períodos letivos da instituição",
        href: "/coordenador/estrutura-academica/periodo-letivo",
        cor: "#365BE5",
        icone: BookMarked,
    },
    {
        titulo: "Alocação",
        descricao: "Realize e edite as alocações da instituição",
        href: "/coordenador/grade-planejamento/alocacao",
        cor: "#E8588B",
        icone: CalendarDays,
    },
];

const resumoInfraestrutura = [
    {
        titulo: "Alocações realizadas",
        quantidade: 13,
        href: "/coordenador/grade-planejamento/alocacao",
        icone: CalendarDays,
    },
    {
        titulo: "Turmas cadastradas",
        quantidade: 13,
        href: "/coordenador/estrutura-academica/turmas",
        icone: UsersRound,
    },
    {
        titulo: "Períodos Letivos cadastrados",
        quantidade: 13,
        href: "/coordenador/estrutura-academica/periodo-letivo",
        icone: BookMarked,
    },
];

export function CoordinatorDashboard() {
    return (
        <main className="w-full bg-white px-4 pb-8 pt-8 sm:px-8">
            <div className="mx-auto w-full max-w-[1450px]">
                <section aria-labelledby="acessos-rapidos">
                    <div className="mb-5">
                        <h1
                            id="acessos-rapidos"
                            className="text-[18px] font-bold leading-6 text-black"
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
                                    className="group flex min-h-[116px] items-center gap-4 rounded-[6px] border bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA]"
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
                                            className="text-[17px] font-bold leading-6"
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
                        className="text-[20px] font-semibold leading-7"
                    >
                        Resumo da Infraestrutura
                    </h2>

                    <p className="mt-1 text-[12px] leading-4 text-white/70">
                        Acompanhe os principais dados da estrutura física da instituição.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-7 md:grid-cols-3">
                        {resumoInfraestrutura.map((item) => {
                            const Icone = item.icone;

                            return (
                                <article
                                    key={item.titulo}
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
                                            <h3 className="text-[15px] font-semibold leading-5">
                                                {item.titulo}
                                            </h3>

                                            <p className="mt-1 text-[26px] font-bold leading-7">
                                                {item.quantidade}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={item.href}
                                        className="mt-auto flex h-[30px] w-fit items-center gap-2 rounded-[5px] border border-[#365BE5] bg-[#DCE6FF] px-3 text-[12px] font-medium text-[#365BE5] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        Ver detalhes

                                        <ChevronRight
                                            size={17}
                                            strokeWidth={2}
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}
