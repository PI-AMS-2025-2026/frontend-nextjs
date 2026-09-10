"use client";

import { useState } from "react";

import Timetable, {
  type Aula,
  type DiaSemana,
} from "@/components/ui/timetable";

import DisciplineList, {
  type Discipline,
} from "@/components/ui/discipline-list";

const disciplinasIniciais: Discipline[] = [
  {
    id: "1",
    disciplina: "Desenvolvimento Web",
    professor: "João da Silva",
    sala: "Sala 12",
    cor: "#FF0000",
  },
  {
    id: "2",
    disciplina: "Banco de Dados",
    professor: "Maria Oliveira",
    sala: "Sala 08",
    cor: "#2196F3",
  },
  {
    id: "3",
    disciplina: "Engenharia de Software",
    professor: "Carlos Santos",
    sala: "Sala 15",
    cor: "#4CAF50",
  },
  {
    id: "4",
    disciplina: "Programação",
    professor: "Ana Souza",
    sala: "Laboratório 02",
    cor: "#9C27B0",
  },
  {
    id: "5",
    disciplina: "Redes de Computadores",
    professor: "Pedro Lima",
    sala: "Laboratório 01",
    cor: "#FF9800",
  },
];

export default function Home() {
  const [disciplinas] = useState<Discipline[]>(disciplinasIniciais);

  const [aulas, setAulas] = useState<Aula[]>([]);

  const [arrastando, setArrastando] = useState(false);

  const handleAulaDrop = (
    disciplina: Discipline,
    dia: DiaSemana,
    horario: {
      inicio: string;
      fim: string;
    },
  ) => {
    setAulas((aulasAtuais) => {
      const aulaExiste = aulasAtuais.some((aula) => aula.id === disciplina.id);

      if (aulaExiste) {
        return aulasAtuais.map((aula) => {
          if (aula.id !== disciplina.id) {
            return aula;
          }

          return {
            ...aula,
            dia,
            inicio: horario.inicio,
            fim: horario.fim,
          };
        });
      }

      return [
        ...aulasAtuais,
        {
          id: disciplina.id,
          dia,
          inicio: horario.inicio,
          fim: horario.fim,
          disciplina: disciplina.disciplina,
          professor: disciplina.professor,
          sala: disciplina.sala,
          cor: disciplina.cor,
        },
      ];
    });

    setArrastando(false);
  };

  const handleRemove = (id: string) => {
    setAulas((aulasAtuais) => aulasAtuais.filter((aula) => aula.id !== id));

    setArrastando(false);
  };

  const disciplinasDisponiveis = disciplinas.filter(
    (disciplina) => !aulas.some((aula) => aula.id === disciplina.id),
  );

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden p-4">
      <div className="grid w-full max-w-[1800px] min-w-0 grid-cols-[1fr_3fr] gap-6">
        {/* 25% - Lista de disciplinas */}
        <div className="min-w-0">
          <DisciplineList
            disciplinas={disciplinasDisponiveis}
            arrastando={arrastando}
            onRemove={handleRemove}
            onDragStateChange={setArrastando}
          />
        </div>

        {/* 75% - Grade */}
        <div className="min-w-0">
          <Timetable
            aulas={aulas}
            onAulaDrop={handleAulaDrop}
            onDragStateChange={setArrastando}
          />
        </div>
      </div>
    </main>
  );
}
