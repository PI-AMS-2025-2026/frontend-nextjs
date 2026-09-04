"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface FilterHeadOption {
    label: string;
    value: string;
    cor?: string;
}

interface TableFilterHeadProps {
    label: string;
    options: FilterHeadOption[];
    value: string;
    onChange: (value: string) => void;
    /** rótulo da opção "sem filtro" */
    allLabel?: string;
}

export function TableFilterHead({
    label,
    options,
    value,
    onChange,
    allLabel = "Todos",
}: TableFilterHeadProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    // fecha ao clicar fora
    React.useEffect(() => {
        if (!open) return;
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    const ativo = value !== "";

    return (
        <div ref={ref} className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 text-[16px] font-semibold whitespace-nowrap text-white outline-none"
            >
                {label}
                <ChevronDown
                    className={`size-4 transition-transform ${open ? "rotate-180" : ""} ${ativo ? "" : "opacity-60"}`}
                />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-[9999] mt-2 min-w-[170px] overflow-hidden rounded-lg border border-[#D0D4D8] bg-white py-1 shadow-lg">
                    <OpcaoBotao
                        label={allLabel}
                        selecionado={value === ""}
                        onClick={() => {
                            onChange("");
                            setOpen(false);
                        }}
                    />
                    {options.map((op) => (
                        <OpcaoBotao
                            key={op.value}
                            label={op.label}
                            cor={op.cor}
                            selecionado={value === op.value}
                            onClick={() => {
                                onChange(op.value);
                                setOpen(false);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function OpcaoBotao({
    label,
    cor,
    selecionado,
    onClick,
}: {
    label: string;
    cor?: string;
    selecionado: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-normal transition-colors hover:bg-[#F2F2F2] ${selecionado ? "bg-[#F2F2F2] text-[#0099AA]" : "text-[#17264D]"
                }`}
        >
            {cor && (
                <span className="size-3.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
            )}
            {label}
        </button>
    );
}