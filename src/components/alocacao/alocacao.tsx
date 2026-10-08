"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  Save,
  Trash2,
  University,
  UserRound,
} from "lucide-react";
import DisciplineList from "../ui/discipline-list";
import Timetable from "../ui/timetable";
import GradeList from "./alocacao-listagem";
import Modal from "./alocacao-modal";
import RoomSelect from "./alocacao-salas";
import {
  DIAS,
  alocarAula,
  verificarDrop,
  removerAula,
  type Aula,
  type DiaSemana,
  type Discipline,
  type DisciplineDragData,
  type Grade,
  type Horario,
  type Sala,
} from "./tipos";

import {
  DISCIPLINAS_EXEMPLO,
  GRADES_EXEMPLO,
  SALAS_EXEMPLO,
  carregarAlocacoesLocais,
  salvarAlocacaoLocal,
} from "./dados-exemplo";

export type FormatoExportacao = "excel" | "pdf";

export type AlocacaoScreenProps = {
  grades: Grade[];
  disciplinas: Discipline[];
  salas: Sala[];
  // O projeto fornece a implementação real da API. Não há endpoint inventado aqui.
  salvarAlocacao: (gradeId: string, aulas: Aula[]) => Promise<void>;
  // Essa função chama o backend e inicia o download do arquivo recebido.
  exportarAlocacao?: (
    gradeId: string,
    aulas: Aula[],
    formato: FormatoExportacao,
  ) => Promise<void>;
};

type EstadoModal =
  | { tipo: "sala"; disciplinaId: string; dia: DiaSemana; horario: Horario }
  | { tipo: "detalhes"; aulaId: string }
  | { tipo: "aviso"; titulo: string; texto?: string; sucesso?: boolean }
  | null;

const BOTAO =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-50";
const PRIMARIO = `${BOTAO} bg-[#0099AA] text-white hover:bg-[#008494]`;
const SECUNDARIO = `${BOTAO} border border-[#C8D9DD] bg-white text-[#17264D] hover:bg-[#F4FBFC]`;

export function TelaAlocacao({
  grades,
  disciplinas,
  salas,
  salvarAlocacao,
  exportarAlocacao,
}: AlocacaoScreenProps) {
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [rascunhos, setRascunhos] = useState<Record<string, Aula[]>>({});
  const [salvas, setSalvas] = useState<Record<string, Aula[]>>({});
  const [arrastando, setArrastando] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>(null);
  const [salaId, setSalaId] = useState("");
  const [erroSala, setErroSala] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [exportando, setExportando] = useState<FormatoExportacao | null>(null);
  const [mensagem, setMensagem] = useState("");
  const grade = grades.find((item) => item.id === gradeId);
  const aulas = grade
    ? (rascunhos[grade.id] ?? salvas[grade.id] ?? grade.aulas)
    : [];
  const disciplinasDaGrade = grade
    ? disciplinas.filter((item) => grade.disciplinaIds.includes(item.id))
    : [];
  const salasDaGrade = grade
    ? salas.filter((item) => grade.salaIds.includes(item.id))
    : [];
  const bloqueado = salvando || exportando !== null;

  function atualizarAulas(proximas: Aula[]) {
    if (grade) setRascunhos((atual) => ({ ...atual, [grade.id]: proximas }));
  }

  function avisoOcupada() {
    setModal({
      tipo: "aviso",
      titulo: "Já tem uma disciplina alocada nesse local",
    });
  }

  function handleDrop(
    dados: DisciplineDragData,
    dia: DiaSemana,
    horario: Horario,
  ) {
    setArrastando(false);
    if (!grade || bloqueado) return;
    const disciplina = disciplinasDaGrade.find((item) => item.id === dados.id);
    // Usar os cadastros recebidos, nunca os nomes ou cores trazidos pelo payload externo.
    if (
      !disciplina ||
      !DIAS.some((item) => item.key === dia) ||
      !grade.horarios.some(
        (item) => item.inicio === horario.inicio && item.fim === horario.fim,
      )
    )
      return;
    const status = verificarDrop(aulas, dados, dia, horario);
    if (status === "ocupada") {
      avisoOcupada();
      return;
    }
    if (status === "invalida" || status === "mesma-celula") return;
    if (status === "mover") {
      const origem = aulas.find((item) => item.id === dados.aulaId)!;
      const sala = salasDaGrade.find((item) => item.id === origem.salaId);
      if (!sala) return;
      const resultado = alocarAula({
        aulas,
        disciplina,
        dia,
        horario,
        sala,
        aulaId: origem.id,
        novoId: origem.id,
      });
      atualizarAulas(resultado.aulas);
      setMensagem(
        `${disciplina.disciplina} movida para ${DIAS.find((item) => item.key === dia)?.label}, ${horario.inicio}.`,
      );
      return;
    }
    setSalaId("");
    setErroSala(false);
    setModal({ tipo: "sala", disciplinaId: disciplina.id, dia, horario });
  }

  function confirmarSala() {
    if (modal?.tipo !== "sala" || !grade || bloqueado) return;
    const sala = salasDaGrade.find((item) => item.id === salaId);
    const disciplina = disciplinasDaGrade.find(
      (item) => item.id === modal.disciplinaId,
    );
    if (!sala) {
      setErroSala(true);
      return;
    }
    if (!disciplina) return;
    const resultado = alocarAula({
      aulas,
      disciplina,
      sala,
      dia: modal.dia,
      horario: modal.horario,
      novoId: crypto.randomUUID(),
    });
    if (resultado.status === "ocupada") {
      avisoOcupada();
      return;
    }
    if (resultado.status === "invalida") return;
    atualizarAulas(resultado.aulas);
    setMensagem(`${disciplina.disciplina} alocada em ${sala.nome}.`);
    setModal(null);
    setSelecionada(null);
  }

  function excluirAula(id: string) {
    if (bloqueado) return;
    atualizarAulas(removerAula(aulas, id));
    setMensagem("Disciplina removida da grade.");
    setArrastando(false);
    setModal(null);
  }

  async function salvar() {
    if (!grade || bloqueado) return;
    if (!aulas.length) {
      setModal({
        tipo: "aviso",
        titulo:
          "Você precisa adicionar alguma disciplina para salvar a alocação",
      });
      return;
    }
    setSalvando(true);
    const snapshot = aulas.map((aula) => ({ ...aula }));
    try {
      await salvarAlocacao(grade.id, snapshot);
      setSalvas((atual) => ({ ...atual, [grade.id]: snapshot }));
      setRascunhos((atual) => {
        const proximo = { ...atual };
        delete proximo[grade.id];
        return proximo;
      });
      setGradeId(null);
      setSelecionada(null);
      setArrastando(false);
      setModal({
        tipo: "aviso",
        titulo: "Alocação salva com sucesso!",
        sucesso: true,
      });
    } catch {
      setModal({
        tipo: "aviso",
        titulo: "Não foi possível salvar a alocação",
        texto: "Tente novamente. As disciplinas continuam nesta grade.",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function exportar(formato: FormatoExportacao) {
    if (!grade || bloqueado || !aulas.length || !exportarAlocacao) return;
    setExportando(formato);
    try {
      await exportarAlocacao(grade.id, aulas, formato);
      setMensagem(
        `Download de ${formato === "excel" ? "Excel" : "PDF"} solicitado.`,
      );
    } catch {
      setModal({
        tipo: "aviso",
        titulo: "Não foi possível exportar a grade",
        texto: "Tente novamente. Suas alocações foram preservadas.",
      });
    } finally {
      setExportando(null);
    }
  }

  const aulaDetalhe =
    modal?.tipo === "detalhes"
      ? aulas.find((item) => item.id === modal.aulaId)
      : undefined;
  const disciplinaPendente =
    modal?.tipo === "sala"
      ? disciplinasDaGrade.find((item) => item.id === modal.disciplinaId)
      : undefined;

  return (
    <main
      className="alocacao-screen min-h-screen bg-white px-4 py-7 font-sans text-[#171717] md:px-8 md:py-9"
      aria-busy={bloqueado}
    >
      <div className={`mx-auto ${grade ? "max-w-[1600px]" : "max-w-[1160px]"}`}>
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {grade && (
              <button
                type="button"
                aria-label="Voltar para a listagem de grades"
                disabled={bloqueado}
                onClick={() => {
                  setGradeId(null);
                  setSelecionada(null);
                  setArrastando(false);
                }}
                className="mt-1 rounded p-1 text-[#17264D] hover:bg-[#F4FBFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#17264D]">
                Alocação
              </h1>
              <p className="mt-1 text-xs text-[#777777]">
                {grade
                  ? "Realize as alocações desta grade"
                  : "Selecione uma grade cadastrada para realizar a alocação"}
              </p>
              {grade && (
                <p className="mt-3 text-xs font-medium text-[#404040]">
                  {grade.curso} · {grade.periodoLetivo} · Versão{" "}
                  {String(grade.versao).padStart(2, "0")}
                </p>
              )}
            </div>
          </div>
          {grade && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={bloqueado || !aulas.length || !exportarAlocacao}
                onClick={() => void exportar("excel")}
                className={SECUNDARIO}
                title={
                  exportarAlocacao
                    ? "Exportar a grade para Excel"
                    : "Exportação indisponível no momento"
                }
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                {exportando === "excel" ? "Exportando…" : "Excel"}
              </button>
              <button
                type="button"
                disabled={bloqueado || !aulas.length || !exportarAlocacao}
                onClick={() => void exportar("pdf")}
                className={SECUNDARIO}
                title={
                  exportarAlocacao
                    ? "Exportar a grade para PDF"
                    : "Exportação indisponível no momento"
                }
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                {exportando === "pdf" ? "Exportando…" : "PDF"}
              </button>
              <button
                type="button"
                disabled={bloqueado}
                onClick={() => void salvar()}
                className={PRIMARIO}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          )}
        </header>
        {grade ? (
          <div
            className={`grid grid-cols-1 items-start gap-5 md:grid-cols-[235px_minmax(0,1fr)] ${bloqueado ? "pointer-events-none opacity-75" : ""}`}
          >
            <DisciplineList
              disciplinas={disciplinasDaGrade}
              arrastando={arrastando}
              onRemove={excluirAula}
              onDragStateChange={setArrastando}
              disciplinaSelecionada={selecionada}
              onSelect={(id) => {
                if (!bloqueado)
                  setSelecionada((atual) => (atual === id ? null : id));
              }}
            />
            <section className="min-w-0" aria-label="Alocação na grade">
              <Timetable
                horarios={grade.horarios}
                intervalos={grade.intervalos}
                aulas={aulas}
                onAulaDrop={handleDrop}
                onDragStateChange={setArrastando}
                onAulaClick={(aula) => {
                  if (!bloqueado)
                    setModal({ tipo: "detalhes", aulaId: aula.id });
                }}
                disciplinaSelecionada={selecionada !== null}
                onCelulaClick={(dia, horario) => {
                  if (bloqueado) return;
                  if (selecionada)
                    handleDrop({ id: selecionada }, dia, horario);
                  else
                    setModal({
                      tipo: "aviso",
                      titulo: "Selecione uma disciplina",
                      texto:
                        "Clique em um card da lista e depois no horário em que deseja alocá-lo.",
                    });
                }}
              />
              <p
                className="mt-3 text-right text-xs text-[#777777]"
                aria-live="polite"
              >
                {aulas.length}{" "}
                {aulas.length === 1 ? "aula alocada" : "aulas alocadas"}
              </p>
            </section>
          </div>
        ) : (
          <GradeList
            grades={grades}
            onAlocar={(id) => {
              setGradeId(id);
              setSelecionada(null);
              setArrastando(false);
            }}
          />
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {mensagem}
      </div>

      {modal?.tipo === "sala" && (
        <Modal titulo="Escolha a sala" onClose={() => setModal(null)}>
          <p className="mt-3 text-sm text-[#777777]">
            {disciplinaPendente?.disciplina}
            <span className="mt-1 block text-xs">
              {DIAS.find((dia) => dia.key === modal.dia)?.label} ·{" "}
              {modal.horario.inicio} - {modal.horario.fim}
            </span>
          </p>
          <div className="mb-8 mt-6">
            <RoomSelect
              salas={salasDaGrade}
              value={salaId}
              erro={erroSala}
              onChange={(id) => {
                setSalaId(id);
                setErroSala(false);
              }}
            />
          </div>
          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModal(null)}
              className={`${BOTAO} text-[#404040] hover:bg-gray-100`}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!salasDaGrade.length}
              onClick={confirmarSala}
              className={PRIMARIO}
            >
              Confirmar
            </button>
          </div>
        </Modal>
      )}
      {modal?.tipo === "detalhes" && aulaDetalhe && (
        <Modal titulo={aulaDetalhe.disciplina} onClose={() => setModal(null)}>
          <div className="mt-5 space-y-4 border-t border-[#D9D9D9] pt-4 text-sm">
            <p className="flex items-start gap-2">
              <UserRound
                className="h-4 w-4 shrink-0 text-[#777777]"
                aria-hidden="true"
              />
              <span>
                <span className="font-semibold">Professor:</span>{" "}
                {aulaDetalhe.professor}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <University
                className="h-4 w-4 shrink-0 text-[#777777]"
                aria-hidden="true"
              />
              <span>{aulaDetalhe.sala}</span>
            </p>
            <p className="text-xs text-[#777777]">
              {DIAS.find((dia) => dia.key === aulaDetalhe.dia)?.label} ·{" "}
              {aulaDetalhe.inicio} - {aulaDetalhe.fim}
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => excluirAula(aulaDetalhe.id)}
              className={PRIMARIO}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Excluir
            </button>
          </div>
        </Modal>
      )}
      {modal?.tipo === "aviso" && (
        <Modal
          titulo={modal.titulo}
          compacto
          alerta={!modal.sucesso}
          onClose={() => setModal(null)}
        >
          {modal.sucesso && (
            <CheckCircle2
              className="mx-auto mt-5 h-12 w-12 text-[#0099AA]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
          {modal.texto && (
            <p className="mt-4 text-center text-sm leading-relaxed text-[#777777]">
              {modal.texto}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              data-autofocus
              onClick={() => setModal(null)}
              className={PRIMARIO}
            >
              Entendi
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default function Alocacao() {
  const [grades, setGrades] = useState<Grade[] | null>(null);

  useEffect(() => {
    setGrades(
      carregarAlocacoesLocais(
        GRADES_EXEMPLO,
        DISCIPLINAS_EXEMPLO,
        SALAS_EXEMPLO,
      ),
    );
  }, []);

  if (!grades) {
    return (
      <div role="status" className="p-8 text-sm text-[#777777]">
        Carregando grades…
      </div>
    );
  }

  return (
    <TelaAlocacao
      grades={grades}
      disciplinas={DISCIPLINAS_EXEMPLO}
      salas={SALAS_EXEMPLO}
      salvarAlocacao={salvarAlocacaoLocal}
    />
  );
}
