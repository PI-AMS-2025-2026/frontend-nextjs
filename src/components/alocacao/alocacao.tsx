"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FileDown,
  Pencil,
  Save,
  Trash2,
  University,
  UserRound,
} from "lucide-react";
import DisciplineList from "../ui/discipline-list";
import Timetable from "../ui/timetable";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import GradeList from "./alocacao-listagem";
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

export type AlocacaoScreenProps = {
  grades: Grade[];
  disciplinas: Discipline[];
  salas: Sala[];
  // O projeto fornece a implementação real da API. Não há endpoint inventado aqui.
  salvarAlocacao: (gradeId: string, aulas: Aula[]) => Promise<void>;
};

type EstadoModal =
  | { tipo: "sala"; disciplinaId: string; dia: DiaSemana; horario: Horario }
  | { tipo: "detalhes"; aulaId: string }
  | { tipo: "aviso"; titulo: string; texto?: string; sucesso?: boolean }
  | null;

export function TelaAlocacao({
  grades,
  disciplinas,
  salas,
  salvarAlocacao,
}: AlocacaoScreenProps) {
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [rascunhos, setRascunhos] = useState<Record<string, Aula[]>>({});
  const [salvas, setSalvas] = useState<Record<string, Aula[]>>({});
  const [arrastando, setArrastando] = useState(false);
  const origemDoArraste = useRef<"lista" | "grade" | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mostrarSelecao, setMostrarSelecao] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>("segunda");
  const [horarioSelecionado, setHorarioSelecionado] = useState("0");
  const [modal, setModal] = useState<EstadoModal>(null);
  const [salaId, setSalaId] = useState("");
  const [erroSala, setErroSala] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const grade = grades.find((item) => item.id === gradeId);
  const aulasSalvas = grade ? salvas[grade.id] ?? grade.aulas : [];
  const aulas = grade && editando
    ? rascunhos[grade.id] ?? aulasSalvas
    : aulasSalvas;
  const disciplinasDaGrade = grade
    ? disciplinas.filter((item) => grade.disciplinaIds.includes(item.id))
    : [];
  const salasDaGrade = grade
    ? salas.filter((item) => grade.salaIds.includes(item.id))
    : [];
  const bloqueado = salvando;

  useEffect(() => {
    if (!modal) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
    };
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [modal]);

  function atualizarAulas(proximas: Aula[]) {
    if (grade && editando && !bloqueado)
      setRascunhos((atual) => ({ ...atual, [grade.id]: proximas }));
  }

  function alterarArraste(origem: "lista" | "grade", ativo: boolean) {
    if (ativo && (!editando || bloqueado)) return;
    origemDoArraste.current = ativo ? origem : null;
    setArrastando(ativo);
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
    if (!grade || !editando || bloqueado) {
      origemDoArraste.current = null;
      return;
    }
    // O card da lista envia o id da disciplina; o card da grade envia o id da aula.
    // Este adaptador mantém o payload e as props dos componentes originais.
    const veioDaGrade = !!dados.aulaId || origemDoArraste.current === "grade";
    const origem = veioDaGrade
      ? aulas.find((item) => item.id === (dados.aulaId ?? dados.id))
      : undefined;
    origemDoArraste.current = null;
    if (veioDaGrade && !origem) return;
    const dadosCanonicos: DisciplineDragData = origem
      ? { id: origem.disciplinaId, aulaId: origem.id }
      : dados;
    const disciplina = disciplinasDaGrade.find(
      (item) => item.id === dadosCanonicos.id,
    );
    // Usar os cadastros recebidos, nunca os nomes ou cores trazidos pelo payload externo.
    if (
      !disciplina ||
      !DIAS.some((item) => item.key === dia) ||
      !grade.horarios.some(
        (item) => item.inicio === horario.inicio && item.fim === horario.fim,
      )
    )
      return;
    const status = verificarDrop(aulas, dadosCanonicos, dia, horario);
    if (status === "ocupada") {
      avisoOcupada();
      return;
    }
    if (status === "invalida" || status === "mesma-celula") return;
    if (status === "mover") {
      if (!origem) return;
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
    if (modal?.tipo !== "sala" || !grade || !editando || bloqueado) return;
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
    if (!editando || bloqueado || !aulas.some((aula) => aula.id === id)) return;
    atualizarAulas(removerAula(aulas, id));
    setMensagem("Disciplina removida da grade.");
    setArrastando(false);
    setModal(null);
  }

  async function salvar() {
    if (!grade || !editando || bloqueado) return;
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
      setEditando(false);
      setSelecionada(null);
      setArrastando(false);
      origemDoArraste.current = null;
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
              <Button
                type="button"
                variant="ghost"
                size="small"
                aria-label="Voltar para a listagem de grades"
                disabled={bloqueado}
                onClick={() => {
                  setGradeId(null);
                  setEditando(false);
                  setSelecionada(null);
                  setArrastando(false);
                  setMostrarSelecao(false);
                  origemDoArraste.current = null;
                }}
                className="mt-1 h-9 w-9 rounded p-1 text-[#17264D]"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#17264D]">
                Alocação
              </h1>
              <p className="mt-1 text-xs text-[#777777]">
                {grade
                  ? editando
                    ? "Realize as alocações desta grade"
                    : "Visualize as alocações desta grade"
                  : "Selecione uma grade cadastrada para abrir"}
              </p>
              {grade && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-[#404040]">
                    {grade.curso} · {grade.periodoLetivo} · Versão{" "}
                    {String(grade.versao).padStart(2, "0")}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      editando
                        ? "bg-[#D9F3F4] text-[#007A88]"
                        : "bg-[#F2F2F2] text-[#555555]"
                    }`}
                  >
                    {editando ? "Edição" : "Visualização"}
                  </span>
                </div>
              )}
            </div>
          </div>
          {grade && (
            <div className="flex flex-wrap items-center gap-2">
              {!editando && (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  title="Editar"
                  aria-label="Editar"
                  onClick={() => {
                    setEditando(true);
                    setMensagem("Modo de edição ativado.");
                  }}
                  className="h-10 w-10 rounded-lg p-2 text-[#17264D]"
                >
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                </Button>
              )}
              {/* Apenas visual: a exportação será conectada posteriormente. */}
              <Button
                type="button"
                disabled={bloqueado}
                variant="primary"
                size="small"
                className="gap-2"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                Exportar
              </Button>
              {editando && (
                <Button
                  type="button"
                  disabled={bloqueado}
                  onClick={() => void salvar()}
                  variant="secondary"
                  size="small"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {salvando ? "Salvando…" : "Salvar"}
                </Button>
              )}
            </div>
          )}
        </header>
        {grade ? (
          <div
            className={`grid grid-cols-1 items-start gap-5 ${editando ? "md:grid-cols-[235px_minmax(0,1fr)]" : ""} ${bloqueado ? "pointer-events-none opacity-75" : ""}`}
          >
            {editando && (
              <div className="h-[540px] min-w-0 md:h-[780px]">
                <DisciplineList
                  disciplinas={disciplinasDaGrade}
                  arrastando={arrastando}
                  onRemove={(id, aulaId) => {
                    if (aulaId || origemDoArraste.current === "grade")
                      excluirAula(aulaId ?? id);
                  }}
                  onDragStateChange={(ativo) => alterarArraste("lista", ativo)}
                />
              </div>
            )}
            <section
              className="min-w-0 space-y-3"
              aria-label="Alocação na grade"
            >
              {editando && (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  className="h-9 px-3 text-sm"
                  aria-expanded={mostrarSelecao}
                  aria-controls="alocacao-por-selecao"
                  onClick={() => setMostrarSelecao((atual) => !atual)}
                >
                  Alocar por seleção
                </Button>
              )}
              {editando && mostrarSelecao && (
                <div
                  id="alocacao-por-selecao"
                  className="grid gap-3 rounded-lg border border-[#D9D9D9] bg-[#F2F2F2] p-3 lg:grid-cols-[2fr_1fr_1fr_auto]"
                >
                  <Select
                    options={disciplinasDaGrade.map((disciplina) => ({
                      label: disciplina.disciplina,
                      value: disciplina.id,
                    }))}
                    value={selecionada ?? ""}
                    onChange={setSelecionada}
                    placeholder="Selecione uma disciplina"
                    className="[&>div]:bg-white"
                  />
                  <Select
                    options={DIAS.map((dia) => ({
                      label: dia.label,
                      value: dia.key,
                    }))}
                    value={diaSelecionado}
                    onChange={(valor) => {
                      const dia = DIAS.find((item) => item.key === valor);
                      if (dia) setDiaSelecionado(dia.key);
                    }}
                    placeholder="Selecione o dia"
                    className="[&>div]:bg-white"
                  />
                  <Select
                    options={grade.horarios.map((horario, indice) => ({
                      label: horario.inicio + " - " + horario.fim,
                      value: String(indice),
                    }))}
                    value={horarioSelecionado}
                    onChange={setHorarioSelecionado}
                    placeholder="Selecione o horário"
                    className="[&>div]:bg-white"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    className="h-9 text-sm"
                    disabled={
                      !selecionada ||
                      !grade.horarios[Number(horarioSelecionado)]
                    }
                    onClick={() => {
                      const horario =
                        grade.horarios[Number(horarioSelecionado)];
                      if (selecionada && horario)
                        handleDrop(
                          { id: selecionada },
                          diaSelecionado,
                          horario,
                        );
                    }}
                  >
                    Alocar
                  </Button>
                </div>
              )}
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1050px]">
                  <Timetable
                    horarios={grade.horarios}
                    intervalos={grade.intervalos}
                    aulas={aulas}
                    somenteLeitura={!editando || bloqueado}
                    onAulaDrop={handleDrop}
                    onDragStateChange={(ativo) => alterarArraste("grade", ativo)}
                    onAulaClick={(aula) => {
                      if (!bloqueado)
                        setModal({ tipo: "detalhes", aulaId: aula.id });
                    }}
                    onDropOcupado={handleDrop}
                  />
                </div>
              </div>
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
            onAbrir={(id) => {
              setGradeId(id);
              setEditando(false);
              setSelecionada(null);
              setArrastando(false);
              setMostrarSelecao(false);
              setDiaSelecionado("segunda");
              setHorarioSelecionado("0");
              origemDoArraste.current = null;
              setMensagem("Grade aberta para visualização.");
            }}
          />
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {mensagem}
      </div>

      {modal?.tipo === "sala" && (
        <Modal
          open
          onClose={() => setModal(null)}
          className="max-w-xl overflow-visible [&>img]:rounded-[20px]"
        >
          <h2 className="pr-10 text-xl font-semibold">Escolha a sala</h2>
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
            <Button
              type="button"
              onClick={() => setModal(null)}
              variant="ghost"
              size="small"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!salasDaGrade.length}
              onClick={confirmarSala}
              variant="secondary"
              size="small"
              className="gap-2"
            >
              Confirmar
            </Button>
          </div>
        </Modal>
      )}
      {modal?.tipo === "detalhes" && aulaDetalhe && (
        <Modal open onClose={() => setModal(null)}>
          <h2 className="pr-10 text-xl font-semibold">
            {aulaDetalhe.disciplina}
          </h2>
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
          {editando && (
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => excluirAula(aulaDetalhe.id)}
                variant="danger"
                size="small"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Excluir
              </Button>
            </div>
          )}
        </Modal>
      )}
      {modal?.tipo === "aviso" && (
        <Modal
          open
          onClose={() => setModal(null)}
          type={modal.sucesso ? "success" : "error"}
          message={[modal.titulo, modal.texto].filter(Boolean).join(" ")}
        />
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
