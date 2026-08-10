"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FunnelIcon,
  CircleCheckIcon,
  CircleMinusIcon,
  CheckIcon,
} from "lucide-react"
import { Turma, Status } from "./types"
import { TURMAS_MOCK } from "./mock"
import {
  PERIODOS,
  ANOS,
  CURSOS,
  ITENS_POR_PAGINA_OPCOES,
  PRIMARY,
  PRIMARY_FG,
} from "./constants"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


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
      <div className="overflow-hidden rounded-xl border border-[#D9D9D9]">
        <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow
            className="border-0 hover:bg-transparent"
            style={{ backgroundColor: PRIMARY }}
          >
            <TableHead
              className="w-[80px] rounded-tl-lg text-base font-bold py-4 pl-6"
              style={{ color: PRIMARY_FG }}
            >ID</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Período</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Ano</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Qtd Alunos</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>Curso</TableHead>
            <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>
              <span className="flex items-center gap-2">
                Status
                <FunnelIcon className="size-4 py-4" />
              </span>
            </TableHead>
            <TableHead className="text-right rounded-tr-lg text-base font-bold py-4 pr-6" style={{ color: PRIMARY_FG }}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {turmasPagina.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma turma encontrada.
              </TableCell>
            </TableRow>
          ) : (
            turmasPagina.map((turma, index) => (
              <TableRow
                key={turma.id}
                className={`
                  ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                  border-b border-[#D9D9D9]
                  hover:bg-[#EAF6FB]
                  transition-colors
                  cursor-pointer
                `}
              >
                <TableCell className="py-4 pl-6">{turma.id}</TableCell>
                <TableCell className="py-4">{turma.periodo}</TableCell>
                <TableCell className="py-4">{turma.ano}</TableCell>
                <TableCell className="py-4">{turma.qtdAlunos}</TableCell>
                <TableCell className="max-w-[200px] truncate py-4" title={turma.curso}>
                  {turma.curso}
                </TableCell>                   
                <TableCell className="py-4" >
                  {turma.status === "Ativo" ? (
                    <span className="inline-flex items-center gap-2 text-[#21C11E] font-medium">
                      <CircleCheckIcon className="h-5 w-5" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[#FF0000] font-medium">
                      <CircleMinusIcon className="h-5 w-5" />
                      Inativo
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => abrirEdicao(turma)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                      style={{ color: PRIMARY }}
                    >
                      <PencilIcon className="size-4 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

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
      <div className="w-[260px] border rounded-md px-4 h-9 flex items-center justify-center text-sm">          Mostrando {turmasFiltradas.length === 0 ? 0 : inicio + 1} a{" "}
          {Math.min(inicio + itensPorPagina, turmasFiltradas.length)} de{" "}
          {turmasFiltradas.length} registros
        </div>
      </div>

      {/* Modal Cadastro / Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent
          className="!max-w-[640px] p-8 bg-white rounded-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-left text-2xl font-bold">
              {turmaEditando ? "Edição de Turma" : "Cadastro de Turma"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            {/* Linha 1 — Período + Curso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="periodo" className="text-sm">Período:</Label>
                <NativeSelect
                  id="periodo"
                  className="w-full h-11 hover:border-[#0099AA] transition-colors"
                  value={formPeriodo}
                  onChange={(e) => { setFormPeriodo(e.target.value); setErros((p) => ({ ...p, periodo: "" })) }}
                  style={{
                    backgroundColor: "#F2F2F2",
                    color: formPeriodo === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                    borderColor: erros.periodo ? "#FF0000" : "rgba(23, 38, 77, 0.15)",
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
                {erros.periodo && <span className="text-xs text-red-500">{erros.periodo}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="curso" className="text-sm">Curso:</Label>
                <NativeSelect
                  id="curso"
                  className="w-full h-11 hover:border-[#0099AA] transition-colors"
                  value={formCurso}
                  onChange={(e) => { setFormCurso(e.target.value); setErros((p) => ({ ...p, curso: "" })) }}
                  style={{
                    backgroundColor: "#F2F2F2",
                    color: formCurso === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                    borderColor: erros.curso ? "#FF0000" : "rgba(23, 38, 77, 0.15)",
                    borderWidth: "1.4px"
                  }}
                >
                  <NativeSelectOption value="">Selecione...</NativeSelectOption>
                  {CURSOS.map((curso) => (
                    <NativeSelectOption key={curso} value={curso}>
                      {curso}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {erros.curso && <span className="text-xs text-red-500">{erros.curso}</span>}
              </div>
            </div>

            {/* Linha 2 — Qtd Alunos + Ano + Status */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qtdAlunos" className="text-sm">Qtd. Alunos:</Label>
                <Input
                  id="qtdAlunos"
                  type="number"
                  placeholder="Ex. 40"
                  value={formQtdAlunos}
                  onChange={(e) => { setFormQtdAlunos(e.target.value); setErros((p) => ({ ...p, qtdAlunos: "" })) }}
                  style={{ borderColor: erros.qtdAlunos ? "#FF0000" : "#D1D5DB" }}
                />
                {erros.qtdAlunos && <span className="text-xs text-red-500">{erros.qtdAlunos}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ano" className="text-sm">Ano:</Label>
                <Input
                  id="ano"
                  type="number"
                  placeholder="Ex. 2026"
                  value={formAno}
                  onChange={(e) => { setFormAno(e.target.value); setErros((p) => ({ ...p, ano: "" })) }}
                  style={{ borderColor: erros.ano ? "#FF0000" : "#D1D5DB" }}
                />
                {erros.ano && <span className="text-xs text-red-500">{erros.ano}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">Status:</Label>
                <RadioGroup
                  value={formStatus ?? ""}
                  onValueChange={(val) => { setFormStatus(val as Status); setErros((p) => ({ ...p, status: "" })) }}
                  className="flex flex-row gap-4 pt-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="Ativo"
                      id="status-ativo"
                      className="size-5 border-2 border-gray-400 data-checked:bg-[#4471E6] data-checked:border-[#4471E6]"
                    />
                    <Label htmlFor="status-ativo" className="font-normal cursor-pointer">
                      Ativo
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="Inativo"
                      id="status-inativo"
                      className="size-5 border-2 border-gray-400 data-checked:bg-[#4471E6] data-checked:border-[#4471E6]"
                    />
                    <Label htmlFor="status-inativo" className="font-normal cursor-pointer">
                      Inativo
                    </Label>
                  </div>
                </RadioGroup>
                {erros.status && <span className="text-xs text-red-500">{erros.status}</span>}
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <DialogFooter className="mt-6 bg-transparent border-t-0 px-0 pb-0 gap-3">
            <button
              onClick={() => setModalAberto(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-widest uppercase px-4"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-semibold tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: PRIMARY, color: PRIMARY_FG }}
            >
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sucesso (cadastrar / editar) */}
      <Dialog open={modalSucessoAberto} onOpenChange={setModalSucessoAberto}>
        <DialogContent
          className="!max-w-[420px] py-10 px-8 bg-[#EDEDED] rounded-2xl flex flex-col items-center gap-4"
          showCloseButton={false}
        >
          <div
            className="flex items-center justify-center size-16 rounded-full border-2"
            style={{ borderColor: "#4471E6" }}
          >
            <CheckIcon className="size-8" style={{ color: "#4471E6" }} strokeWidth={3} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-base font-medium">
              {mensagemSucesso}
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}