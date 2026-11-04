"use client";

import type { DragEvent, KeyboardEvent } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { University } from "lucide-react";
import { DISCIPLINE_DND_MIME } from "../alocacao/drag-and-drop";
import { corTexto } from "../alocacao/tipos";

export { DISCIPLINE_DND_MIME } from "../alocacao/drag-and-drop";

type DisciplineCardProps = {
  id: string;
  aulaId?: string;
  disciplina: string;
  professor: string;
  sala?: string;
  cor?: string;
  dentroDaTabela?: boolean;
  selecionado?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export default function DisciplineCard({
  id,
  aulaId,
  disciplina,
  professor,
  sala,
  cor = "#0099AA",
  dentroDaTabela = false,
  selecionado = false,
  onClick,
  onDragStart,
  onDragEnd,
}: DisciplineCardProps) {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    const payload = JSON.stringify({
      id,
      aulaId,
      disciplina,
      professor,
      sala,
      cor,
    });
    event.dataTransfer.setData(DISCIPLINE_DND_MIME, payload);
    event.dataTransfer.setData("text/plain", payload);
    event.dataTransfer.effectAllowed = "move";
    onDragStart?.();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };
  const texto = dentroDaTabela ? corTexto(cor) : undefined;

  return (
    <div
      draggable
      role={onClick ? "button" : "group"}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${disciplina}, professor ${professor}${sala ? `, ${sala}` : ""}`}
      aria-pressed={!dentroDaTabela && onClick ? selecionado : undefined}
      data-discipline-id={id}
      data-aula-id={aulaId}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={
        dentroDaTabela ? { backgroundColor: cor, color: texto } : undefined
      }
      className={`relative min-h-[76px] w-full cursor-grab select-none overflow-hidden rounded-lg border px-3 py-2.5 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] focus-visible:ring-offset-2 active:cursor-grabbing ${
        dentroDaTabela
          ? "border-transparent"
          : "border-[#D9D9D9] bg-white hover:shadow-md"
      } ${selecionado ? "ring-2 ring-[#0099AA] ring-offset-2" : ""}`}
    >
      {!dentroDaTabela && (
        <div
          className="absolute left-0 top-0 h-full w-[5px]"
          style={{ backgroundColor: cor }}
        />
      )}
      <div
        className={
          dentroDaTabela ? "flex min-w-0 flex-col gap-1.5" : "min-w-0 pl-1"
        }
      >
        <p
          className={`break-words font-semibold leading-tight ${dentroDaTabela ? "text-[12px]" : "text-sm text-[#171717]"}`}
          title={disciplina}
        >
          {disciplina}
        </p>
        <div
          className={`flex min-w-0 items-center gap-1.5 text-xs leading-snug ${dentroDaTabela ? "opacity-90" : "mt-1.5 text-[#777777]"}`}
        >
          <FaChalkboardTeacher
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
          <span className="min-w-0 break-words" title={professor}>
            {professor}
          </span>
        </div>
        {sala && (
          <div
            className={`flex min-w-0 items-center gap-1.5 text-xs leading-snug ${dentroDaTabela ? "opacity-90" : "mt-1 text-[#777777]"}`}
          >
            <University className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words" title={sala}>
              {sala}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
