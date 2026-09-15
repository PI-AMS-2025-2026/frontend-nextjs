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
  {
    id: "6",
    disciplina: "Estrutura de Dados",
    professor: "Lucas Mendes",
    sala: "Sala 20",
    cor: "#795548",
  },
  {
    id: "7",
    disciplina: "Sistemas Operacionais",
    professor: "Fernanda Costa",
    sala: "Laboratório 03",
    cor: "#607D8B",
  },
  {
    id: "8",
    disciplina: "Programação Orientada a Objetos",
    professor: "Rafael Almeida",
    sala: "Sala 18",
    cor: "#3F51B5",
  },
  {
    id: "9",
    disciplina: "Inteligência Artificial",
    professor: "Juliana Martins",
    sala: "Laboratório 04",
    cor: "#009688",
  },
  {
    id: "10",
    disciplina: "Desenvolvimento Mobile",
    professor: "Gabriel Souza",
    sala: "Sala 22",
    cor: "#E91E63",
  },
  {
    id: "11",
    disciplina: "Redes de Computadores",
    professor: "Marcos Oliveira",
    sala: "Laboratório 01",
    cor: "#FF5722",
  },
  {
    id: "12",
    disciplina: "Segurança da Informação",
    professor: "Patrícia Lima",
    sala: "Sala 25",
    cor: "#8BC34A",
  },
  {
    id: "13",
    disciplina: "Banco de Dados Avançado",
    professor: "André Santos",
    sala: "Sala 09",
    cor: "#673AB7",
  },
  {
    id: "14",
    disciplina: "Arquitetura de Software",
    professor: "Camila Rocha",
    sala: "Sala 14",
    cor: "#00BCD4",
  },
  {
    id: "15",
    disciplina: "Computação em Nuvem",
    professor: "Bruno Ferreira",
    sala: "Laboratório 05",
    cor: "#CDDC39",
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

  const handleRemoveAll = () => {
    setAulas([]);
    setArrastando(false);
  };

  const disciplinasDisponiveis = disciplinas.filter(
    (disciplina) => !aulas.some((aula) => aula.id === disciplina.id),
  );

  return (
    <main className="flex min-h-screen w-full flex-col justify-end p-4">
      {/* Container responsável pela altura dos componentes */}
      <div className="h-[860px] w-full">
        {/* Container responsável pelo posicionamento lado a lado */}
        <div className="grid h-full w-full grid-cols-[280px_minmax(0,1fr)] gap-6">
          {/* Lista de disciplinas */}
          <div className="h-[750px] min-h-0 min-w-0">
            <DisciplineList
              disciplinas={disciplinasDisponiveis}
              arrastando={arrastando}
              onRemove={handleRemove}
              onRemoveAll={handleRemoveAll}
              onDragStateChange={setArrastando}
            />
          </div>

          {/* Grade */}
          <div className="h-[750px] min-h-0 min-w-0">
            <Timetable
              aulas={aulas}
              onAulaDrop={handleAulaDrop}
              onDragStateChange={setArrastando}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
