"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  buscarAula,
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

import { carregarDados, erroAlocacao, exportarGrade, interpretarSugestao, salvarGrade, validar } from "./integracao";
import { SelecaoQuadro } from "./selecao-quadro";
import { pertenceAoTurno, type Turno } from "./turnos";
import { gerarId } from "@/lib/id";

export type AlocacaoScreenProps = {
  grades: Grade[];
  disciplinas: Discipline[];
  salas: Sala[];
  // O projeto fornece a implementação real da API. Não há endpoint inventado aqui.
  salvarAlocacao: (gradeId: string, aulas: Aula[]) => Promise<Aula[]>;
  gradeInicialId?: string;
  aoVoltar?: () => void;
};

type EstadoModal =
  | {
      tipo: "sala";
      disciplinaId: string;
      dia: DiaSemana;
      horario: Horario;
      aulaId?: string;
    }
  | { tipo: "detalhes"; aulaId: string }
  | { tipo: "aviso"; titulo: string; texto?: string; sucesso?: boolean }
  | null;

type SugestaoDeCelula = NonNullable<ReturnType<typeof interpretarSugestao>>;
const AVISO_CELULA_OCUPADA = "Já tem uma disciplina alocada nesse local";

export function TelaAlocacao({
  grades,
  disciplinas,
  salas,
  salvarAlocacao,
  gradeInicialId,
  aoVoltar,
}: AlocacaoScreenProps) {
  const [gradeId, setGradeId] = useState<string | null>(gradeInicialId ?? null);
  const [editando, setEditando] = useState(false);
  const [rascunhos, setRascunhos] = useState<Record<string, Aula[]>>({});
  const [salvas, setSalvas] = useState<Record<string, Aula[]>>({});
  const [arrastando, setArrastando] = useState(false);
  const origemDoArraste = useRef<"lista" | "grade" | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mostrarSelecao, setMostrarSelecao] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>("segunda");
  const [turnoSelecionado, setTurnoSelecionado] = useState<Turno>("todos");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [modal, setModal] = useState<EstadoModal>(null);
  const [salaId, setSalaId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [erroProfessor, setErroProfessor] = useState("");
  const [erroSala, setErroSala] = useState(false);
  const [erroValidacao, setErroValidacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [sugestoes, setSugestoes] = useState<SugestaoDeCelula[] | null>(null);
  const [mensagem, setMensagem] = useState("");
  const grade = grades.find((item) => item.id === gradeId);
  const aulasSalvas = grade ? (salvas[grade.id] ?? grade.aulas) : [];
  const aulas =
    grade && editando ? (rascunhos[grade.id] ?? aulasSalvas) : aulasSalvas;
  const edicaoAtual = useRef<{ gradeId: string; aulas: Aula[] } | null>(null);
  useLayoutEffect(() => {
    edicaoAtual.current = grade && editando ? { gradeId: grade.id, aulas } : null;
    return () => { edicaoAtual.current = null; };
  }, [aulas, editando, grade]);
  const disciplinasDaGrade = grade
    ? disciplinas.filter((item) => grade.disciplinaIds.includes(item.id))
    : [];
  const salasDaGrade = grade
    ? salas.filter((item) => grade.salaIds.includes(item.id))
    : [];
  const sugestoesDisponiveis = sugestoes?.filter(item =>
    !buscarAula(aulas, item.dia, item.horario) &&
    salasDaGrade.some(sala => sala.id === item.salaId),
  );
  const bloqueado = salvando || processando;
  const horariosDoTurno = grade?.horarios
    .map((horario, indice) => ({ horario, indice }))
    .filter(({ horario }) => pertenceAoTurno(horario.inicio, turnoSelecionado)) ?? [];

  useEffect(() => {
    if (!modal) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !bloqueado) setModal(null);
    };
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [modal, bloqueado]);

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
      titulo: AVISO_CELULA_OCUPADA,
    });
  }

  function mostrarRejeicao(validacao: Awaited<ReturnType<typeof validar>>) {
    if (!grade) return;
    setErroValidacao(validacao.mensagem);
    setMensagem(validacao.mensagem);
    setSugestoes(validacao.sugestoes.flatMap(sugestao => {
      const item = interpretarSugestao(grade, sugestao);
      return item ? [item] : [];
    }));
  }

  function usarSugestao(item: SugestaoDeCelula) {
    const atual = edicaoAtual.current;
    if (modal?.tipo !== "sala" || bloqueado || !atual || atual.gradeId !== grade?.id) return;
    if (buscarAula(atual.aulas, item.dia, item.horario)) {
      setSugestoes(restantes => restantes?.filter(sugestao => sugestao !== item) ?? []);
      return;
    }
    setModal({ ...modal, dia: item.dia, horario: item.horario });
    setSalaId(item.salaId);
    setErroSala(false);
    setErroValidacao("");
    setSugestoes(null);
  }

  async function handleDrop(
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
      setProcessando(true);
      try {
        const validacao = await validar(
          grade,
          { ...disciplina, professorId: origem.professorId, professor: origem.professor },
          sala.id,
          dia,
          horario,
          origem.id,
        );
        if (edicaoAtual.current?.gradeId !== grade.id) return;
        if (!validacao.valido) {
          setModal({
            tipo: "sala",
            disciplinaId: disciplina.id,
            dia,
            horario,
            aulaId: origem.id,
          });
          setSalaId(sala.id);
          setProfessorId(String(origem.professorId ?? ""));
          setErroProfessor("");
          setErroSala(false);
          mostrarRejeicao(validacao);
          return;
        }
      } catch (error) {
        setModal({
          tipo: "aviso",
          titulo: "Não foi possível validar a alocação",
          texto: erroAlocacao(error),
        });
        return;
      } finally {
        setProcessando(false);
      }
      const atual = edicaoAtual.current;
      if (atual?.gradeId !== grade.id) return;
      const resultado = alocarAula({
        aulas: atual.aulas,
        disciplina: { ...disciplina, professorId: origem.professorId, professor: origem.professor },
        dia,
        horario,
        sala,
        aulaId: origem.id,
        novoId: origem.id,
      });
      if (resultado.status === "ocupada") {
        avisoOcupada();
        return;
      }
      if (resultado.status !== "mover") return;
      atualizarAulas(resultado.aulas);
      setMensagem(
        `${disciplina.disciplina} movida para ${DIAS.find((item) => item.key === dia)?.label}, ${horario.inicio}.`,
      );
      return;
    }
    // Se a aula original foi removida apenas do rascunho e está sendo recolocada
    // no mesmo dia/bloco, preserve o ID dela. A API então valida como edição e
    // desconsidera a alocação que ainda existe no servidor.
    const aulaOriginalRemovida = grade.aulas.find(
      (aula) =>
        aula.disciplinaId === disciplina.id &&
        aula.dia === dia &&
        aula.inicio === horario.inicio &&
        aula.fim === horario.fim &&
        !aulas.some((rascunho) => rascunho.id === aula.id),
    );
    setSalaId(aulaOriginalRemovida?.salaId ?? "");
    setProfessorId(aulaOriginalRemovida?.professorId ? String(aulaOriginalRemovida.professorId) : "");
    setErroProfessor("");
    setSugestoes(null);
    setErroValidacao("");
    setErroSala(false);
    setModal({
      tipo: "sala",
      disciplinaId: disciplina.id,
      dia,
      horario,
      aulaId: aulaOriginalRemovida?.id,
    });
  }

  async function confirmarSala() {
    if (modal?.tipo !== "sala" || !grade || !editando || bloqueado) return;
    const ocupante = buscarAula(aulas, modal.dia, modal.horario);
    if (ocupante && ocupante.id !== modal.aulaId) {
      setErroValidacao(AVISO_CELULA_OCUPADA);
      return;
    }
    const sala = salasDaGrade.find((item) => item.id === salaId);
    const disciplina = disciplinasDaGrade.find(
      (item) => item.id === modal.disciplinaId,
    );
    if (!sala) {
      setErroSala(true);
      return;
    }
    if (!disciplina) return;
    const professor = disciplina.professores?.find(p => String(p.id) === professorId);
    if (!professor) { setErroProfessor("Selecione um professor vinculado à disciplina."); return; }
    const disciplinaComProfessor = { ...disciplina, professorId: professor.id, professor: professor.nome };
    setProcessando(true);
    try {
      const validacao = await validar(
        grade,
        disciplinaComProfessor,
        sala.id,
        modal.dia,
        modal.horario,
        modal.aulaId,
      );
      if (edicaoAtual.current?.gradeId !== grade.id) return;
      if (!validacao.valido) {
        mostrarRejeicao(validacao);
        return;
      }
      setErroValidacao("");
    } catch (error) {
      setErroValidacao(erroAlocacao(error));
      setSugestoes(null);
      return;
    } finally {
      setProcessando(false);
    }
    const atual = edicaoAtual.current;
    if (atual?.gradeId !== grade.id) return;
    const resultado = alocarAula({
      aulas: atual.aulas,
      disciplina: disciplinaComProfessor,
      sala,
      dia: modal.dia,
      horario: modal.horario,
      // Uma aula removida do rascunho pode voltar mantendo seu ID persistido.
      aulaId: atual.aulas.some(aula => aula.id === modal.aulaId) ? modal.aulaId : undefined,
      novoId: modal.aulaId ?? gerarId(),
    });
    if (resultado.status === "ocupada") {
      setErroValidacao(AVISO_CELULA_OCUPADA);
      return;
    }
    if (resultado.status !== "nova" && resultado.status !== "mover") return;
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
    setSalvando(true);
    const snapshot = aulas.map((aula) => ({ ...aula }));
    setRascunhos(atual => ({ ...atual, [grade.id]: snapshot }));
    try {
      const confirmadas = await salvarAlocacao(grade.id, snapshot);
      setSalvas((atual) => ({ ...atual, [grade.id]: confirmadas }));
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
    } catch (error) {
      setModal({
        tipo: "aviso",
        titulo: "Não foi possível salvar a alocação",
        texto: `${erroAlocacao(error).replace(/\.?$/, ".")} O rascunho continua aberto. Você pode ajustar a alocação e tentar novamente.`,
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
                  if (aoVoltar) { aoVoltar(); return; }
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
            <div className="flex flex-wrap items-end gap-2">
              {!editando && (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  title="Editar"
                  aria-label="Editar"
                  disabled={bloqueado}
                  onClick={() => {
                    setEditando(true);
                    setMensagem("Modo de edição ativado.");
                  }}
                  className="h-10 w-10 rounded-lg p-2 text-[#17264D]"
                >
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                </Button>
              )}

              <div className="w-[220px] max-w-full">
                <label className="mb-2 block text-sm font-medium text-[#17264D]">Turno</label>
                <Select
                  aria-label="Turno"
                  className="[&>button]:h-10"
                  options={[
                    { label: "Todos os turnos", value: "todos" },
                    { label: "Manhã", value: "manha" },
                    { label: "Tarde", value: "tarde" },
                    { label: "Noite", value: "noite" },
                  ]}
                  value={turnoSelecionado}
                  onChange={(turno) => { setTurnoSelecionado(turno as Turno); setHorarioSelecionado(""); }}
                  disabled={bloqueado}
                />
              </div>
              <Button
                type="button"
                disabled={bloqueado}
                onClick={async () => {
                  if (editando && JSON.stringify(aulas) !== JSON.stringify(aulasSalvas)) {
                    setModal({ tipo: "aviso", titulo: "Salve as alterações antes de exportar", texto: "O PDF reúne os horários salvos das turmas ativas deste curso e ano." });
                    return;
                  }
                  setProcessando(true);
                  try { await exportarGrade(grade); } catch (error) { setModal({ tipo: "aviso", titulo: "Não foi possível exportar", texto: erroAlocacao(error) }); } finally { setProcessando(false); }
                }}
                variant="primary"
                size="small"
                className="gap-2"
                title="Exportar PDF das turmas ativas deste curso e ano"
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
                    options={horariosDoTurno.map(({ horario, indice }) => ({
                      label: horario.inicio + " - " + horario.fim,
                      value: String(indice),
                    }))}
                    value={
                      horariosDoTurno.some(
                        ({ indice }) => String(indice) === horarioSelecionado,
                      )
                        ? horarioSelecionado
                        : ""
                    }
                    onChange={setHorarioSelecionado}
                    placeholder="Selecione o bloco"
                    className="[&>div]:bg-white"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    className="h-9 text-sm"
                    disabled={
                      !selecionada ||
                      !horariosDoTurno.some(
                        ({ indice }) => String(indice) === horarioSelecionado,
                      )
                    }
                    onClick={() => {
                      const horario = horariosDoTurno.find(
                        ({ indice }) => String(indice) === horarioSelecionado,
                      )?.horario;
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
                    horarios={horariosDoTurno.map(({ horario }) => horario)}
                    intervalos={grade.intervalos}
                    aulas={aulas}
                    somenteLeitura={!editando || bloqueado}
                    onAulaDrop={(...args) => {
                      void handleDrop(...args);
                    }}
                    onDragStateChange={(ativo) =>
                      alterarArraste("grade", ativo)
                    }
                    onAulaClick={(aula) => {
                      if (!bloqueado)
                        setModal({ tipo: "detalhes", aulaId: aula.id });
                    }}
                    onDropOcupado={(...args) => {
                      void handleDrop(...args);
                    }}
                  />
                </div>
              </div>
              {horariosDoTurno.length === 0 && <p role="status" className="text-sm text-[#777777]">Nenhum bloco de horário disponível neste turno.</p>}
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
              setHorarioSelecionado("");
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
          onClose={() => {
            if (!bloqueado) setModal(null);
          }}
          className="max-w-xl overflow-visible [&>img]:rounded-[20px]"
        >
          <h2 className="pr-10 text-xl font-semibold">
            {erroValidacao ? "Alocação não permitida" : "Escolha a sala"}
          </h2>
          <p className="mt-3 text-sm text-[#777777]">
            {disciplinaPendente?.disciplina}
            <span className="mt-1 block text-xs">
              {DIAS.find((dia) => dia.key === modal.dia)?.label} ·{" "}
              {modal.horario.inicio} - {modal.horario.fim}
            </span>
          </p>
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Professor</label>
            <Select aria-label="Professor" options={(disciplinaPendente?.professores ?? []).map(p => ({ value: String(p.id), label: p.nome }))} value={professorId} placeholder="Selecione o professor" disabled={bloqueado || !disciplinaPendente?.professores?.length} onChange={valor => { setProfessorId(valor); setErroProfessor(""); setErroValidacao(""); setSugestoes(null); }} />
            {!disciplinaPendente?.professores?.length && <p role="alert" className="mt-2 text-sm text-red-700">Esta disciplina não possui professor ativo vinculado.</p>}
            {erroProfessor && <p role="alert" className="mt-2 text-sm text-red-700">{erroProfessor}</p>}
          </div>
          <div className="mb-8 mt-6">
              <RoomSelect
                salas={salasDaGrade}
                value={salaId}
                erro={erroSala}
                onChange={(id) => {
                  setSalaId(id);
                  setErroSala(false);
                  setErroValidacao("");
                  setSugestoes(null);
                }}
              />
            </div>
          {erroValidacao && (
            <p role="alert" className="mt-6 text-sm text-red-700">
              {erroValidacao}
            </p>
          )}
          {sugestoesDisponiveis?.length === 0 && (
            <p role="status" className="mt-3 text-sm">
              Nenhuma sugestão disponível para esta alocação.
            </p>
          )}
          {!!sugestoesDisponiveis?.length && (
            <div className="mt-3 space-y-2">
              <p className="text-sm">Sugestões disponíveis:</p>
              {sugestoesDisponiveis.map((item, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="ghost"
                  size="small"
                  disabled={bloqueado}
                  onClick={() => usarSugestao(item)}
                >
                  {DIAS.find((d) => d.key === item.dia)?.label}{" "}
                  {item.horario.inicio} -{" "}
                  {salasDaGrade.find((s) => s.id === item.salaId)?.nome ??
                    item.salaId}
                </Button>
              ))}
            </div>
          )}
          <div className="mt-7 flex justify-end gap-3">
            <Button
              type="button"
              disabled={bloqueado}
              onClick={() => setModal(null)}
              variant="ghost"
              size="small"
            >
              {erroValidacao ? "Voltar à grade" : "Cancelar"}
            </Button>
              <Button
                type="button"
                disabled={bloqueado || !salasDaGrade.length || !disciplinaPendente?.professores?.length}
                onClick={() => void confirmarSala()}
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
  const [dados, setDados] = useState<Awaited<ReturnType<typeof carregarDados>> | null>(null);
  const [quadroId, setQuadroId] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const gravacaoPendente = useRef<number | null>(null);
  useEffect(() => {
    let ativo = true;
    if (quadroId === null) return () => { ativo = false; };
    carregarDados(quadroId).then(resultado => { if (ativo) { setDados(resultado); setErro(""); } }).catch(error => { if (ativo) setErro(erroAlocacao(error)); });
    return () => { ativo = false; };
  }, [tentativa, quadroId]);
  if (quadroId === null) return <SelecaoQuadro aoSelecionar={setQuadroId} />;
  if (erro) return <div role="alert" className="p-8">{erro} <Button onClick={() => { setErro(""); setTentativa(n => n + 1); }}>Tentar novamente</Button></div>;
  if (!dados) return <div role="status" className="p-8">Carregando grades...</div>;
  if (!dados.grades.length) return <div role="alert" className="p-8">O quadro selecionado não está ativo ou não possui turma. <Button onClick={() => { setDados(null); setQuadroId(null); }}>Voltar</Button></div>;
  const dadosAbertos = dados;
  const idQuadro = quadroId;

  async function salvarQuadro(id: string, aulas: Aula[]) {
    async function atualizarBase() {
      const atualizados = await carregarDados(idQuadro);
      const grade = atualizados.grades.find(g => g.id === id);
      if (!grade) throw new Error("ALOCACAO:O quadro não está mais disponível para edição.");
      setDados(atualizados);
      return { ...atualizados, grade };
    }

    const reconciliar = gravacaoPendente.current === idQuadro;
    const base = reconciliar ? await atualizarBase() : dadosAbertos;
    const grade = base.grades.find(g => g.id === id);
    if (!grade) throw new Error("ALOCACAO:Grade não encontrada.");
    gravacaoPendente.current = idQuadro;
    try {
      await salvarGrade(grade, aulas, base.disciplinas, reconciliar);
    } catch (error) {
      // Algumas alterações individuais podem ter sido persistidas antes da falha.
      try { await atualizarBase(); } catch { /* A próxima tentativa consulta o quadro novamente. */ }
      throw error;
    }
    try {
      const atualizados = await atualizarBase();
      gravacaoPendente.current = null;
      return atualizados.grade.aulas;
    } catch {
      throw new Error("ALOCACAO:As alterações foram enviadas, mas a confirmação do quadro falhou. Tente salvar novamente para conferir o resultado.");
    }
  }

  return <TelaAlocacao key={quadroId} gradeInicialId={dados.grades[0].id} aoVoltar={() => { setDados(null); setQuadroId(null); }} grades={dados.grades} disciplinas={dados.disciplinas} salas={dados.salas} salvarAlocacao={salvarQuadro} />;
}
