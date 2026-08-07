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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  WrenchIcon,
  TrashIcon,
  CheckIcon,
} from "lucide-react"
import { Sala } from "./types"
import { SALAS_MOCK } from "./mock"
import {
  TIPOS,
  ITENS_POR_PAGINA_OPCOES,
  PRIMARY,
  PRIMARY_FG,
} from "./constants"

const RECURSO_DOT = "#9B2242"

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export default function SalasPage() {
  const router = useRouter()

  // -- Filtros --
  const [busca, setBusca] = useState("")
  const [filtroCodigo, setFiltroCodigo] = useState("")
  const [filtroCapacidade, setFiltroCapacidade] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")

  // -- Paginação --
  const [itensPorPagina, setItensPorPagina] = useState(6)
  const [paginaAtual, setPaginaAtual] = useState(1)

  // -- Modal de cadastro/edição --
  const [modalAberto, setModalAberto] = useState(false)
  const [salaEditando, setSalaEditando] = useState<Sala | null>(null)

  // -- Modal de detalhes --
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [salaDetalhe, setSalaDetalhe] = useState<Sala | null>(null)

  // -- Modal de exclusão --
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [salaExcluir, setSalaExcluir] = useState<Sala | null>(null)

  // -- Modal de sucesso (cadastrar / editar / excluir) --
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState("")

  function mostrarSucesso(mensagem: string) {
    setMensagemSucesso(mensagem)
    setModalSucessoAberto(true)
    setTimeout(() => setModalSucessoAberto(false), 1800)
  }

  // Campos do formulário
  const [formCodigo, setFormCodigo] = useState("")
  const [formCapacidade, setFormCapacidade] = useState("")
  const [formTipo, setFormTipo] = useState("")
  const [erros, setErros] = useState<Record<string, string>>({})

  // Lista de salas (estado local para simular CRUD)
  const [salas, setSalas] = useState<Sala[]>(SALAS_MOCK)

  // -------------------------------------------------------
  // Filtragem
  // -------------------------------------------------------
  const salasFiltradas = salas.filter((s) => {
    const buscaOk =
      busca === "" ||
      s.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      s.tipo.toLowerCase().includes(busca.toLowerCase()) ||
      String(s.capacidade).includes(busca)

    const codigoOk =
      filtroCodigo === "" || s.codigo.toLowerCase().includes(filtroCodigo.toLowerCase())
    const capacidadeOk =
      filtroCapacidade === "" || String(s.capacidade).includes(filtroCapacidade)
    const tipoOk =
      filtroTipo === "" || s.tipo.toLowerCase().includes(filtroTipo.toLowerCase())

    return buscaOk && codigoOk && capacidadeOk && tipoOk
  })

  // -------------------------------------------------------
  // Paginação
  // -------------------------------------------------------
  const totalPaginas = Math.max(1, Math.ceil(salasFiltradas.length / itensPorPagina))
  const paginaSegura = Math.min(paginaAtual, totalPaginas)
  const inicio = (paginaSegura - 1) * itensPorPagina
  const salasPagina = salasFiltradas.slice(inicio, inicio + itensPorPagina)

  function irParaPagina(p: number) {
    setPaginaAtual(Math.max(1, Math.min(p, totalPaginas)))
  }

  // -------------------------------------------------------
  // Limpar filtros
  // -------------------------------------------------------
  function limparFiltros() {
    setBusca("")
    setFiltroCodigo("")
    setFiltroCapacidade("")
    setFiltroTipo("")
    setPaginaAtual(1)
  }

  // -------------------------------------------------------
  // Abrir modal de cadastro/edição
  // -------------------------------------------------------
  function abrirCadastro() {
    setSalaEditando(null)
    setFormCodigo("")
    setFormCapacidade("")
    setFormTipo("")
    setErros({})
    setModalAberto(true)
  }

  function abrirEdicao(sala: Sala) {
    setSalaEditando(sala)
    setFormCodigo(sala.codigo)
    setFormCapacidade(String(sala.capacidade))
    setFormTipo(sala.tipo)
    setErros({})
    setModalAberto(true)
  }

  function abrirDetalhes(sala: Sala) {
    setSalaDetalhe(sala)
    setModalDetalhesAberto(true)
  }

  // -------------------------------------------------------
  // Excluir
  // -------------------------------------------------------
  function excluir(sala: Sala) {
    setSalaExcluir(sala)
    setModalExcluirAberto(true)
  }

  function confirmarExclusao() {
    if (!salaExcluir) return
    setSalas((prev) => prev.filter((s) => s.id !== salaExcluir.id))
    setModalExcluirAberto(false)
    setSalaExcluir(null)
    mostrarSucesso("Sala excluída com sucesso!")
  }

  // -------------------------------------------------------
  // Salvar (cadastro ou edição)
  // -------------------------------------------------------
  function salvar() {
    const capacidadeNum = Number(formCapacidade)
    const novosErros: Record<string, string> = {}

    if (!formCodigo.trim()) novosErros.codigo = "Informe o código da sala."
    if (!formTipo) novosErros.tipo = "Selecione um tipo."
    if (!formCapacidade || capacidadeNum < 1 || capacidadeNum > 500)
      novosErros.capacidade = "Informe uma capacidade entre 1 e 500."

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setErros({})

    if (salaEditando) {
      setSalas((prev) =>
        prev.map((s) =>
          s.id === salaEditando.id
            ? { ...s, codigo: formCodigo, capacidade: capacidadeNum, tipo: formTipo }
            : s
        )
      )
      setModalAberto(false)
      setPaginaAtual(1)
      mostrarSucesso("Sala editada com sucesso!")
    } else {
      const novoId = salas.length > 0 ? Math.max(...salas.map((s) => s.id)) + 1 : 1
      setSalas((prev) => [
        ...prev,
        { id: novoId, codigo: formCodigo, capacidade: capacidadeNum, tipo: formTipo, recursos: [] },
      ])
      setModalAberto(false)
      setPaginaAtual(1)
      mostrarSucesso("Sala cadastrada com sucesso!")
    }
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <TooltipProvider>
    <div className="max-w-6xl mx-auto px-6 py-8">
      <style>{`
        #tipo:hover {
          border-color: #0099AA !important;
        }
        /* A seta do Tooltip (TooltipPrimitive.Arrow) tem className fixo dentro
           do tooltip.tsx compartilhado e não expõe prop para sobrescrever a cor.
           Como só podemos editar esta página, sobrescrevemos via CSS aqui,
           mirando o atributo data-slot exposto pelo Radix + a classe rotate-45
           (exclusiva da seta, a caixa do tooltip não tem essa classe). */
        [data-slot="tooltip-content"] [class*="rotate-45"] {
          background-color: ${PRIMARY} !important;
          fill: ${PRIMARY} !important;
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
            <h1 className="text-[36px] font-bold leading-tight">Salas</h1>
            <p className="text-sm text-muted-foreground">Gerencie as salas da instituição</p>
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

      {/* Filtros — box com borda englobando Código, Capacidade e Tipo + botão Limpar fora */}
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
            <Label className="font-semibold text-black text-base">Código</Label>
            <Input
              placeholder="Digite aqui..."
              className="w-40 h-11 hover:border-[#0099AA] transition-colors"
              style={{
                backgroundColor: "#F2F2F2",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
              value={filtroCodigo}
              onChange={(e) => { setFiltroCodigo(e.target.value); setPaginaAtual(1) }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-semibold text-black text-base">Capacidade</Label>
            <Input
              placeholder="Digite aqui..."
              className="w-40 h-11 hover:border-[#0099AA] transition-colors"
              style={{
                backgroundColor: "#F2F2F2",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
              value={filtroCapacidade}
              onChange={(e) => { setFiltroCapacidade(e.target.value); setPaginaAtual(1) }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-semibold text-black text-base">Tipo</Label>
            <Input
              placeholder="Digite aqui..."
              className="w-40 h-11 hover:border-[#0099AA] transition-colors"
              style={{
                backgroundColor: "#F2F2F2",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
              value={filtroTipo}
              onChange={(e) => { setFiltroTipo(e.target.value); setPaginaAtual(1) }}
            />
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
              <TableHead className="text-base font-bold py-4 pl-6 rounded-tl-lg" style={{ color: PRIMARY_FG }}>
                Código
              </TableHead>
              <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>
                Capacidade
              </TableHead>
              <TableHead className="text-base font-bold py-4" style={{ color: PRIMARY_FG }}>
                Tipo
              </TableHead>
              <TableHead className="text-right rounded-tr-lg text-base font-bold py-4 pr-6" style={{ color: PRIMARY_FG }}>
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salasPagina.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma sala encontrada.
                </TableCell>
              </TableRow>
            ) : (
              salasPagina.map((sala, index) => (
                <TableRow
                  key={sala.id}
                  className={`
                    ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                    border-b border-[#D9D9D9]
                    hover:bg-[#EAF6FB]
                    transition-colors
                    cursor-pointer
                  `}
                >
                  <TableCell className="py-4 pl-6">{sala.codigo}</TableCell>
                  <TableCell className="py-4">{sala.capacidade}</TableCell>
                  <TableCell className="max-w-[200px] truncate py-4" title={sala.tipo}>
                    {sala.tipo}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => abrirDetalhes(sala)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                            style={{ color: PRIMARY }}
                          >
                            <WrenchIcon className="size-4 group-hover:text-white transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={8}
                          style={{ backgroundColor: PRIMARY, color: PRIMARY_FG }}
                        >
                          Ver Recursos
                        </TooltipContent>
                      </Tooltip>
                      <button
                        onClick={() => abrirEdicao(sala)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                        style={{ color: PRIMARY }}
                      >
                        <PencilIcon className="size-4 group-hover:text-white transition-colors" />
                      </button>
                      <button
                        onClick={() => excluir(sala)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#FF0000] hover:border-[#FF0000] group transition-colors"
                        style={{ color: "#FF0000" }}
                      >
                        <TrashIcon className="size-4 group-hover:text-white transition-colors" />
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
        <div className="w-[260px] border rounded-md px-4 h-9 flex items-center justify-center text-sm">
          Mostrando {salasFiltradas.length === 0 ? 0 : inicio + 1} a{" "}
          {Math.min(inicio + itensPorPagina, salasFiltradas.length)} de{" "}
          {salasFiltradas.length} registros
        </div>
      </div>

      {/* Modal Cadastro / Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent
          className="!max-w-[560px] p-8 bg-white rounded-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-left text-2xl font-bold">
              {salaEditando ? "Edição de Sala" : "Cadastro de Sala"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            {/* Linha 1 — Código da Sala + Capacidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="codigo" className="text-sm">Código da Sala:</Label>
                <Input
                  id="codigo"
                  placeholder="Digite aqui..."
                  value={formCodigo}
                  onChange={(e) => { setFormCodigo(e.target.value); setErros((p) => ({ ...p, codigo: "" })) }}
                  style={{ borderColor: erros.codigo ? "#FF0000" : "#D1D5DB" }}
                />
                {erros.codigo && <span className="text-xs text-red-500">{erros.codigo}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="capacidade" className="text-sm">Capacidade:</Label>
                <Input
                  id="capacidade"
                  type="number"
                  placeholder="0"
                  value={formCapacidade}
                  onChange={(e) => { setFormCapacidade(e.target.value); setErros((p) => ({ ...p, capacidade: "" })) }}
                  style={{ borderColor: erros.capacidade ? "#FF0000" : "#D1D5DB" }}
                />
                {erros.capacidade && <span className="text-xs text-red-500">{erros.capacidade}</span>}
              </div>
            </div>

            {/* Linha 2 — Tipo de Sala */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo" className="text-sm">Tipo de Sala:</Label>
              <NativeSelect
                id="tipo"
                className="w-full h-11 hover:border-[#0099AA] transition-colors"
                value={formTipo}
                onChange={(e) => { setFormTipo(e.target.value); setErros((p) => ({ ...p, tipo: "" })) }}
                style={{
                  backgroundColor: "#F2F2F2",
                  color: formTipo === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                  borderColor: erros.tipo ? "#FF0000" : "rgba(23, 38, 77, 0.15)",
                  borderWidth: "1.4px"
                }}
              >
                <NativeSelectOption value="">Selecione...</NativeSelectOption>
                {TIPOS.map((tipo) => (
                  <NativeSelectOption key={tipo} value={tipo}>
                    {tipo}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {erros.tipo && <span className="text-xs text-red-500">{erros.tipo}</span>}
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

      {/* Modal Ver Recursos */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="!max-w-[420px] p-6 bg-white rounded-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-left text-xl font-semibold">
              Recursos — {salaDetalhe?.codigo}
            </DialogTitle>
          </DialogHeader>

          {salaDetalhe && (
            <div className="flex flex-col gap-3">
              {salaDetalhe.recursos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum recurso cadastrado para esta sala.
                </p>
              ) : (
                salaDetalhe.recursos.map((recurso, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                    style={{ borderColor: "rgba(23, 38, 77, 0.15)" }}
                  >
                    <span
                      className="mt-1.5 size-2 rounded-full shrink-0"
                      style={{ backgroundColor: RECURSO_DOT }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{recurso.nome}</span>
                      <span className="text-xs text-muted-foreground">{recurso.categoria}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Excluir Sala */}
      <Dialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <DialogContent
          className="!max-w-[760px] p-8 bg-white rounded-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="mb-1">
            <DialogTitle className="text-left text-2xl font-bold">
              Excluir Sala
            </DialogTitle>
          </DialogHeader>

          <p className="text-base">
            Tem certeza que deseja excluir {salaExcluir ? `a ${salaExcluir.codigo}` : "esta Sala"}?
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(0, 0, 0, 0.45)" }}>
            A ação será irreversível.
          </p>

          <DialogFooter className="mt-6 bg-transparent border-t-0 px-0 pb-0 gap-3">
            <button
              onClick={() => setModalExcluirAberto(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-widest uppercase px-4"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarExclusao}
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-semibold tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: PRIMARY, color: PRIMARY_FG }}
            >
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sucesso (cadastrar / editar / excluir) */}
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
    </TooltipProvider>
  )
}
