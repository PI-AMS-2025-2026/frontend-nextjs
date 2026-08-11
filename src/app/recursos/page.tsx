"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  ChevronDownIcon,
  TrashIcon,
  CheckIcon,
} from "lucide-react"
import { Recurso } from "./types"
import { RECURSOS_MOCK } from "./mock"
import {
  ITENS_POR_PAGINA_OPCOES,
  PRIMARY,
  PRIMARY_FG,
  TIPOS_PADRAO,
} from "./constants"

const NOVO_TIPO_VALUE = "__novo__"

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export default function RecursosPage() {
  const router = useRouter()

  // -- Filtros --
  const [busca, setBusca] = useState("")
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")

  // -- Paginação --
  const [itensPorPagina, setItensPorPagina] = useState(6)
  const [paginaAtual, setPaginaAtual] = useState(1)

  // -- Lista de recursos (estado local para simular CRUD) --
  const [recursos, setRecursos] = useState<Recurso[]>(RECURSOS_MOCK)

  // -- Lista de tipos disponíveis (cresce quando um "+Novo tipo" é criado) --
  const tiposIniciais = useMemo(() => {
    const doMock = RECURSOS_MOCK.map((r) => r.tipo)
    return Array.from(new Set([...TIPOS_PADRAO, ...doMock]))
  }, [])
  const [tiposDisponiveis, setTiposDisponiveis] = useState<string[]>(tiposIniciais)
  // Tipos criados pelo usuário via "+ Novo tipo" (para diferenciar dos pré-cadastrados)
  const [tiposCustomizados, setTiposCustomizados] = useState<string[]>([])

  function isTipoCustomizado(tipo: string) {
    return tiposCustomizados.includes(tipo)
  }

  // -- Modal de cadastro/edição --
  const [modalAberto, setModalAberto] = useState(false)
  const [recursoEditando, setRecursoEditando] = useState<Recurso | null>(null)

  // Campos do formulário
  const [formNome, setFormNome] = useState("")
  const [formTipo, setFormTipo] = useState("")
  const [modoNovoTipo, setModoNovoTipo] = useState(false)
  const [formNovoTipo, setFormNovoTipo] = useState("")
  const [erros, setErros] = useState<Record<string, string>>({})

  // -- Dropdown customizado do campo Tipo --
  const [tipoDropdownAberto, setTipoDropdownAberto] = useState(false)
  const tipoDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (tipoDropdownRef.current && !tipoDropdownRef.current.contains(e.target as Node)) {
        setTipoDropdownAberto(false)
      }
    }
    document.addEventListener("mousedown", aoClicarFora)
    return () => document.removeEventListener("mousedown", aoClicarFora)
  }, [])

  // -- Modal de exclusão --
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [recursoExcluir, setRecursoExcluir] = useState<Recurso | null>(null)

  // -- Modal de sucesso (cadastrar / editar / excluir) --
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState("")

  function mostrarSucesso(mensagem: string) {
    setMensagemSucesso(mensagem)
    setModalSucessoAberto(true)
    setTimeout(() => setModalSucessoAberto(false), 1800)
  }

  // -------------------------------------------------------
  // Filtragem
  // -------------------------------------------------------
  const recursosFiltrados = recursos.filter((r) => {
    const buscaOk =
      busca === "" ||
      r.nome.toLowerCase().includes(busca.toLowerCase()) ||
      r.tipo.toLowerCase().includes(busca.toLowerCase())

    const nomeOk = filtroNome === "" || r.nome.toLowerCase().includes(filtroNome.toLowerCase())
    const tipoOk = filtroTipo === "" || r.tipo.toLowerCase().includes(filtroTipo.toLowerCase())

    return buscaOk && nomeOk && tipoOk
  })

  // -------------------------------------------------------
  // Paginação
  // -------------------------------------------------------
  const totalPaginas = Math.max(1, Math.ceil(recursosFiltrados.length / itensPorPagina))
  const paginaSegura = Math.min(paginaAtual, totalPaginas)
  const inicio = (paginaSegura - 1) * itensPorPagina
  const recursosPagina = recursosFiltrados.slice(inicio, inicio + itensPorPagina)

  function irParaPagina(p: number) {
    setPaginaAtual(Math.max(1, Math.min(p, totalPaginas)))
  }

  // -------------------------------------------------------
  // Limpar filtros
  // -------------------------------------------------------
  function limparFiltros() {
    setBusca("")
    setFiltroNome("")
    setFiltroTipo("")
    setPaginaAtual(1)
  }

  // -------------------------------------------------------
  // Abrir modal de cadastro/edição
  // -------------------------------------------------------
  function abrirCadastro() {
    setRecursoEditando(null)
    setFormNome("")
    setFormTipo("")
    setModoNovoTipo(false)
    setFormNovoTipo("")
    setErros({})
    setTipoDropdownAberto(false)
    setModalAberto(true)
  }

  function abrirEdicao(recurso: Recurso) {
    setRecursoEditando(recurso)
    setFormNome(recurso.nome)
    setFormTipo(recurso.tipo)
    setModoNovoTipo(false)
    setFormNovoTipo("")
    setErros({})
    setTipoDropdownAberto(false)
    setModalAberto(true)
  }

  // -------------------------------------------------------
  // Seleção do campo Tipo (dropdown) — troca para o modo "+Novo tipo"
  // -------------------------------------------------------
  function handleSelecionarTipo(valor: string) {
    if (valor === NOVO_TIPO_VALUE) {
      setModoNovoTipo(true)
      setFormTipo("")
      setErros((p) => ({ ...p, tipo: "" }))
      setTipoDropdownAberto(false)
      return
    }
    setFormTipo(valor)
    setErros((p) => ({ ...p, tipo: "" }))
    setTipoDropdownAberto(false)
  }

  // -------------------------------------------------------
  // Excluir
  // -------------------------------------------------------
  function excluir(recurso: Recurso) {
    setRecursoExcluir(recurso)
    setModalExcluirAberto(true)
  }

  function confirmarExclusao() {
    if (!recursoExcluir) return
    setRecursos((prev) => prev.filter((r) => r.id !== recursoExcluir.id))
    setModalExcluirAberto(false)
    setRecursoExcluir(null)
    mostrarSucesso("Recurso excluído com sucesso!")
  }

  // -------------------------------------------------------
  // Salvar (cadastro ou edição)
  // -------------------------------------------------------
  function salvar() {
    const tipoFinal = modoNovoTipo ? formNovoTipo.trim() : formTipo
    const novosErros: Record<string, string> = {}

    if (!formNome.trim()) novosErros.nome = "Informe o nome do recurso."
    if (!tipoFinal) novosErros.tipo = modoNovoTipo ? "Informe o novo tipo." : "Selecione um tipo."

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setErros({})

    // Se for um tipo novo, adiciona à lista de tipos disponíveis para os próximos cadastros
    if (modoNovoTipo && !tiposDisponiveis.includes(tipoFinal)) {
      setTiposDisponiveis((prev) => [...prev, tipoFinal])
      setTiposCustomizados((prev) => [...prev, tipoFinal])
    }

    if (recursoEditando) {
      setRecursos((prev) =>
        prev.map((r) =>
          r.id === recursoEditando.id ? { ...r, nome: formNome, tipo: tipoFinal } : r
        )
      )
      setModalAberto(false)
      setPaginaAtual(1)
      mostrarSucesso("Recurso editado com sucesso!")
    } else {
      const novoId = recursos.length > 0 ? Math.max(...recursos.map((r) => r.id)) + 1 : 1
      setRecursos((prev) => [...prev, { id: novoId, nome: formNome, tipo: tipoFinal }])
      setModalAberto(false)
      setPaginaAtual(1)
      mostrarSucesso("Recurso cadastrado com sucesso!")
    }
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <style>{`
        #tipo:hover {
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
            <h1 className="text-[36px] font-bold leading-tight">Recursos</h1>
            <p className="text-sm text-muted-foreground">Gerencie os recursos da instituição</p>
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

      {/* Filtros — box com borda englobando Nome e Tipo + botão Limpar fora */}
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
            <Label className="font-semibold text-black text-base">Nome</Label>
            <Input
              placeholder="Digite aqui..."
              className="w-40 h-11 hover:border-[#0099AA] transition-colors"
              style={{
                backgroundColor: "#F2F2F2",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
              value={filtroNome}
              onChange={(e) => { setFiltroNome(e.target.value); setPaginaAtual(1) }}
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
                Nome
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
            {recursosPagina.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Nenhum recurso encontrado.
                </TableCell>
              </TableRow>
            ) : (
              recursosPagina.map((recurso, index) => (
                <TableRow
                  key={recurso.id}
                  className={`
                    ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                    border-b border-[#D9D9D9]
                    hover:bg-[#EAF6FB]
                    transition-colors
                    cursor-pointer
                  `}
                >
                  <TableCell className="py-4 pl-6">{recurso.nome}</TableCell>
                  <TableCell className="py-4">
                    <span className="inline-flex items-center gap-2">
                      {recurso.tipo}
                      {isTipoCustomizado(recurso.tipo) && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ backgroundColor: "#4471E6", color: "#FFFFFF" }}
                        >
                          Novo
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirEdicao(recurso)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#0099AA] hover:border-[#0099AA] group transition-colors"
                        style={{ color: PRIMARY }}
                      >
                        <PencilIcon className="size-4 group-hover:text-white transition-colors" />
                      </button>
                      <button
                        onClick={() => excluir(recurso)}
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
          Mostrando {recursosFiltrados.length === 0 ? 0 : inicio + 1} a{" "}
          {Math.min(inicio + itensPorPagina, recursosFiltrados.length)} de{" "}
          {recursosFiltrados.length} registros
        </div>
      </div>

      {/* Modal Cadastro / Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent
          className="!max-w-[420px] p-8 bg-white rounded-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-left text-2xl font-bold">
              {recursoEditando ? "Edição de Recurso" : "Cadastro de Recurso"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome" className="text-sm">Nome:</Label>
              <Input
                id="nome"
                placeholder="Digite aqui..."
                value={formNome}
                onChange={(e) => { setFormNome(e.target.value); setErros((p) => ({ ...p, nome: "" })) }}
                style={{ borderColor: erros.nome ? "#FF0000" : "#D1D5DB" }}
              />
              {erros.nome && <span className="text-xs text-red-500">{erros.nome}</span>}
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo" className="text-sm">Tipo{modoNovoTipo ? "" : " :"}</Label>
              {modoNovoTipo ? (
                <Input
                  id="tipo"
                  placeholder="Digite aqui..."
                  value={formNovoTipo}
                  onChange={(e) => { setFormNovoTipo(e.target.value); setErros((p) => ({ ...p, tipo: "" })) }}
                  style={{ borderColor: erros.tipo ? "#FF0000" : "#D1D5DB" }}
                  autoFocus
                />
              ) : (
                <div className="relative" ref={tipoDropdownRef}>
                  <button
                    type="button"
                    id="tipo"
                    onClick={() => setTipoDropdownAberto((v) => !v)}
                    className="w-full h-11 px-3 flex items-center justify-between rounded-md text-sm hover:border-[#0099AA] transition-colors"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: formTipo === "" ? "rgba(0, 0, 0, 0.4)" : "#000000",
                      border: `1.4px solid ${erros.tipo ? "#FF0000" : tipoDropdownAberto ? "#4471E6" : "#D1D5DB"}`,
                    }}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {formTipo === "" ? "Selecione..." : formTipo}
                      {formTipo !== "" && isTipoCustomizado(formTipo) && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ backgroundColor: "#4471E6", color: "#FFFFFF" }}
                        >
                          Novo
                        </span>
                      )}
                    </span>
                    <ChevronDownIcon className="size-4 shrink-0" style={{ color: "#666" }} />
                  </button>

                  {tipoDropdownAberto && (
                    <div
                      className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg overflow-hidden"
                      style={{ borderColor: "#D1D5DB" }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelecionarTipo(NOVO_TIPO_VALUE)}
                        className="w-full text-left px-3 py-2 text-sm border-b hover:bg-[#EAF6FB] transition-colors"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        + Novo tipo
                      </button>
                      {tiposDisponiveis.map((tipo) => (
                        <button
                          type="button"
                          key={tipo}
                          onClick={() => handleSelecionarTipo(tipo)}
                          className="w-full flex items-center justify-between text-left px-3 py-2 text-sm border-b last:border-b-0 hover:bg-[#EAF6FB] transition-colors"
                          style={{ borderColor: "#E5E7EB" }}
                        >
                          {tipo}
                          {isTipoCustomizado(tipo) && (
                            <span
                              className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                              style={{ backgroundColor: "#4471E6", color: "#FFFFFF" }}
                            >
                              Novo
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

      {/* Modal Excluir Recurso */}
      <Dialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <DialogContent
          className="!max-w-[760px] p-8 bg-white rounded-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="mb-1">
            <DialogTitle className="text-left text-2xl font-bold">
              Excluir Recurso
            </DialogTitle>
          </DialogHeader>

          <p className="text-base">
            Tem certeza que deseja excluir {recursoExcluir ? `o recurso "${recursoExcluir.nome}"` : "este Recurso"}?
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
  )
}
