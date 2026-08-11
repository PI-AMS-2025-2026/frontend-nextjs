"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TableFiltersProps {
    onClear?: () => void
    className?: string
}

function TableFilters({
    onClear,
    className,
}: TableFiltersProps) {
    const [codigo, setCodigo] = React.useState("")
    const [capacidade, setCapacidade] = React.useState("")
    const [tipo, setTipo] = React.useState("")

    const handleClear = () => {
        setCodigo("")
        setCapacidade("")
        setTipo("")
        onClear?.()
    }

    return (
        <div
            className={cn(
                "flex w-full items-end gap-[18px] rounded-[5px] border border-[#C8DDE2] bg-[#F1FBFD] px-4 py-2",
                className
            )}
        >
            {/* Código */}
            <div className="flex w-[173px] flex-col gap-1">
                <label
                    htmlFor="filter-codigo"
                    className="text-[14px] font-normal text-[#171717]"
                >
                    Código
                </label>

                <input
                    id="filter-codigo"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Digite aqui..."
                    className="h-[32px] w-full rounded-[10px] border border-[#D0D4D8] bg-[#F1F1F1] px-3 text-[14px] text-[#17264D] outline-none placeholder:text-[#A8A8A8] focus:border-[#4471E6]"
                />
            </div>

            {/* Capacidade */}
            <div className="flex w-[173px] flex-col gap-1">
                <label
                    htmlFor="filter-capacidade"
                    className="text-[14px] font-normal text-[#171717]"
                >
                    Capacidade
                </label>

                <input
                    id="filter-capacidade"
                    type="text"
                    value={capacidade}
                    onChange={(e) => setCapacidade(e.target.value)}
                    placeholder="Digite aqui..."
                    className="h-[32px] w-full rounded-[10px] border border-[#D0D4D8] bg-[#F1F1F1] px-3 text-[14px] text-[#17264D] outline-none placeholder:text-[#A8A8A8] focus:border-[#4471E6]"
                />
            </div>

            {/* Tipo */}
            <div className="flex w-[173px] flex-col gap-1">
                <label
                    htmlFor="filter-tipo"
                    className="text-[14px] font-normal text-[#171717]"
                >
                    Tipo
                </label>

                <input
                    id="filter-tipo"
                    type="text"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    placeholder="Digite aqui..."
                    className="h-[32px] w-full rounded-[10px] border border-[#D0D4D8] bg-[#F1F1F1] px-3 text-[14px] text-[#17264D] outline-none placeholder:text-[#A8A8A8] focus:border-[#4471E6]"
                />
            </div>

            {/* Limpar filtros */}
            <button
                type="button"
                onClick={handleClear}
                className="ml-auto h-[32px] rounded-[10px] bg-[#2AAFC0] px-3 text-[14px] font-medium text-white transition-colors hover:bg-[#0099AA]"
            >
                Limpar filtros
            </button>
        </div>
    )
}

export { TableFilters }