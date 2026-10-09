"use client";

import { use } from "react";
import { GradeVisualizacao } from "@/components/grade-horaria/grade-visualizacao";

export default function GradeVisualizacaoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
        <div className="flex min-h-screen w-full flex-col bg-white">
            <GradeVisualizacao gradeId={id} />
        </div>
    );
}