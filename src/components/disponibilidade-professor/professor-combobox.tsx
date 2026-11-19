"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ProfessorResponse } from "@/types/api";

interface ProfessorComboboxProps {
    professores: ProfessorResponse[];
    selecionado: ProfessorResponse | null;
    onSelect: (professor: ProfessorResponse | null) => void;
    erro: string;
    disabled: boolean;
}

function normalizarBusca(texto: string) {
    return texto.trim().normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function ProfessorCombobox({
    professores,
    selecionado,
    onSelect,
    erro,
    disabled,
}: ProfessorComboboxProps) {
    const id = React.useId();
    const listaId = `${id}-opcoes`;
    const inputId = `${id}-professor`;
    const erroId = `${id}-erro`;
    const [busca, setBusca] = React.useState("");
    const [aberto, setAberto] = React.useState(false);
    const [ativoId, setAtivoId] = React.useState<number | null>(null);
    const opcaoAtivaRef = React.useRef<HTMLLIElement>(null);

    const termo = normalizarBusca(busca);
    const opcoes = termo
        ? professores.filter((professor) => normalizarBusca(professor.nome).includes(termo))
        : professores;
    const indiceAtivo = opcoes.findIndex((professor) => professor.id === ativoId);

    React.useEffect(() => {
        if (aberto && indiceAtivo >= 0) {
            opcaoAtivaRef.current?.scrollIntoView?.({ block: "nearest" });
        }
    }, [aberto, indiceAtivo]);

    function fechar() {
        setAberto(false);
        setAtivoId(null);
    }

    function selecionar(professor: ProfessorResponse) {
        setBusca("");
        onSelect(professor);
        fechar();
    }

    function navegar(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape" && aberto) {
            event.preventDefault();
            event.stopPropagation();
            fechar();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setAberto(true);
            const ultimo = opcoes.length - 1;
            const topo = !aberto || indiceAtivo < 0;
            const indice = event.key === "ArrowDown"
                ? (topo ? 0 : Math.min(indiceAtivo + 1, ultimo))
                : (topo ? ultimo : Math.max(indiceAtivo - 1, 0));
            setAtivoId(opcoes[indice]?.id ?? null);
        } else if (event.key === "Enter" && aberto && indiceAtivo >= 0) {
            event.preventDefault();
            selecionar(opcoes[indiceAtivo]);
        }
    }

    return (
        <div className="min-w-0">
            <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[#17264D]">
                Professor
            </label>
            <div className="relative">
                <Input
                    id={inputId}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={aberto}
                    aria-controls={aberto ? listaId : undefined}
                    aria-activedescendant={aberto && indiceAtivo >= 0 ? `${listaId}-${ativoId}` : undefined}
                    aria-invalid={!!erro}
                    aria-describedby={erro ? erroId : undefined}
                    autoComplete="off"
                    disabled={disabled}
                    height="38px"
                    className={`rounded-lg pr-10 text-sm ${aberto ? "border-[#4471E6]" : ""}`}
                    placeholder="Busque pelo nome"
                    value={selecionado?.nome ?? busca}
                    onFocus={() => setAberto(true)}
                    onClick={() => setAberto(true)}
                    onBlur={fechar}
                    onKeyDown={navegar}
                    onChange={(event) => {
                        setBusca(event.target.value);
                        onSelect(null);
                        setAtivoId(null);
                        setAberto(true);
                    }}
                />
                <ChevronDown
                    aria-hidden="true"
                    className={`pointer-events-none absolute right-3 top-[11px] size-4 text-[#17264D] transition-transform ${aberto ? "rotate-180" : ""}`}
                />
                {aberto && (
                    <div className="absolute top-full z-30 mt-1 w-full rounded-lg border bg-background shadow-md">
                        <ul
                            id={listaId}
                            role="listbox"
                            aria-label="Professores"
                            className="max-h-40 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8CDD2]"
                        >
                            {opcoes.map((professor) => (
                                <li
                                    key={professor.id}
                                    id={`${listaId}-${professor.id}`}
                                    ref={ativoId === professor.id ? opcaoAtivaRef : undefined}
                                    role="option"
                                    aria-selected={selecionado?.id === professor.id}
                                    className={`cursor-pointer wrap-anywhere rounded-lg border-b border-[#D9D9D9] px-3 py-2 text-sm hover:bg-[#F2F2F2] last:border-b-0 ${ativoId === professor.id ? "bg-[#F2F2F2]" : ""}`}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => selecionar(professor)}
                                >
                                    <span className="block">{professor.nome}</span>
                                    <span className="block text-xs text-slate-600">{professor.email}</span>
                                </li>
                            ))}
                        </ul>
                        {!opcoes.length && (
                            <p role="status" className="px-3 py-2 text-sm text-slate-600">
                                Nenhum professor encontrado.
                            </p>
                        )}
                    </div>
                )}
            </div>
            {erro && <p id={erroId} role="alert" className="mt-1 text-sm text-[#BA1A1A]">{erro}</p>}
        </div>
    );
}
