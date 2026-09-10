"use client";

import { Fragment, useState } from "react";
import DisciplineCard from "./discipline-card";
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

type Horario = {
  inicio: string;
  fim: string;
};

type Intervalo = {
  inicio: string;
  fim: string;
  depoisDoHorario: string;
};

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
};

const dias: {
  key: DiaSemana;
  label: string;
}[] = [
  {
    key: "segunda",
    label: "SEGUNDA",
  },
  {
    key: "terca",
    label: "TERÇA",
  },
  {
    key: "quarta",
    label: "QUARTA",
  },
  {
    key: "quinta",
    label: "QUINTA",
  },
  {
    key: "sexta",
    label: "SEXTA",
  },
  {
    key: "sabado",
    label: "SÁBADO",
  },
];

const horariosPadrao: Horario[] = [
  {
    inicio: "13:20",
    fim: "14:10",
  },
  {
    inicio: "14:10",
    fim: "15:00",
  },
  {
    inicio: "15:10",
    fim: "16:00",
  },
  {
    inicio: "16:00",
    fim: "16:50",
  },
  {
    inicio: "17:00",
    fim: "17:50",
  },
  {
    inicio: "17:50",
    fim: "18:40",
  },
];

const intervalosPadrao: Intervalo[] = [
  {
    inicio: "15:00",
    fim: "15:10",
    depoisDoHorario: "15:00",
  },
  {
    inicio: "16:50",
    fim: "17:00",
    depoisDoHorario: "16:50",
  },
];

export default function Timetable({
  horarios = horariosPadrao,
  intervalos = intervalosPadrao,
  aulas,
  onAulaDrop,
  onDragStateChange,
}: TimetableProps) {
  const [celulaHover, setCelulaHover] = useState<string | null>(null);

  const handleDragOver = (
    event: React.DragEvent<HTMLTableCellElement>,
    celulaId: string,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setCelulaHover(celulaId);
  };

  const handleDragLeave = () => {
    setCelulaHover(null);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLTableCellElement>,
    dia: DiaSemana,
    horario: Horario,
  ) => {
    event.preventDefault();

    const data = event.dataTransfer.getData("discipline");

    if (!data) {
      setCelulaHover(null);
      return;
    }

    try {
      const disciplina: Discipline = JSON.parse(data);

      onAulaDrop(disciplina, dia, horario);
    } catch (error) {
      console.error("Erro ao interpretar disciplina:", error);
    }

    setCelulaHover(null);
    onDragStateChange?.(false);
  };

  const getAula = (dia: DiaSemana, horario: Horario) => {
    return aulas.find(
      (aula) =>
        aula.dia === dia &&
        aula.inicio === horario.inicio &&
        aula.fim === horario.fim,
    );
  };

  const getIntervalo = (horario: Horario) => {
    return intervalos.find(
      (intervalo) =>
        intervalo.depoisDoHorario === horario.inicio ||
        intervalo.depoisDoHorario === horario.fim,
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#0099AA] bg-white">
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
              <Fragment key={`${horario.inicio}-${horario.fim}`}>
                <tr>
                  <td className="h-[80px] border-t border-[#0099AA] bg-[#D9F3F4] px-2 text-center align-middle text-sm font-bold text-[#0099AA]">
                    {horario.inicio} - {horario.fim}
                  </td>

                  {dias.map((dia) => {
                    const celulaId = `${dia.key}-${horario.inicio}`;

                    const aula = getAula(dia.key, horario);

                    return (
                      <td
                        key={celulaId}
                        onDragOver={(event) => handleDragOver(event, celulaId)}
                        onDragLeave={handleDragLeave}
                        onDrop={(event) => handleDrop(event, dia.key, horario)}
                        className={`h-[80px] border-l border-t border-[#0099AA] p-2 align-middle transition ${
                          celulaHover === celulaId ? "bg-[#E6F8F9]" : "bg-white"
                        }`}
                      >
                        {aula && (
                          <DisciplineCard
                            id={aula.id}
                            disciplina={aula.disciplina}
                            professor={aula.professor}
                            sala={aula.sala}
                            cor={aula.cor}
                            dentroDaTabela
                            onDragStart={() => onDragStateChange?.(true)}
                            onDragEnd={() => onDragStateChange?.(false)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>

                {intervalo && (
                  <tr>
                    <td
                      colSpan={7}
                      className="h-[24px] border-t border-[#0099AA] bg-[#EEEEEE] px-2 text-center text-xs font-medium text-[#777777]"
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
