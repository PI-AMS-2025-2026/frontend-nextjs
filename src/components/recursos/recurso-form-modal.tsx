"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { type Recurso } from "@/lib/recursos";

export const NOVO_TIPO_VALUE = "__novo__";

interface DadosRecurso {
    nome: string;
    tipo: string;
}

interface RecursoFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    recurso?: Recurso | null;
    tiposDisponiveis: string[];
    isTipoCustomizado: (tipo: string) => boolean;
    onConfirm: (dados: DadosRecurso) => void;
}

export function RecursoFormModal({
    open,
    onClose,
    mode,
    recurso,
    tiposDisponiveis,
    isTipoCustomizado,
    onConfirm,
}: RecursoFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl">
            <RecursoFormConteudo
                key={recurso?.id ?? "novo"}
                mode={mode}
                recurso={recurso}
                tiposDisponiveis={tiposDisponiveis}
                isTipoCustomizado={isTipoCustomizado}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function RecursoFormConteudo({
    mode,
    recurso,
    tiposDisponiveis,
    isTipoCustomizado,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    recurso?: Recurso | null;
    tiposDisponiveis: string[];
    isTipoCustomizado: (tipo: string) => boolean;
    onCancel: () => void;
    onConfirm: (dados: DadosRecurso) => void;
}) {
    const [nome, setNome] = React.useState(recurso?.nome ?? "");
    const [tipo, setTipo] = React.useState(recurso?.tipo ?? "");
    const [modoNovoTipo, setModoNovoTipo] = React.useState(false);
    const [novoTipo, setNovoTipo] = React.useState("");
    const [erro, setErro] = React.useState<{ nome?: string; tipo?: string }>({});
    const [dropdownAberto, setDropdownAberto] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const titulo = mode === "cadastrar" ? "Cadastro de Recurso" : "Edição de Recurso";

    React.useEffect(() => {
        function aoClicarFora(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownAberto(false);
            }
        }
        document.addEventListener("mousedown", aoClicarFora);
        return () => document.removeEventListener("mousedown", aoClicarFora);
    }, []);

    function handleSelecionarTipo(valor: string) {
        if (valor === NOVO_TIPO_VALUE) {
            setModoNovoTipo(true);
            setTipo("");
            setErro((p) => ({ ...p, tipo: undefined }));
            setDropdownAberto(false);
            return;
        }
        setTipo(valor);
        setErro((p) => ({ ...p, tipo: undefined }));
        setDropdownAberto(false);
    }

    function handleConfirmar() {
        const tipoFinal = modoNovoTipo ? novoTipo.trim() : tipo;
        const novoErro: { nome?: string; tipo?: string } = {};

        if (!nome.trim()) novoErro.nome = "Informe o nome do recurso.";
        if (!tipoFinal) novoErro.tipo = modoNovoTipo ? "Informe o novo tipo." : "Selecione um tipo.";

        if (Object.keys(novoErro).length > 0) {
            setErro(novoErro);
            return;
        }

        onConfirm({ nome: nome.trim(), tipo: tipoFinal });
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <div className="flex flex-col gap-4">
                <Input
                    label="Nome:"
                    showLabel
                    value={nome}
                    onChange={(e) => {
                        setNome(e.target.value);
                        setErro((p) => ({ ...p, nome: undefined }));
                    }}
                    placeholder="Digite aqui..."
                />
                {erro.nome && <p className="text-sm text-[#BA1A1A]">{erro.nome}</p>}

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Tipo:</label>

                    {modoNovoTipo ? (
                        <Input
                            value={novoTipo}
                            onChange={(e) => {
                                setNovoTipo(e.target.value);
                                setErro((p) => ({ ...p, tipo: undefined }));
                            }}
                            placeholder="Digite aqui..."
                            autoFocus
                        />
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownAberto((v) => !v)}
                                className="flex h-11 w-full items-center justify-between rounded-md border border-[#C8CDD2] px-3 text-sm text-[#17264D] transition-colors hover:border-[#0099AA]"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    {tipo === "" ? "Selecione..." : tipo}
                                    {tipo !== "" && isTipoCustomizado(tipo) && (
                                        <span className="rounded-full bg-[#0099AA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                            Novo
                                        </span>
                                    )}
                                </span>
                                <ChevronDown className="size-4 shrink-0 text-[#17264D]/60" />
                            </button>

                            {dropdownAberto && (
                                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-[#C8CDD2] bg-white shadow-lg">
                                    <button
                                        type="button"
                                        onClick={() => handleSelecionarTipo(NOVO_TIPO_VALUE)}
                                        className="w-full border-b border-[#C8CDD2] px-3 py-2 text-left text-sm text-[#17264D] transition-colors hover:bg-[#F2F2F2]"
                                    >
                                        + Novo tipo
                                    </button>
                                    {tiposDisponiveis.map((t) => (
                                        <button
                                            type="button"
                                            key={t}
                                            onClick={() => handleSelecionarTipo(t)}
                                            className="flex w-full items-center justify-between border-b border-[#C8CDD2] px-3 py-2 text-left text-sm text-[#17264D] transition-colors last:border-b-0 hover:bg-[#F2F2F2]"
                                        >
                                            {t}
                                            {isTipoCustomizado(t) && (
                                                <span className="ml-2 rounded-full bg-[#0099AA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                    Novo
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {erro.tipo && <p className="text-sm text-[#BA1A1A]">{erro.tipo}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button variant="secondary" size="small" onClick={handleConfirmar}>
                    Confirmar
                </Button>
            </div>
        </div>
    );
}
