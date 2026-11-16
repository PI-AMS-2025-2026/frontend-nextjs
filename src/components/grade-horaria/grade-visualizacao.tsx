"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { quadroHorariosService } from "@/services/quadro-horarios.service";
import type { QuadroHorarioResponse } from "@/types/api";

const BASE = "/coordenador/grade-planejamento/grade-horaria";

function dataBR(value: string) {
    const data = value.slice(0, 10);
    const [ano, mes, dia] = data.split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : value;
}

function periodoLabel(grade: QuadroHorarioResponse) {
    const periodo = grade.periodoAtividadeQuadro;
    return periodo.tipoPeridoAtividadeQuadro === "ANUAL"
        ? `${periodo.ano} (Anual)`
        : `${periodo.periodo}º período de ${periodo.ano}`;
}

export function GradeVisualizacao({ gradeId }: { gradeId: string }) {
    const [grade, setGrade] = React.useState<QuadroHorarioResponse | null>(null);
    const [carregando, setCarregando] = React.useState(true);
    const [erro, setErro] = React.useState("");

    React.useEffect(() => {
        let ativa = true;
        quadroHorariosService.buscar(Number(gradeId))
            .then((resultado) => { if (ativa) setGrade(resultado); })
            .catch((error: unknown) => {
                if (!ativa) return;
                const apiError = error instanceof ApiError ? error : null;
                setErro(apiError?.status === 403
                    ? "Você não tem permissão para visualizar esta grade."
                    : apiError?.status === 404
                        ? "Grade horária não encontrada."
                        : error instanceof Error ? error.message : "Não foi possível carregar a grade horária.");
            })
            .finally(() => { if (ativa) setCarregando(false); });
        return () => { ativa = false; };
    }, [gradeId]);

    if (carregando) {
        return <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24"><Loader2 className="size-6 animate-spin text-[#0099AA]" /><span className="text-sm text-[#17264D]/70">Carregando grade...</span></div>;
    }

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex items-center gap-3">
                <Link href={BASE} aria-label="Voltar para as grades" className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"><ArrowLeft className="size-6" /></Link>
                <h1 className="text-3xl font-bold text-[#17264D]">Visualização de Grade</h1>
            </div>
            {erro ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div> : grade && (
                <section className="max-w-xl rounded-[10px] border border-[#C8CDD2] p-6">
                    <h2 className="mb-5 text-lg font-semibold text-[#17264D]">Informações da grade</h2>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div><dt className="text-sm font-semibold text-[#17264D]">Versão</dt><dd className="text-sm text-[#17264D]/70">{String(grade.versao).padStart(2, "0")}</dd></div>
                        <div><dt className="text-sm font-semibold text-[#17264D]">Data de criação</dt><dd className="text-sm text-[#17264D]/70">{dataBR(grade.dataCriacao)}</dd></div>
                        <div><dt className="text-sm font-semibold text-[#17264D]">Curso</dt><dd className="text-sm text-[#17264D]/70">{grade.curso.nome}</dd></div>
                        <div><dt className="text-sm font-semibold text-[#17264D]">Período letivo</dt><dd className="text-sm text-[#17264D]/70">{periodoLabel(grade)}</dd></div>
                        <div><dt className="text-sm font-semibold text-[#17264D]">Status</dt><dd className="text-sm text-[#17264D]/70">{grade.status === "ATIVO" ? "Ativo" : "Inativo"}</dd></div>
                    </dl>
                </section>
            )}
        </div>
    );
}
