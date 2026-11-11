"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { recursosService } from "@/services/recursos.service";
import { recursoSalaService } from "@/services/recurso-sala.service";
import type { Id, RecursoResponse, SalaResponse, TipoSalaResponse } from "@/types/api";

export interface DadosSala {
    codigo: string;
    capacidade: number;
    tipoSalaId?: Id;
    novoTipo?: string;
    recursos: { recursoId: Id; quantidade: number }[];
}

interface SalaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    sala?: SalaResponse | null;
    tiposSala: TipoSalaResponse[];
    salvando?: boolean;
    erroExterno?: string | null;
    onConfirm: (dados: DadosSala) => void;
}

export function SalaFormModal({
    open,
    onClose,
    mode,
    sala,
    tiposSala,
    salvando = false,
    erroExterno,
    onConfirm,
}: SalaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-xl overflow-visible">
            <SalaFormConteudo
                key={sala?.id ?? "novo"}
                open={open}
                mode={mode}
                sala={sala}
                tiposSala={tiposSala}
                salvando={salvando}
                erroExterno={erroExterno}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function SalaFormConteudo({
    open,
    mode,
    sala,
    tiposSala,
    salvando,
    erroExterno,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    mode: "cadastrar" | "editar";
    sala?: SalaResponse | null;
    tiposSala: TipoSalaResponse[];
    salvando: boolean;
    erroExterno?: string | null;
    onCancel: () => void;
    onConfirm: (dados: DadosSala) => void;
}) {
    const [codigo, setCodigo] = React.useState(sala?.codigo ?? "");
    const [capacidade, setCapacidade] = React.useState(sala?.capacidade ?? 0);
    const [tipoSalaId, setTipoSalaId] = React.useState<string>(
        sala ? String(sala.tipoSala.id) : ""
    );
    const [modoNovoTipo, setModoNovoTipo] = React.useState(false);
    const [novoTipo, setNovoTipo] = React.useState("");
    const [dropdownAberto, setDropdownAberto] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [recursosSelecionados, setRecursosSelecionados] = React.useState<Record<number, number>>({});
    const [recursosDisponiveis, setRecursosDisponiveis] = React.useState<RecursoResponse[]>([]);
    const [carregandoRecursos, setCarregandoRecursos] = React.useState(false);
    const [erroRecursos, setErroRecursos] = React.useState<string | null>(null);

    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Sala" : "Edição de Sala";

    React.useEffect(() => {
        function aoClicarFora(evento: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(evento.target as Node)) {
                setDropdownAberto(false);
            }
        }
        document.addEventListener("mousedown", aoClicarFora);
        return () => document.removeEventListener("mousedown", aoClicarFora);
    }, []);

    React.useEffect(() => {
        if (!open) return;

        let cancelado = false;
        setCarregandoRecursos(true);
        setErroRecursos(null);

        const carregarRecursos = async () => {
            try {
                const paginaRecursos = await recursosService.listar({ page: 0, size: 1000 });
                if (cancelado) return;
                setRecursosDisponiveis(paginaRecursos.content);

                if (sala) {
                    const vinculados = await recursoSalaService.listar({
                        salaId: sala.id,
                        page: 0,
                        size: 1000,
                    });
                    if (cancelado) return;
                    setRecursosSelecionados(Object.fromEntries(
                        vinculados.content.map(({ recurso, quantidade }) => [recurso.id, quantidade]),
                    ));
                } else {
                    setRecursosSelecionados({});
                }
            } catch (e) {
                if (!cancelado) {
                    setErroRecursos(e instanceof Error ? e.message : "Não foi possível carregar os recursos.");
                }
            } finally {
                if (!cancelado) setCarregandoRecursos(false);
            }
        };

        void carregarRecursos();
        return () => {
            cancelado = true;
        };
    }, [open, sala]);

    function handleConfirmar() {
        if (!codigo.trim()) return setErro("Informe o código da sala.");
        if (capacidade <= 0) return setErro("A capacidade deve ser maior que zero.");
        const tipoFinal = modoNovoTipo ? novoTipo.trim() : tipoSalaId;
        if (!tipoFinal) return setErro(modoNovoTipo ? "Informe o novo tipo de sala." : "Selecione o tipo de sala.");

        onConfirm({
            codigo: codigo.trim(),
            capacidade,
            ...(modoNovoTipo ? { novoTipo: tipoFinal } : { tipoSalaId: Number(tipoFinal) }),
            recursos: Object.entries(recursosSelecionados).map(([recursoId, quantidade]) => ({
                recursoId: Number(recursoId),
                quantidade,
            })),
        });
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Código da Sala:"
                    showLabel
                    value={codigo}
                    onChange={(e) => {
                        setCodigo(e.target.value);
                        setErro("");
                    }}
                    placeholder="Digite aqui..."
                />

                <Input
                    label="Capacidade:"
                    showLabel
                    type="number"
                    min={0}
                    value={capacidade}
                    onChange={(e) => {
                        setCapacidade(Number(e.target.value));
                        setErro("");
                    }}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Tipo de Sala:</label>
                    {modoNovoTipo ? (
                        <Input
                            value={novoTipo}
                            onChange={(evento) => {
                                setNovoTipo(evento.target.value);
                                setErro("");
                            }}
                            placeholder="Digite o novo tipo..."
                            autoFocus
                        />
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownAberto((aberto) => !aberto)}
                                className="flex h-11 w-full items-center justify-between rounded-md border border-[#C8CDD2] px-3 text-sm text-[#17264D] transition-colors hover:border-[#0099AA]"
                            >
                                <span className="truncate">
                                    {tipoSalaId === ""
                                        ? "Selecione..."
                                        : tiposSala.find((tipo) => String(tipo.id) === tipoSalaId)?.nome}
                                </span>
                                <ChevronDown className="size-4 shrink-0 text-[#17264D]/60" />
                            </button>
                            {dropdownAberto && (
                                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-[#C8CDD2] bg-white shadow-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModoNovoTipo(true);
                                            setTipoSalaId("");
                                            setDropdownAberto(false);
                                            setErro("");
                                        }}
                                        className="w-full border-b border-[#C8CDD2] px-3 py-2 text-left text-sm text-[#17264D] transition-colors hover:bg-[#F2F2F2]"
                                    >
                                        + Novo tipo
                                    </button>
                                    {tiposSala.map((tipo) => (
                                        <button
                                            type="button"
                                            key={tipo.id}
                                            onClick={() => {
                                                setTipoSalaId(String(tipo.id));
                                                setDropdownAberto(false);
                                                setErro("");
                                            }}
                                            className="flex w-full items-center justify-between border-b border-[#C8CDD2] px-3 py-2 text-left text-sm text-[#17264D] transition-colors last:border-b-0 hover:bg-[#F2F2F2]"
                                        >
                                            {tipo.nome}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {modoNovoTipo && (
                        <button
                            type="button"
                            onClick={() => {
                                setModoNovoTipo(false);
                                setNovoTipo("");
                                setErro("");
                            }}
                            className="self-start text-xs font-medium text-[#0099AA] underline underline-offset-2"
                        >
                            Selecionar tipo existente
                        </button>
                    )}
                </div>


                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#17264D]">Recursos:</label>
                    <div className="max-h-48 overflow-y-auto rounded-[10px] border border-[#C8CDD2] bg-white">
                        {carregandoRecursos ? (
                            <p className="p-3 text-sm text-[#17264D]/70">Carregando recursos...</p>
                        ) : recursosDisponiveis.length === 0 ? (
                            <p className="p-3 text-sm text-[#17264D]/70">Nenhum recurso cadastrado.</p>
                        ) : (
                            recursosDisponiveis.map((recurso) => {
                                const quantidade = recursosSelecionados[recurso.id];
                                return (
                                    <div key={recurso.id} className="flex items-center gap-3 border-b border-[#E5E7EB] p-3 last:border-b-0">
                                        <input
                                            id={`recurso-sala-${recurso.id}`}
                                            type="checkbox"
                                            checked={quantidade !== undefined}
                                            onChange={(event) => {
                                                setRecursosSelecionados((atuais) => {
                                                    if (event.target.checked) {
                                                        return { ...atuais, [recurso.id]: 1 };
                                                    }
                                                    const restantes = { ...atuais };
                                                    delete restantes[recurso.id];
                                                    return restantes;
                                                });
                                                setErro("");
                                            }}
                                            className="size-4 accent-[#0099AA]"
                                        />
                                        <label htmlFor={`recurso-sala-${recurso.id}`} className="min-w-0 flex-1 cursor-pointer text-sm text-[#17264D]">
                                            {recurso.nome}
                                        </label>
                                        {quantidade !== undefined && (
                                            <input
                                                aria-label={`Quantidade de ${recurso.nome}`}
                                                type="number"
                                                min={1}
                                                value={quantidade}
                                                onChange={(event) => {
                                                    const valor = Math.max(1, Number(event.target.value) || 1);
                                                    setRecursosSelecionados((atuais) => ({ ...atuais, [recurso.id]: valor }));
                                                }}
                                                className="h-9 w-20 rounded-lg border border-[#C8CDD2] px-2 text-sm text-[#17264D] outline-none focus:border-[#0099AA]"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {erroRecursos && <p className="text-xs text-[#BA1A1A]">{erroRecursos}</p>}
                </div>
            </div>

           

            {(erro || erroExterno) && (
                <p className="text-sm text-[#BA1A1A]">{erro || erroExterno}</p>
            )}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel} disabled={salvando}>
                    Cancelar
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={handleConfirmar}
                    disabled={salvando || carregandoRecursos || Boolean(erroRecursos)}
                >
                    {salvando ? "Salvando..." : "Confirmar"}
                </Button>
            </div>
        </div>
    );
}
