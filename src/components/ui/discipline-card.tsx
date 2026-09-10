"use client";

import { FaChalkboardTeacher } from "react-icons/fa";
import { University } from "lucide-react";

type DisciplineCardProps = {
  id: string;
  disciplina: string;
  professor: string;
  sala?: string;
  cor?: string;
  dentroDaTabela?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export default function DisciplineCard({
  id,
  disciplina,
  professor,
  sala,
  cor = "#FF0000",
  dentroDaTabela = false,
  onDragStart,
  onDragEnd,
}: DisciplineCardProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.clearData();

    event.dataTransfer.setData(
      "discipline",
      JSON.stringify({
        id,
        disciplina,
        professor,
        sala,
        cor,
      }),
    );

    event.dataTransfer.effectAllowed = "move";

    onDragStart?.();
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={
        dentroDaTabela
          ? {
              backgroundColor: cor,
            }
          : undefined
      }
      className={`relative min-h-[64px] w-full select-none overflow-hidden rounded-lg border px-3 py-2 shadow-sm transition ${
        dentroDaTabela
          ? "cursor-grab border-transparent text-white active:cursor-grabbing"
          : "cursor-grab border-[#D9D9D9] bg-white active:cursor-grabbing hover:shadow-md"
      }`}
    >
      {!dentroDaTabela && (
        <div
          className="absolute left-0 top-0 h-full w-[6px]"
          style={{
            backgroundColor: cor,
          }}
        />
      )}

      <div
        className={
          dentroDaTabela ? "flex min-w-0 flex-col gap-1" : "min-w-0 pl-1"
        }
      >
        {/* Disciplina */}
        <p
          className={`break-words font-semibold leading-tight ${
            dentroDaTabela
              ? "text-[clamp(10px,1vw,14px)] text-white"
              : "text-sm text-[#171717]"
          }`}
          title={disciplina}
        >
          {disciplina}
        </p>

        {/* Professor */}
        <div
          className={`flex min-w-0 items-center gap-1.5 text-xs leading-tight ${
            dentroDaTabela ? "text-white/90" : "text-[#858585]"
          }`}
        >
          <FaChalkboardTeacher className="h-3.5 w-3.5 shrink-0" />

          <span className="min-w-0 break-words" title={professor}>
            {professor}
          </span>
        </div>

        {/* Sala */}
        {sala && (
          <div
            className={`flex min-w-0 items-center gap-1.5 text-xs leading-tight ${
              dentroDaTabela ? "text-white/90" : "text-[#858585]"
            }`}
          >
            <University className="h-3.5 w-3.5 shrink-0" />

            <span className="min-w-0 break-words" title={sala}>
              {sala}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
