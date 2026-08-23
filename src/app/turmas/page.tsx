"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  ArrowLeftIcon,
  PlusIcon,
  SearchIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react"
import { Turma, Status } from "./types"
import { TURMAS_MOCK } from "./mock"
import {
  PERIODOS,
  ANOS,
  ITENS_POR_PAGINA_OPCOES,
  PRIMARY,
  PRIMARY_FG,
} from "./constants"
import { TurmasTable } from "./turmas-table"
import { TurmaFormDialog, SucessoDialog } from "./turma-dialogs"

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export default function TurmasPage() {
  const router = useRouter()

  // -- Filtros --
  const [busca, setBusca] = useState("")
  const [filtroPeriodo, setFiltroPeriodo] = useState("")
  const [filtroAno, setFiltroAno] = useState("")

  // -- Paginação --
  const [itensPorPagina, setItensPorPagina] = useState(10)
  const [paginaAtual, setPaginaAtual] = useState(1)

  // -- Modal de cadastro/edição --
  const [modalAberto, setModalAberto] = useState(false)
  const [turmaEditando, setTurmaEditando] = useState<Turma | null>(null)

  // -- Modal de sucesso (cadastrar / editar) --
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState("")

  function mostrarSucesso(mensagem: string) {
    setMensagemSucesso(mensagem)
    setModalSucessoAberto(true)
    setTimeout(() => setModalSucessoAberto(false), 1800)
  }

  // Campos do formulário
  const [formPeriodo, setFormPeriodo] = useState("")
  const [formAno, setFormAno] = useState("")
  const [formQtdAlunos, setFormQtdAlunos] = useState("")
  const [formCurso, setFormCurso] = useState("")
  const [formStatus, setFormStatus] = useState<Status | null>(null)
  const [erros, setErros] = useState<Record<string, string>>({})

  // Lista de turmas (estado local para simular CRUD)
  const [turmas, setTurmas] = useState<Turma[]>(TURMAS_MOCK)

  // -------------------------------------------------------
  // Filtragem
  // -------------------------------------------------------
  const turmasFiltradas = turmas.filter((t) => {
    const buscaOk =
      busca === "" ||
      t.curso.toLowerCase().includes(busca.toLowerCase()) ||
      t.periodo.toLowerCase().includes(busca.toLowerCase()) ||
      String(t.ano).includes(busca)

    const periodoOk = filtroPeriodo === "" || t.periodo === filtroPeriodo
    const anoOk = filtroAno === "" || String(t.ano) === filtroAno

    return buscaOk && periodoOk && anoOk
  })

  // -------------------------------------------------------
  // Paginação
  // -------------------------------------------------------
  const totalPaginas = Math.max(1, Math.ceil(turmasFiltradas.length / itensPorPagina))
  const paginaSegura = Math.min(paginaAtual, totalPaginas)
  const inicio = (paginaSegura - 1) * itensPorPagina
  const turmasPagina = turmasFiltradas.slice(inicio, inicio + itensPorPagina)

  function irParaPagina(p: number) {
    setPaginaAtual(Math.max(1, Math.min(p, totalPaginas)))
  }

  // -------------------------------------------------------
  // Limpar filtros
  // -------------------------------------------------------
  function limparFiltros() {
    setBusca("")
    setFiltroPeriodo("")
    setFiltroAno("")
    setPaginaAtual(1)
  }

  // -------------------------------------------------------
  // Abrir modal
  // -------------------------------------------------------
  function abrirCadastro() {
    setTurmaEditando(null)
    setFormPeriodo("")
    setFormAno("")
    setFormQtdAlunos("")
    setFormCurso("")
    setFormStatus(null)
    setErros({})
    setModalAberto(true)
  }

  function abrirEdicao(turma: Turma) {
    setTurmaEditando(turma)
    setFormPeriodo(turma.periodo)
    setFormAno(String(turma.ano))
    setFormQtdAlunos(String(turma.qtdAlunos))
    setFormCurso(turma.curso)
    setFormStatus(turma.status)
    setErros({})
    setModalAberto(true)
  }

  // -------------------------------------------------------
  // Campos do formulário (cada handler já limpa o erro correspondente)
  // -------------------------------------------------------
  function handleFormPeriodoChange(valor: string) {
    setFormPeriodo(valor)
    setErros((p) => ({ ...p, periodo: "" }))
  }

  function handleFormCursoChange(valor: string) {
    setFormCurso(valor)
    setErros((p) => ({ ...p, curso: "" }))
  }

  function handleFormQtdAlunosChange(valor: string) {
    setFormQtdAlunos(valor)
    setErros((p) => ({ ...p, qtdAlunos: "" }))
  }

  function handleFormAnoChange(valor: string) {
    setFormAno(valor)
    setErros((p) => ({ ...p, ano: "" }))
  }

  function handleFormStatusChange(valor: Status) {
    setFormStatus(valor)
    setErros((p) => ({ ...p, status: "" }))
  }

  // -------------------------------------------------------
  // Salvar (cadastro ou edição)
  // -------------------------------------------------------
  function salvar() {
    const anoNum = Number(formAno)
    const qtdNum = Number(formQtdAlunos)
    const novosErros: Record<string, string> = {}

    if (!formPeriodo) novosErros.periodo = "Selecione um período."
    if (!formCurso) novosErros.curso = "Selecione um curso."
    if (!formAno || anoNum < 1900 || anoNum > 2026)
      novosErros.ano = "Informe um ano entre 1900 e 2026."
    if (!formQtdAlunos || qtdNum < 1 || qtdNum > 500)
      novosErros.qtdAlunos = "Informe uma quantidade entre 1 e 100."
    if (!formStatus) novosErros.status = "Selecione um status."

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setErros({})

    if (turmaEditando) {
      setTurmas((prev) =>
        prev.map((t) =>
          t.id === turmaEditando.id
            ? { ...t, periodo: formPeriodo, ano: anoNum, qtdAlunos: qtdNum, curso: formCurso, status: formStatus as Status }
            : t
        )
      )
      setModalAberto(false)
      setPaginaAtual(1)
      mostrarSucesso("Turma editada com sucesso!")
    } else {
      const novoId = turmas.length > 0 ? Math.max(...turmas.map((t) => t.id)) + 1 : 1
      setTurmas((prev) => [
        ...prev,
        { id: novoId, periodo: formPeriodo, ano: anoNum, qtdAlunos: qtdNum, curso: formCurso, status: formStatus as Status },
      ])
      setModalAberto(false)
      setPaginaAtual(1)
      mostrarSucesso("Turma cadastrada com sucesso!")
    }
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <style>{`
        #periodo:hover, #curso:hover {
          border-color: #0099AA !important;
        }
      `}</style>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="mt-1.5 text-black hover:opacity-70 transition-opacity"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="size-6" />
          </button>
          <div>
            <h1 className="text-[36px] font-bold leading-tight">Turmas</h1>
            <p className="text-sm text-muted-foreground">Gerencie as turmas da instituição</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Campo de busca */}
          <div className="relative">
            <SearchIcon
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4"
              style={{ color: "#464646" }}
              strokeWidth={4}
            />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 w-56 h-11 rounded-[10px] text-base"
              style={{ borderColor: "rgba(51, 51, 51, 0.57)", borderWidth: "1.5px" }}
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1) }}
            />
          </div>
          {/* Botão cadastrar */}
          <button
            onClick={abrirCadastro}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[10px] text-base font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY, color: PRIMARY_FG, borderRadius: "10px" }}
          >
            <PlusIcon className="size-4" />
            Cadastrar
          </button>
        </div>
      </div>

      {/* Filtros — box com borda englobando Período e Ano + botão Limpar fora */}
      <div className="flex items-end gap-3 mb-4">
        <div
          className="border rounded-lg px-4 py-3 flex flex-wrap items-end gap-4 w-full"
          style={{
            backgroundColor: "#EAF6FB",
            borderColor: "rgba(23, 38, 77, 0.15)",
            borderWidth: "2px"
          }}
        >
          <div className="flex flex-col gap-1">
            <Label className="font-semibold text-black text-base">Período</Label>
            <NativeSelect
              className="w-40 h-11 hover:border-[#0099AA] transition-colors"
              value={filtroPeriodo}
              onChange={(e) => {
                setFiltroPeriodo(e.target.value)
                setPaginaAtual(1)
              }}
              style={{
                backgroundColor: "#F2F2F2",
                color: filtroPeriodo === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
            >
              <NativeSelectOption value="">Selecione...</NativeSelectOption>
              {PERIODOS.map((periodo) => (
                <NativeSelectOption key={periodo} value={periodo}>
                  {periodo}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-semibold text-black text-base">Ano</Label>
            <NativeSelect
              className="w-40 h-11 hover:border-[#0099AA] transition-colors"
              value={filtroAno}
              onChange={(e) => {
                setFiltroAno(e.target.value)
                setPaginaAtual(1)
              }}
              style={{
                backgroundColor: "#F2F2F2",
                color: filtroAno === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
            >
              <NativeSelectOption value="">Selecione...</NativeSelectOption>
              {ANOS.map((ano) => (
                <NativeSelectOption key={ano} value={String(ano)}>
                  {ano}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Botão Limpar filtros */}
          <button
            onClick={limparFiltros}
            className="ml-auto self-center inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: PRIMARY,
              color: PRIMARY_FG,
            }}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Tabela */}
      <TurmasTable turmas={turmasPagina} onEditar={abrirEdicao} />

      {/* Paginação */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border rounded-lg p-2 bg-white">
        {/* Itens por página */}
        <div className="flex items-center gap-2 px-3 h-9">
          <span className="text-sm whitespace-nowrap text-gray-600">Itens por página:</span>
          <NativeSelect
            className="border-0 text-sm bg-transparent font-medium cursor-pointer p-0 w-auto"
            value={itensPorPagina}
            onChange={(e) => {
              setItensPorPagina(Number(e.target.value))
              setPaginaAtual(1)
            }}
          >
            {ITENS_POR_PAGINA_OPCOES.map((n) => (
              <NativeSelectOption key={n} value={n}>{n}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {/* Navegação */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="h-10 w-10 bg-[#A7DCE4] hover:bg-[#7ECAD7] transition-colors"
            onClick={() => irParaPagina(1)}
            disabled={paginaSegura === 1}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            style={{ borderColor: "rgb(0, 153, 170, 0.3)" }}
            variant="outline"
            size="icon-sm"
            className="h-10 w-10 bg-[#A7DCE4] hover:bg-[#7ECAD7] transition-colors"
            onClick={() => irParaPagina(paginaSegura - 1)}
            disabled={paginaSegura === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <div
            className="w-[140px] h-10 flex items-center justify-center rounded-md font-medium text-base"
            style={{ backgroundColor: "#7ECAD7" }}
          >
            Página {paginaSegura} de {totalPaginas}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            className="h-10 w-10 bg-[#A7DCE4] hover:bg-[#7ECAD7] transition-colors"
            onClick={() => irParaPagina(paginaSegura + 1)}
            disabled={paginaSegura === totalPaginas}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            className="h-10 w-10 bg-[#A7DCE4] hover:bg-[#7ECAD7] transition-colors"
            onClick={() => irParaPagina(totalPaginas)}
            disabled={paginaSegura === totalPaginas}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Registros */}
        <div className="w-[260px] border rounded-md px-4 h-9 flex items-center justify-center text-sm">
          Mostrando {turmasFiltradas.length === 0 ? 0 : inicio + 1} a{" "}
          {Math.min(inicio + itensPorPagina, turmasFiltradas.length)} de{" "}
          {turmasFiltradas.length} registros
        </div>
      </div>

      {/* Modal Cadastro / Edição */}
      <TurmaFormDialog
        open={modalAberto}
        onOpenChange={setModalAberto}
        turmaEditando={turmaEditando}
        formPeriodo={formPeriodo}
        onFormPeriodoChange={handleFormPeriodoChange}
        formCurso={formCurso}
        onFormCursoChange={handleFormCursoChange}
        formQtdAlunos={formQtdAlunos}
        onFormQtdAlunosChange={handleFormQtdAlunosChange}
        formAno={formAno}
        onFormAnoChange={handleFormAnoChange}
        formStatus={formStatus}
        onFormStatusChange={handleFormStatusChange}
        erros={erros}
        onCancelar={() => setModalAberto(false)}
        onSalvar={salvar}
      />

      {/* Modal Sucesso (cadastrar / editar) */}
      <SucessoDialog
        open={modalSucessoAberto}
        onOpenChange={setModalSucessoAberto}
        mensagem={mensagemSucesso}
      />
    </div>
  )
}
