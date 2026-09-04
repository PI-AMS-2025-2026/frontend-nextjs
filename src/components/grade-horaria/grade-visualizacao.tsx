"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

import {
    carregarGradesSalvas,
    DIAS_SEMANA,
    horariosDoTurno,
    type GradeHoraria,
} from "@/lib/grade-horaria";

const BASE = "/adminstrador/grade-planejamento/grade-horaria";

export function GradeVisualizacao({ gradeId }: { gradeId: string }) {
    const [grade, setGrade] = React.useState<GradeHoraria | null | "nao-encontrada">(null);

    React.useEffect(() => {
        const salvas = carregarGradesSalvas();
        const encontrada = salvas?.find((g) => g.id === gradeId) ?? null;
        setGrade(encontrada ?? "nao-encontrada");
    }, [gradeId]);

    if (grade === null) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <Loader2 className="size-6 animate-spin text-[#0099AA]" />
                <span className="text-sm text-[#17264D]/70">Carregando grade...</span>
            </div>
        );
    }

    if (grade === "nao-encontrada") {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                <span className="text-sm text-[#17264D]/70">Grade não encontrada.</span>
                <Link href={BASE} className="text-sm font-medium text-[#0099AA] hover:underline">
                    Voltar para a listagem
                </Link>
            </div>
        );
    }

    const horarios = horariosDoTurno(grade.turno);

    const infos = [
        { titulo: "Versão", valor: String(grade.versao).padStart(2, "0") },
        { titulo: "Curso", valor: grade.cursoVinculado },
        { titulo: "Período Letivo", valor: grade.periodoLetivo },
        { titulo: "Período", valor: grade.turno },
    ];

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex items-center gap-3">
                <Link
                    href={BASE}
                    aria-label="Voltar"
                    className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                >
                    <ArrowLeft className="size-6" />
                </Link>
                <h1 className="text-3xl font-bold text-[#17264D]">Visualização de Grade</h1>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
                <div className="flex flex-col gap-4 rounded-[10px] border border-[#C8CDD2] p-5 md:h-fit">
                    <span className="text-sm font-semibold text-[#17264D]">Informações:</span>

                    {infos.map((info) => (
                        <div key={info.titulo} className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-[#17264D]">
                                {info.titulo}:
                            </span>
                            <span className="text-sm text-[#17264D]/70">{info.valor}</span>
                        </div>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-[10px] border border-[#C8CDD2]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="h-[51px] bg-[#0099AA] text-white">
                                <th className="px-6 text-left text-[16px] font-semibold whitespace-nowrap">
                                    Horário
                                </th>
                                {DIAS_SEMANA.map((dia) => (
                                    <th
                                        key={dia}
                                        className="px-6 text-center text-[16px] font-semibold whitespace-nowrap"
                                    >
                                        {dia}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {horarios.map((horario, index) => (
                                <tr
                                    key={horario}
                                    className={
                                        index % 2 === 0
                                            ? "h-[46px] border-b border-[#D0D4D8] bg-white"
                                            : "h-[46px] border-b border-[#D0D4D8] bg-[#F0F0F0]"
                                    }
                                >
                                    <td className="px-6 text-[16px] font-medium whitespace-nowrap text-[#0099AA]">
                                        {horario}
                                    </td>
                                    {DIAS_SEMANA.map((dia) => (
                                        <td key={dia} className="px-6 text-center">
                                            <button
                                                type="button"
                                                aria-label={`Adicionar aula em ${dia}, ${horario}`}
                                                className="mx-auto flex size-7 items-center justify-center rounded-md text-[#17264D]/50 transition-colors hover:bg-[#0099AA]/10 hover:text-[#0099AA]"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}