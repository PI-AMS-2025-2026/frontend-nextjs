"use client";

import { useState } from "react";
import { TbBulb } from "react-icons/tb";
import DisciplineCard, { DISCIPLINE_DND_MIME } from "./discipline-card";

export type Discipline = {
  id: string;
  disciplina: string;
  professor: string;
  sala: string;
  cor?: string;
};

type DisciplineListProps = {
  disciplinas: Discipline[];
  arrastando: boolean;
  // aulaId identifica a ocorrência na grade; callbacks antigos de um argumento continuam válidos.
  onRemove: (id: string, aulaId?: string) => void;
  onRemoveAll?: () => void;
  onDragStateChange?: (arrastando: boolean) => void;
};

export default function DisciplineList({
  disciplinas,
  arrastando,
  onRemove,
  onRemoveAll,
  onDragStateChange,
}: DisciplineListProps) {
  const [hoverRemover, setHoverRemover] = useState(false);
  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setHoverRemover(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) return;
    setHoverRemover(false);
  };
  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const data =
      event.dataTransfer.getData(DISCIPLINE_DND_MIME) ||
      event.dataTransfer.getData("text/plain") ||
      event.dataTransfer.getData("discipline");
    try {
      if (!data || data.length > 16384) return;
      const valor: unknown = JSON.parse(data);
      if (!valor || typeof valor !== "object") return;
      const payload = valor as { id?: unknown; aulaId?: unknown };
      if (typeof payload.id !== "string" || !payload.id) return;
      const aulaId =
        typeof payload.aulaId === "string" && payload.aulaId
          ? payload.aulaId
          : undefined;
      onRemove(aulaId ?? payload.id, aulaId);
    } catch (error) {
      console.error("Erro ao ler disciplina:", error);
    } finally {
      setHoverRemover(false);
      onDragStateChange?.(false);
    }
  };

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col rounded-lg p-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="mb-4 shrink-0 text-3xl font-semibold text-[#17264D]">
        Disciplinas
      </h2>
      <div className="mb-4 w-full max-w-[280px] shrink-0 border-t border-[#D9D9D9]" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 overflow-y-auto pr-4">
          <div className="flex flex-col gap-3">
            {disciplinas.map((disciplina) => (
              <div key={disciplina.id} className="w-full max-w-[280px]">
                <DisciplineCard
                  id={disciplina.id}
                  disciplina={disciplina.disciplina}
                  professor={disciplina.professor}
                  sala={disciplina.sala}
                  cor={disciplina.cor}
                  onDragStart={() => onDragStateChange?.(true)}
                  onDragEnd={() => onDragStateChange?.(false)}
                />
              </div>
            ))}
          </div>
        </div>
        {arrastando && (
          <div
            className={`mt-3 flex min-h-[72px] flex-1 items-center justify-center rounded-lg border-2 border-dashed px-4 text-center text-sm font-medium transition ${
              hoverRemover
                ? "border-red-400 bg-red-50 text-red-600"
                : "border-[#BDBDBD] bg-[#EEEEEE] text-[#777777]"
            }`}
          >
            {hoverRemover
              ? "Solte aqui para remover"
              : "Arraste aqui para remover"}
          </div>
        )}
      </div>
      <div className="mt-3 w-full max-w-[280px] shrink-0 border-t border-[#D9D9D9]" />
      <div className="flex w-full max-w-[280px] shrink-0 items-start gap-2 pt-1 text-sm text-[#777777]">
        <TbBulb className="mt-0.5 h-5 w-5 shrink-0 border-[#000000] text-[#FAD207]" />
        <p className="leading-relaxed">
          <span className="font-semibold text-[#17264D]">Dica:</span> arraste
          uma disciplina para a grade para adicioná-la. Para remover, arraste-a
          de volta para a área de remoção.
        </p>
      </div>
    </aside>
  );
}
