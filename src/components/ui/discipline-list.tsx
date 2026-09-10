"use client";

import { useState } from "react";
import { TbBulb } from "react-icons/tb";
import DisciplineCard from "./discipline-card";

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
  onRemove: (id: string) => void;
  onDragStateChange?: (arrastando: boolean) => void;
};

export default function DisciplineList({
  disciplinas,
  arrastando,
  onRemove,
  onDragStateChange,
}: DisciplineListProps) {
  const [hoverRemover, setHoverRemover] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setHoverRemover(true);
  };

  const handleDragLeave = () => {
    setHoverRemover(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const data = event.dataTransfer.getData("discipline");

    if (!data) {
      setHoverRemover(false);
      onDragStateChange?.(false);
      return;
    }

    try {
      const disciplina: Discipline = JSON.parse(data);

      onRemove(disciplina.id);
    } catch (error) {
      console.error("Erro ao ler disciplina:", error);
    }

    setHoverRemover(false);
    onDragStateChange?.(false);
  };

  return (
    <aside className="flex h-full w-full min-h-0 flex-col rounded-lg p-4">
      <h2 className="mb-4 shrink-0 text-3xl font-semibold text-[#17264D]">
        Disciplinas
      </h2>

      {/* Separador entre título e cards */}
      <div className="mb-4 w-full max-w-[280px] border-t border-[#D9D9D9]" />

      <div className="min-h-0 flex-1 overflow-y-auto pr-4">
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

          {arrastando && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-[72px] w-full max-w-[280px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed px-4 text-center text-sm font-medium transition ${
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

          {/* Separador antes da dica */}
          <div className="mt-3 w-full max-w-[280px] border-t border-[#D9D9D9]" />

          {/* Dica */}
          <div className="flex w-full max-w-[280px] items-start gap-2 pt-1 text-sm text-[#777777]">
            <TbBulb className="mt-0.5 h-5 w-5 shrink-0 text-[#FAD207] border-[#000000]" />

            <p className="leading-relaxed">
              <span className="font-semibold text-[#17264D]">Dica:</span>{" "}
              arraste uma disciplina para a grade para adicioná-la. Para
              remover, arraste-a de volta para a área de remoção.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
