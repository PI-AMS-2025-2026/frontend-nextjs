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
import { Label } from "@/components/ui/label"
import {
  ArrowLeftIcon,
  SearchIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FunnelIcon,
  CircleCheckIcon,
  CircleMinusIcon,
} from "lucide-react"
import { Professor } from "./types"
import { PROFESSORES_MOCK } from "./mock"
import {
  ITENS_POR_PAGINA_OPCOES,
  PRIMARY,
  PRIMARY_FG,
} from "./constants"

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export default function ProfessoresPage() {
  const router = useRouter()

  // -- Filtros --
  const [busca, setBusca] = useState("")
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroEmail, setFiltroEmail] = useState("")

  // -- Paginação --
  const [itensPorPagina, setItensPorPagina] = useState(6)
  const [paginaAtual, setPaginaAtual] = useState(1)

  // Lista de professores
  const [professores] = useState<Professor[]>(PROFESSORES_MOCK)

  // -------------------------------------------------------
  // Filtragem
  // -------------------------------------------------------
  const professoresFiltrados = professores.filter((p) => {
    const buscaOk =
      busca === "" ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.email.toLowerCase().includes(busca.toLowerCase())

    const nomeOk = filtroNome === "" || p.nome.toLowerCase().includes(filtroNome.toLowerCase())
    const emailOk = filtroEmail === "" || p.email.toLowerCase().includes(filtroEmail.toLowerCase())

    return buscaOk && nomeOk && emailOk
  })

  // -------------------------------------------------------
  // Paginação
  // -------------------------------------------------------
  const totalPaginas = Math.max(1, Math.ceil(professoresFiltrados.length / itensPorPagina))
  const paginaSegura = Math.min(paginaAtual, totalPaginas)
  const inicio = (paginaSegura - 1) * itensPorPagina
  const professoresPagina = professoresFiltrados.slice(inicio, inicio + itensPorPagina)

  function irParaPagina(p: number) {
    setPaginaAtual(Math.max(1, Math.min(p, totalPaginas)))
  }

  // -------------------------------------------------------
  // Limpar filtros
  // -------------------------------------------------------
  function limparFiltros() {
    setBusca("")
    setFiltroNome("")
    setFiltroEmail("")
    setPaginaAtual(1)
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
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
            <h1 className="text-[36px] font-bold leading-tight">Professores</h1>
            <p className="text-sm text-muted-foreground">Gerencie os professores da instituição</p>
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
        </div>
      </div>

      {/* Filtros — box com borda englobando Nome e E-mail + botão Limpar fora */}
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
              placeholder="Filtrar por nome"
              className="w-56 h-11 hover:border-[#0099AA] transition-colors"
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
            <Label className="font-semibold text-black text-base">E-mail</Label>
            <Input
              placeholder="Filtrar por e-mail"
              className="w-56 h-11 hover:border-[#0099AA] transition-colors"
              style={{
                backgroundColor: "#F2F2F2",
                borderColor: "rgba(23, 38, 77, 0.15)",
                borderWidth: "1.4px"
              }}
              value={filtroEmail}
              onChange={(e) => { setFiltroEmail(e.target.value); setPaginaAtual(1) }}
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
                E-mail
              </TableHead>
              <TableHead className="text-base font-bold py-4 rounded-tr-lg" style={{ color: PRIMARY_FG }}>
                <span className="flex items-center gap-2">
                  Status
                  <FunnelIcon className="size-4" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professoresPagina.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Nenhum professor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              professoresPagina.map((professor, index) => (
                <TableRow
                  key={professor.id}
                  className={`
                    ${index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                    border-b border-[#D9D9D9]
                    hover:bg-[#EAF6FB]
                    transition-colors
                    cursor-pointer
                  `}
                >
                  <TableCell className="py-4 pl-6">{professor.nome}</TableCell>
                  <TableCell className="py-4">{professor.email}</TableCell>
                  <TableCell className="py-4">
                    {professor.status === "Ativo" ? (
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
          Mostrando {professoresFiltrados.length === 0 ? 0 : inicio + 1} a{" "}
          {Math.min(inicio + itensPorPagina, professoresFiltrados.length)} de{" "}
          {professoresFiltrados.length} registros
        </div>
      </div>
    </div>
  )
}
