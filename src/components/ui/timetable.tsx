"use client";

import { Fragment, useState, type DragEvent } from "react";
import { Plus } from "lucide-react";
import DisciplineCard from "./discipline-card";
import {
  ehDragDeDisciplina,
  lerDisciplinaArrastada,
} from "../alocacao/drag-and-drop";
import {
  DIAS,
  HORARIOS_PADRAO,
  INTERVALOS_PADRAO,
  chaveCelula,
  intervaloDepois,
  type Aula,
  type DiaSemana,
  type Horario,
  type Intervalo,
  type DisciplineDragData,
} from "../alocacao/tipos";

export type { Aula, DiaSemana, Horario, Intervalo } from "../alocacao/tipos";

type TimetableProps = {
  horarios?: Horario[];
  intervalos?: Intervalo[];
  aulas: Aula[];
  onAulaDrop: (
    disciplina: DisciplineDragData,
    dia: DiaSemana,
    horario: Horario,
  ) => void;
  onDragStateChange?: (arrastando: boolean) => void;
  onAulaClick?: (aula: Aula) => void;
  onCelulaClick?: (dia: DiaSemana, horario: Horario) => void;
  disciplinaSelecionada?: boolean;
};

export default function Timetable({
  horarios = HORARIOS_PADRAO,
  intervalos = INTERVALOS_PADRAO,
  aulas,
  onAulaDrop,
  onDragStateChange,
  onAulaClick,
  onCelulaClick,
  disciplinaSelecionada,
}: TimetableProps) {
  const [celulaHover, setCelulaHover] = useState<string | null>(null);
  const porCelula = new Map(
    aulas.map((aula) => [chaveCelula(aula.dia, aula), aula]),
  );

  const handleDragOver = (
    event: DragEvent<HTMLTableCellElement>,
    celulaId: string,
  ) => {
    if (!ehDragDeDisciplina(event.dataTransfer)) return;
    // É necessário aceitar o evento mesmo na célula ocupada para mostrar o aviso.
    // A alocação só é alterada depois da validação feita na tela pai.
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setCelulaHover(celulaId);
  };
  const handleDrop = (
    event: DragEvent<HTMLTableCellElement>,
    dia: DiaSemana,
    horario: Horario,
  ) => {
    event.preventDefault();
    const disciplina = lerDisciplinaArrastada(event.dataTransfer);
    if (disciplina) onAulaDrop(disciplina, dia, horario);
    setCelulaHover(null);
    onDragStateChange?.(false);
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#0099AA] bg-white">
      <table
        className="w-full min-w-[970px] table-fixed border-collapse"
        aria-label="Grade semanal de alocação"
      >
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[130px] bg-[#0099AA] px-2 py-5 text-center text-xs font-semibold text-white"
            >
              HORÁRIO
            </th>
            {DIAS.map((dia) => (
              <th
                scope="col"
                key={dia.key}
                className="bg-[#0099AA] px-2 py-5 text-center text-xs font-semibold text-white"
              >
                {dia.label.toLocaleUpperCase("pt-BR")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horarios.map((horario) => {
            const intervalo = intervaloDepois(horario, intervalos);
            return (
              <Fragment key={`${horario.inicio}-${horario.fim}`}>
                <tr>
                  <th
                    scope="row"
                    className="h-[110px] border-t border-[#0099AA]/40 bg-[#D9F3F4] px-2 text-center align-middle text-xs font-semibold text-[#007A88]"
                  >
                    {horario.inicio} - {horario.fim}
                  </th>
                  {DIAS.map((dia) => {
                    const celulaId = chaveCelula(dia.key, horario);
                    const aula = porCelula.get(celulaId);
                    const hover = celulaHover === celulaId;
                    return (
                      <td
                        key={celulaId}
                        data-cell={celulaId}
                        onDragOver={(event) => handleDragOver(event, celulaId)}
                        onDragLeave={(event) => {
                          if (
                            !event.currentTarget.contains(
                              event.relatedTarget as Node | null,
                            )
                          )
                            setCelulaHover(null);
                        }}
                        onDrop={(event) => handleDrop(event, dia.key, horario)}
                        className={`h-[110px] border-l border-t border-[#0099AA]/30 p-2 align-middle transition ${hover ? (aula ? "bg-red-50 ring-2 ring-inset ring-red-300" : "bg-[#E6F8F9] ring-2 ring-inset ring-[#0099AA]") : "bg-white"}`}
                      >
                        {aula ? (
                          <DisciplineCard
                            id={aula.disciplinaId}
                            aulaId={aula.id}
                            disciplina={aula.disciplina}
                            professor={aula.professor}
                            sala={aula.sala}
                            cor={aula.cor}
                            dentroDaTabela
                            onClick={
                              onAulaClick ? () => onAulaClick(aula) : undefined
                            }
                            onDragStart={() => {
                              setCelulaHover(null);
                              onDragStateChange?.(true);
                            }}
                            onDragEnd={() => {
                              setCelulaHover(null);
                              onDragStateChange?.(false);
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            aria-label={`Adicionar disciplina em ${dia.label}, ${horario.inicio} a ${horario.fim}`}
                            onClick={() => onCelulaClick?.(dia.key, horario)}
                            className={`flex min-h-[85px] w-full items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] ${disciplinaSelecionada ? "text-[#0099AA] hover:bg-[#E6F8F9]" : "text-[#B3B3B3] hover:bg-[#F5FAFA] hover:text-[#0099AA]"}`}
                          >
                            <Plus
                              className="h-4 w-4"
                              strokeWidth={1.4}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
                {intervalo && (
                  <tr data-testid="interval-row">
                    <td
                      colSpan={DIAS.length + 1}
                      className="h-[26px] border-t border-[#0099AA]/30 bg-[#F0F0F0] text-center text-[10px] font-medium tracking-wide text-[#777777]"
                    >
                      INTERVALO · {intervalo.inicio} - {intervalo.fim}
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
