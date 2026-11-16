"use client";

import { Fragment, useState } from "react";
import DisciplineCard, { DISCIPLINE_DND_MIME } from "./discipline-card";
import type { Discipline } from "./discipline-list";

export type DiaSemana =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";
export type Aula = {
  id: string;
  dia: DiaSemana;
  inicio: string;
  fim: string;
  disciplina: string;
  professor: string;
  sala: string;
  cor?: string;
};
type Horario = { inicio: string; fim: string };
type Intervalo = Horario & { depoisDoHorario: string };
type TimetableProps = {
  horarios?: Horario[];
  intervalos?: Intervalo[];
  aulas: Aula[];
  onAulaDrop: (
    disciplina: Discipline,
    dia: DiaSemana,
    horario: Horario,
  ) => void;
  onDragStateChange?: (arrastando: boolean) => void;
  // Props opcionais: os usos anteriores do componente continuam compatíveis.
  onDropOcupado?: (
    disciplina: Discipline,
    dia: DiaSemana,
    horario: Horario,
  ) => void;
  onAulaClick?: (aula: Aula) => void;
  somenteLeitura?: boolean;
};
const dias: { key: DiaSemana; label: string }[] = [
  { key: "segunda", label: "SEGUNDA" },
  { key: "terca", label: "TERÇA" },
  { key: "quarta", label: "QUARTA" },
  { key: "quinta", label: "QUINTA" },
  { key: "sexta", label: "SEXTA" },
  { key: "sabado", label: "SÁBADO" },
];
const horariosPadrao: Horario[] = [
  { inicio: "13:20", fim: "14:10" },
  { inicio: "14:10", fim: "15:00" },
  { inicio: "15:10", fim: "16:00" },
  { inicio: "16:00", fim: "16:50" },
  { inicio: "17:00", fim: "17:50" },
  { inicio: "17:50", fim: "18:40" },
];
const intervalosPadrao: Intervalo[] = [
  { inicio: "15:00", fim: "15:10", depoisDoHorario: "15:00" },
  { inicio: "16:50", fim: "17:00", depoisDoHorario: "16:50" },
];

export default function Timetable({
  horarios = horariosPadrao,
  intervalos = intervalosPadrao,
  aulas,
  onAulaDrop,
  onDragStateChange,
  onDropOcupado,
  onAulaClick,
  somenteLeitura = false,
}: TimetableProps) {
  const [celulaHover, setCelulaHover] = useState<string | null>(null);
  const getAula = (dia: DiaSemana, horario: Horario) =>
    aulas.find(
      (aula) =>
        aula.dia === dia &&
        aula.inicio === horario.inicio &&
        aula.fim === horario.fim,
    );
  const handleDragOver = (
    event: React.DragEvent<HTMLTableCellElement>,
    celulaId: string,
    aulaExiste: boolean,
  ) => {
    if (somenteLeitura || (aulaExiste && !onDropOcupado)) {
      event.dataTransfer.dropEffect = "none";
      setCelulaHover(null);
      return;
    }
    // O drop também precisa chegar à tela pai quando houver um aviso de conflito.
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setCelulaHover(aulaExiste ? null : celulaId);
  };
  const handleDrop = (
    event: React.DragEvent<HTMLTableCellElement>,
    dia: DiaSemana,
    horario: Horario,
  ) => {
    event.preventDefault();
    if (somenteLeitura) {
      setCelulaHover(null);
      return;
    }
    const data =
      event.dataTransfer.getData(DISCIPLINE_DND_MIME) ||
      event.dataTransfer.getData("text/plain") ||
      event.dataTransfer.getData("discipline");
    try {
      if (!data || data.length > 16384) return;
      const valor: unknown = JSON.parse(data);
      if (
        !valor ||
        typeof valor !== "object" ||
        typeof (valor as { id?: unknown }).id !== "string"
      )
        return;
      const disciplina = valor as Discipline;
      if (getAula(dia, horario)) {
        // Não sobrescreve a aula. A tela decide apenas qual aviso mostrar.
        onDropOcupado?.(disciplina, dia, horario);
        return;
      }
      onAulaDrop(disciplina, dia, horario);
    } catch (error) {
      console.error("Erro ao interpretar disciplina:", error);
    } finally {
      setCelulaHover(null);
      onDragStateChange?.(false);
    }
  };
  const getIntervalo = (horario: Horario) =>
    intervalos.find((intervalo) => intervalo.depoisDoHorario === horario.fim);

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-[#0099AA] bg-white ${
        somenteLeitura
          ? onAulaClick
            ? "[&_[draggable]]:cursor-pointer [&_[draggable]]:active:cursor-pointer"
            : "[&_[draggable]]:cursor-default [&_[draggable]]:active:cursor-default"
          : ""
      }`}
      onDragStartCapture={(event) => {
        if (somenteLeitura) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-[150px] bg-[#0099AA] px-2 py-4 text-center text-s font-semibold text-white">
              HORÁRIO
            </th>
            {dias.map((dia) => (
              <th
                key={dia.key}
                className="bg-[#0099AA] px-2 py-4 text-center text-s font-semibold text-white"
              >
                {dia.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horarios.map((horario) => {
            const intervalo = getIntervalo(horario);
            return (
              <Fragment key={horario.inicio + "-" + horario.fim}>
                <tr>
                  <td className="h-[110px] border-t border-[#0099AA] bg-[#D9F3F4] px-2 text-center align-middle text-sm font-bold text-[#0099AA]">
                    {horario.inicio} - {horario.fim}
                  </td>
                  {dias.map((dia) => {
                    const celulaId = dia.key + "-" + horario.inicio;
                    const aula = getAula(dia.key, horario);
                    const celulaOcupada = !!aula;
                    return (
                      <td
                        key={celulaId}
                        onDragOver={(event) =>
                          handleDragOver(event, celulaId, celulaOcupada)
                        }
                        onDragLeave={() => setCelulaHover(null)}
                        onDrop={(event) => handleDrop(event, dia.key, horario)}
                        className={`h-[110px] border-l border-t border-[#0099AA] p-2 align-middle transition ${
                          celulaOcupada
                            ? "bg-[#F5F5F5]"
                            : !somenteLeitura && celulaHover === celulaId
                              ? "bg-[#E6F8F9]"
                              : "bg-white"
                        }`}
                      >
                        {aula && (
                          <div
                            role={onAulaClick ? "button" : undefined}
                            tabIndex={onAulaClick ? 0 : undefined}
                            aria-label={
                              onAulaClick
                                ? "Ver detalhes de " + aula.disciplina
                                : undefined
                            }
                            className={
                              onAulaClick
                                ? "rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17264D]"
                                : undefined
                            }
                            onClick={() => onAulaClick?.(aula)}
                            onDragStart={(event) => {
                              // O ID da ocorrência acompanha o card até o destino do drop.
                              const payload = JSON.stringify({
                                ...aula,
                                aulaId: aula.id,
                              });
                              event.dataTransfer.setData(DISCIPLINE_DND_MIME, payload);
                              event.dataTransfer.setData("text/plain", payload);
                              event.dataTransfer.effectAllowed = "move";
                              onDragStateChange?.(true);
                            }}
                            onDragEnd={() => onDragStateChange?.(false)}
                            onKeyDown={(event) => {
                              if (
                                onAulaClick &&
                                (event.key === "Enter" || event.key === " ")
                              ) {
                                event.preventDefault();
                                onAulaClick(aula);
                              }
                            }}
                          >
                            <DisciplineCard
                              id={aula.id}
                              disciplina={aula.disciplina}
                              professor={aula.professor}
                              sala={aula.sala}
                              cor={aula.cor}
                              dentroDaTabela
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                {intervalo && (
                  <tr>
                    <td
                      colSpan={7}
                      className="h-[24px] border-t border-[#0099AA] bg-[#EEEEEE] px-2 text-center text-xs font-bold text-[#777777]"
                    >
                      {intervalo.inicio} — {intervalo.fim}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
