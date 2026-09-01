"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { Recurso } from "./types"
import { RECURSOS_MOCK } from "./mock"
import {
  ITENS_POR_PAGINA_OPCOES,
  PRIMARY,
  PRIMARY_FG,
  TIPOS_PADRAO,
} from "./constants"
import { RecursosTable } from "./recursos-table"
import {
  RecursoFormDialog,
  ExcluirRecursoDialog,
  SucessoDialog,
  NOVO_TIPO_VALUE,
} from "./recurso-dialogs"

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
  // Campos do formulário (onChange já limpa o erro correspondente)
  // -------------------------------------------------------
  function handleFormNomeChange(valor: string) {
    setFormNome(valor)
    setErros((p) => ({ ...p, nome: "" }))
  }

  function handleFormNovoTipoChange(valor: string) {
    setFormNovoTipo(valor)
    setErros((p) => ({ ...p, tipo: "" }))
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
      <RecursosTable
        recursos={recursosPagina}
        isTipoCustomizado={isTipoCustomizado}
        onEditar={abrirEdicao}
        onExcluir={excluir}
      />

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
      <RecursoFormDialog
        open={modalAberto}
        onOpenChange={setModalAberto}
        recursoEditando={recursoEditando}
        formNome={formNome}
        onFormNomeChange={handleFormNomeChange}
        formTipo={formTipo}
        modoNovoTipo={modoNovoTipo}
        formNovoTipo={formNovoTipo}
        onFormNovoTipoChange={handleFormNovoTipoChange}
        erros={erros}
        tipoDropdownAberto={tipoDropdownAberto}
        onToggleTipoDropdown={() => setTipoDropdownAberto((v) => !v)}
        tipoDropdownRef={tipoDropdownRef as React.RefObject<HTMLDivElement>}
        tiposDisponiveis={tiposDisponiveis}
        isTipoCustomizado={isTipoCustomizado}
        onSelecionarTipo={handleSelecionarTipo}
        onCancelar={() => setModalAberto(false)}
        onSalvar={salvar}
      />

      {/* Modal Excluir Recurso */}
      <ExcluirRecursoDialog
        open={modalExcluirAberto}
        onOpenChange={setModalExcluirAberto}
        recurso={recursoExcluir}
        onCancelar={() => setModalExcluirAberto(false)}
        onConfirmar={confirmarExclusao}
      />

      {/* Modal Sucesso (cadastrar / editar / excluir) */}
      <SucessoDialog
        open={modalSucessoAberto}
        onOpenChange={setModalSucessoAberto}
        mensagem={mensagemSucesso}
      />
    </div>
  )
}
