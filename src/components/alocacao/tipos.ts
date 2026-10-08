export type DiaSemana =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

export type Horario = { inicio: string; fim: string };
export type Intervalo = Horario & { depoisDoHorario: string };

export type Discipline = {
  id: string;
  disciplina: string;
  professor: string;
  sala?: string;
  cor?: string;
};

export type Sala = {
  id: string;
  nome: string;
  capacidade: number;
  recursos: string[];
};

export type Aula = Horario & {
  // id identifica a alocação. disciplinaId identifica o cadastro da disciplina.
  id: string;
  disciplinaId: string;
  salaId: string;
  dia: DiaSemana;
  disciplina: string;
  professor: string;
  sala: string;
  cor?: string;
};

export type Grade = {
  id: string;
  versao: number;
  dataCriacao: string;
  curso: string;
  periodoLetivo: string;
  horarios: Horario[];
  intervalos: Intervalo[];
  disciplinaIds: string[];
  salaIds: string[];
  aulas: Aula[];
};

export type DisciplineDragData = { id: string; aulaId?: string };

export const DIAS: { key: DiaSemana; label: string }[] = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
];

export const HORARIOS_PADRAO: Horario[] = [
  { inicio: "13:20", fim: "14:10" },
  { inicio: "14:10", fim: "15:00" },
  { inicio: "15:10", fim: "16:00" },
  { inicio: "16:00", fim: "16:50" },
  { inicio: "17:00", fim: "17:50" },
  { inicio: "17:50", fim: "18:40" },
];

export const INTERVALOS_PADRAO: Intervalo[] = [
  { inicio: "15:00", fim: "15:10", depoisDoHorario: "15:00" },
  { inicio: "16:50", fim: "17:00", depoisDoHorario: "16:50" },
];

export function chaveCelula(dia: DiaSemana, horario: Horario) {
  return `${dia}|${horario.inicio}|${horario.fim}`;
}

export function buscarAula(aulas: Aula[], dia: DiaSemana, horario: Horario) {
  return aulas.find(
    (aula) => chaveCelula(aula.dia, aula) === chaveCelula(dia, horario),
  );
}

export function intervaloDepois(horario: Horario, intervalos: Intervalo[]) {
  // Comparar também com inicio repetia o intervalo na linha seguinte.
  return intervalos.find(
    (intervalo) => intervalo.depoisDoHorario === horario.fim,
  );
}

export type DropStatus =
  | "nova"
  | "mover"
  | "mesma-celula"
  | "ocupada"
  | "invalida";

export function verificarDrop(
  aulas: Aula[],
  dados: DisciplineDragData,
  dia: DiaSemana,
  horario: Horario,
): DropStatus {
  const origem = dados.aulaId
    ? aulas.find((aula) => aula.id === dados.aulaId)
    : undefined;
  if (dados.aulaId && (!origem || origem.disciplinaId !== dados.id))
    return "invalida";
  const destino = buscarAula(aulas, dia, horario);
  if (destino && destino.id === origem?.id) return "mesma-celula";
  if (destino) return "ocupada";
  return origem ? "mover" : "nova";
}

type AlocarInput = {
  aulas: Aula[];
  disciplina: Discipline;
  dia: DiaSemana;
  horario: Horario;
  sala: Sala;
  aulaId?: string;
  novoId: string;
};

export function alocarAula(input: AlocarInput): {
  aulas: Aula[];
  status: DropStatus;
} {
  const { aulas, disciplina, dia, horario, sala, aulaId, novoId } = input;
  const status = verificarDrop(
    aulas,
    { id: disciplina.id, aulaId },
    dia,
    horario,
  );
  if (
    status === "ocupada" ||
    status === "invalida" ||
    status === "mesma-celula"
  ) {
    return { aulas, status };
  }
  if (status === "mover") {
    return {
      status,
      aulas: aulas.map((aula) =>
        aula.id === aulaId ? { ...aula, dia, ...horario } : aula,
      ),
    };
  }
  return {
    status,
    aulas: [
      ...aulas,
      {
        id: novoId,
        disciplinaId: disciplina.id,
        salaId: sala.id,
        dia,
        ...horario,
        disciplina: disciplina.disciplina,
        professor: disciplina.professor,
        sala: sala.nome,
        cor: disciplina.cor,
      },
    ],
  };
}

export function removerAula(aulas: Aula[], aulaId: string) {
  return aulas.filter((aula) => aula.id !== aulaId);
}

export function formatarData(data: string) {
  return data.split("-").reverse().join("/");
}

// Uma cor clara também precisa produzir texto legível nos cards e na exportação.
export function corTexto(cor = "#0099AA"): "#FFFFFF" | "#000000" {
  const hex = /^#[0-9a-f]{6}$/i.test(cor) ? cor.slice(1) : "0099AA";
  const componentes = [0, 2, 4].map((indice) => {
    const canal = parseInt(hex.slice(indice, indice + 2), 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  const luminancia =
    componentes[0] * 0.2126 + componentes[1] * 0.7152 + componentes[2] * 0.0722;
  return 1.05 / (luminancia + 0.05) >= 4.5 ? "#FFFFFF" : "#000000";
}
