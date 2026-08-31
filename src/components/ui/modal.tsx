"use client"

import * as React from "react"
import { Check, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface ModalProps {
    open: boolean
    onClose: () => void
    children?: React.ReactNode
    className?: string

    // Modal de confirmação
    type?: "success" | "error"
    message?: string
}

function Modal({
    open,
    onClose,
    children,
    className,
    type,
    message,
}: ModalProps) {
    if (!open) return null

    const isConfirmation = type !== undefined && message !== undefined

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={onClose}
        >
            <div
                onMouseDown={(event) => event.stopPropagation()}
                className={cn(
                    "relative w-full max-w-md overflow-hidden rounded-[20px] bg-white shadow-xl",
                    "animate-in fade-in-0 zoom-in-95 duration-200",
                    className
                )}
            >
                {/* Pattern */}
                <img
                    src="public/images/pattern-cps.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-10"
                />

                {/* Botão fechar */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar modal"
                    className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-white text-[#17264D] shadow-sm transition-colors hover:bg-[#F2F2F2]"
                >
                    <X className="size-5" />
                </button>

                {/* Conteúdo */}
                <div
                    className={cn(
                        "relative z-10 p-6 text-[#17264D]",
                        isConfirmation &&
                        "flex flex-col items-center justify-center text-center"
                    )}
                >
                    {isConfirmation ? (
                        <>
                            {/* Ícone */}
                            {/* Ícone */}
                            <div
                                className={cn(
                                    "mb-4 flex size-16 items-center justify-center rounded-full border-2",
                                    type === "success"
                                        ? "border-[#5E8BFF] text-[#5E8BFF]"
                                        : "border-[#BA1A1A] text-[#BA1A1A]"
                                )}
                            >
                                {type === "success" ? (
                                    <Check className="size-9" strokeWidth={2.5} />
                                ) : (
                                    <X className="size-9" strokeWidth={2.5} />
                                )}
                            </div>

                            {/* Mensagem */}
                            <p className="text-lg font-semibold">
                                {message}
                            </p>
                        </>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    )
}

export { Modal }