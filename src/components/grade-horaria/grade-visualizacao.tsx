"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    carregarGradesSalvas,
    DIAS_SEMANA,
    horariosDoTurno,
    type GradeHoraria,
} from "@/lib/grade-horaria";

interface GradeVisualizacaoProps {
    gradeId: string;
}

export function GradeVisualizacao({ gradeId }: GradeVisualizacaoProps) {
    const [grade, setGrade] = React.useState<GradeHoraria | null | "nao-encontrada">(null);

    React.useEffect(() => {
        const salvas = carregarGradesSalvas();
        const encontrada = salvas?.find((g) => g.id === gradeId) ?? null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGrade(encontrada ?? "nao-encontrada");
    }, [gradeId]);

    if (grade === null) {
        return (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
                <Loader2 className="size-6 animate-spin text-[#2fa4b5]" />
                <span className="text-sm text-muted-foreground">Carregando grade...</span>
            </div>
        );
    }

    if (grade === "nao-encontrada") {
        return (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
                <span className="text-sm text-muted-foreground">Grade não encontrada.</span>
                <Link href="/grade-horaria" className="text-sm font-medium text-[#2fa4b5] hover:underline">
                    Voltar para a listagem
                </Link>
            </div>
        );
    }

    const horarios = horariosDoTurno(grade.turno);

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex items-center gap-3">
                <Link
                    href="/grade-horaria"
                    aria-label="Voltar"
                    className="flex size-9 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="size-6" />
                </Link>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    Visualização de Grade
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
                {/* Painel de informações */}
                <div className="flex flex-col gap-4 rounded-xl border border-[#e2ecee] p-5 md:h-fit">
                    <span className="text-sm font-semibold text-foreground">Informações:</span>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Versão:</span>
                        <span className="text-sm text-muted-foreground">
                            {String(grade.versao).padStart(2, "0")}
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Curso:</span>
                        <span className="text-sm text-muted-foreground">{grade.cursoVinculado}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Período Letivo:</span>
                        <span className="text-sm text-muted-foreground">{grade.periodoLetivo}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Período:</span>
                        <span className="text-sm text-muted-foreground">{grade.turno}</span>
                    </div>
                </div>

                {/* Grade de horários */}
                <div className="overflow-x-auto rounded-xl border border-[#e2ecee]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none bg-[#2f96a3] hover:bg-[#2f96a3]">
                                <TableHead className="h-11 px-4 text-sm font-semibold whitespace-nowrap text-white">
                                    Horário
                                </TableHead>
                                {DIAS_SEMANA.map((dia) => (
                                    <TableHead
                                        key={dia}
                                        className="h-11 px-4 text-center text-sm font-semibold whitespace-nowrap text-white"
                                    >
                                        {dia}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {horarios.map((horario, index) => (
                                <TableRow
                                    key={horario}
                                    className={index % 2 === 1 ? "border-none bg-[#f4f8f9]" : "border-none bg-white"}
                                >
                                    <TableCell className="px-4 py-3 text-sm font-medium whitespace-nowrap text-[#2fa4b5]">
                                        {horario}
                                    </TableCell>
                                    {DIAS_SEMANA.map((dia) => (
                                        <TableCell key={dia} className="px-4 py-3 text-center">
                                            {/* Slot vazio — clicar poderá futuramente abrir o cadastro de disciplina nesse horário */}
                                            <button
                                                type="button"
                                                aria-label={`Adicionar aula em ${dia}, ${horario}`}
                                                className="mx-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#2fa4b5]/10 hover:text-[#2fa4b5]"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}