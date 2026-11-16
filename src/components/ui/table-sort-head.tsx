"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TableSortHeadProps {
    label: string;
    /** ["Menor para maior", "Maior para menor"] ou ["A-Z", "Z-A"] */
    labels: [string, string];
    /** direção atual, ou null se esta coluna não está ordenando */
    direcao: "asc" | "desc" | null;
    onSort: (direcao: "asc" | "desc") => void;
}

export function TableSortHead({ label, labels, direcao, onSort }: TableSortHeadProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    return (
        <div ref={ref} className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 text-[16px] font-semibold whitespace-nowrap text-white outline-none"
            >
                {label}
                {direcao === "asc" ? (
                    <ChevronUp className="size-4" />
                ) : (
                    <ChevronDown className={`size-4 ${direcao ? "" : "opacity-60"}`} />
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full z-[9999] mt-2 min-w-[190px] overflow-hidden rounded-lg border border-[#D0D4D8] bg-white py-1 shadow-lg">
                    {(["asc", "desc"] as const).map((dir, i) => (
                        <button
                            key={dir}
                            type="button"
                            onClick={() => {
                                onSort(dir);
                                setOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm font-normal transition-colors hover:bg-[#F2F2F2] ${direcao === dir ? "bg-[#F2F2F2] text-[#0099AA]" : "text-[#17264D]"
                                }`}
                        >
                            {labels[i]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}