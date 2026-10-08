"use client";

import { useState, type DragEvent } from "react";
import { TbBulb } from "react-icons/tb";
import { Trash2 } from "lucide-react";
import DisciplineCard from "./discipline-card";
import {
  ehDragDeDisciplina,
  lerDisciplinaArrastada,
} from "../alocacao/drag-and-drop";
import type { Discipline } from "../alocacao/tipos";

export type { Discipline } from "../alocacao/tipos";

type DisciplineListProps = {
  disciplinas: Discipline[];
  arrastando: boolean;
  onRemove: (aulaId: string) => void;
  onRemoveAll?: () => void;
  onDragStateChange?: (arrastando: boolean) => void;
  onSelect?: (id: string) => void;
  disciplinaSelecionada?: string | null;
};

export default function DisciplineList({
  disciplinas,
  arrastando,
  onRemove,
  onDragStateChange,
  onSelect,
  disciplinaSelecionada,
}: DisciplineListProps) {
  const [hoverRemover, setHoverRemover] = useState(false);
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!ehDragDeDisciplina(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setHoverRemover(true);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dados = lerDisciplinaArrastada(event.dataTransfer);
    // Arrastar um cadastro da lista não remove o cadastro da disciplina.
    if (dados?.aulaId) onRemove(dados.aulaId);
    setHoverRemover(false);
    onDragStateChange?.(false);
  };

  return (
    <aside className="flex min-h-0 min-w-0 w-full flex-col md:h-[780px] md:border-r md:border-[#D9D9D9] md:pr-5">
      <h2 className="mb-3 shrink-0 text-xl font-semibold text-[#17264D]">
        Disciplinas
      </h2>
      <div className="mb-4 shrink-0 border-t border-[#D9D9D9]" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 overflow-auto p-1 md:pr-3">
          <div className="flex gap-3 md:flex-col">
            {disciplinas.map((disciplina) => (
              <div key={disciplina.id} className="w-[220px] shrink-0 md:w-full">
                <DisciplineCard
                  {...disciplina}
                  selecionado={disciplinaSelecionada === disciplina.id}
                  onClick={onSelect ? () => onSelect(disciplina.id) : undefined}
                  onDragStart={() => onDragStateChange?.(true)}
                  onDragEnd={() => onDragStateChange?.(false)}
                />
              </div>
            ))}
            {disciplinas.length === 0 && (
              <p className="text-sm text-[#777777]">
                Nenhuma disciplina cadastrada para esta grade.
              </p>
            )}
          </div>
        </div>
        {arrastando && (
          <div
            data-testid="removal-zone"
            onDragOver={handleDragOver}
            onDragLeave={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              )
                setHoverRemover(false);
            }}
            onDrop={handleDrop}
            className={`mt-4 flex min-h-[88px] flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 text-center text-sm font-medium transition ${
              hoverRemover
                ? "border-red-400 bg-red-50 text-red-600"
                : "border-[#BDBDBD] bg-[#F5F5F5] text-[#777777]"
            }`}
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            {hoverRemover
              ? "Solte aqui para remover da grade"
              : "Arraste aqui para remover da grade"}
          </div>
        )}
      </div>
      <div className="mt-5 shrink-0 border-t border-[#D9D9D9]" />
      <div className="flex shrink-0 items-start gap-2 pt-3 text-xs text-[#777777]">
        <TbBulb
          className="mt-0.5 h-5 w-5 shrink-0 text-[#CAAA00]"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          <span className="font-semibold text-[#17264D]">Dica:</span> arraste
          uma disciplina para a grade. Para remover, arraste o card de volta
          para a área de remoção.
          <span className="mt-2 block">
            Você também pode selecionar uma disciplina e clicar em um horário
            vazio.
          </span>
        </p>
      </div>
    </aside>
  );
}
