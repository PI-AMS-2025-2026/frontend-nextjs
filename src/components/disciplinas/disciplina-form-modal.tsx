"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    CORES_DISCIPLINA,
    type Disciplina,
    type Modalidade,
    type TipoDisciplina,
    type TipoSala,
} from "@/lib/disciplinas";

interface DadosDisciplina {
    nome: string;
    cargaHoraria: number;
    tipo: TipoDisciplina;
    periodo: string;
    modalidade: Modalidade;
    codigo: string;
    cor: string;
    cursoVinculado: string;
    tipoSala: string;
}

interface FormValues {
    nome: string;
    cargaHoraria: number;
    tipo: TipoDisciplina | "";
    periodo: string;
    modalidade: Modalidade | "";
    codigo: string;
    cor: string;
    cursoVinculado: string;
    tipoSala: string;
}

interface DisciplinaFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: "cadastrar" | "editar";
    disciplina?: Disciplina | null;
    cursos: string[];
    tiposSala: string[];
    onConfirm: (dados: DadosDisciplina) => void;
}

export function DisciplinaFormModal({
    open,
    onClose,
    mode,
    disciplina,
    cursos,
    tiposSala,
    onConfirm,
}: DisciplinaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-2xl overflow-visible">
            <DisciplinaFormConteudo
                key={disciplina?.id ?? "novo"}
                mode={mode}
                disciplina={disciplina}
                cursos={cursos}
                tiposSala={tiposSala}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function DisciplinaFormConteudo({
    mode,
    disciplina,
    cursos,
    tiposSala,
    onCancel,
    onConfirm,
}: {
    mode: "cadastrar" | "editar";
    disciplina?: Disciplina | null;
    cursos: string[];
    tiposSala: string[];
    onCancel: () => void;
    onConfirm: (dados: DadosDisciplina) => void;
}) {
    const [valores, setValores] = React.useState<FormValues>({
        nome: disciplina?.nome ?? "",
        cargaHoraria: disciplina?.cargaHoraria ?? 0,
        tipo: disciplina?.tipo ?? "",
        periodo: disciplina?.periodo ?? "",
        modalidade: disciplina?.modalidade ?? "",
        codigo: disciplina?.codigo ?? "",
        cor: disciplina?.cor ?? CORES_DISCIPLINA[0].hex,
        cursoVinculado: disciplina?.cursoVinculado ?? "",
        tipoSala: disciplina?.tipoSala ?? "",
    });
    const [erro, setErro] = React.useState("");
    const [corAberta, setCorAberta] = React.useState(false);

    const titulo = mode === "cadastrar" ? "Cadastro de disciplina" : "Edição de disciplina";

    function atualizar<K extends keyof FormValues>(campo: K, valor: FormValues[K]) {
        setValores((prev) => ({ ...prev, [campo]: valor }));
        setErro("");
    }

    function handleConfirmar() {
        if (
            !valores.nome.trim() ||
            !valores.tipo ||
            !valores.periodo ||
            !valores.modalidade ||
            !valores.cursoVinculado ||
            !valores.tipoSala
        ) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }
        if (!/^\d+$/.test(valores.periodo) || Number(valores.periodo) < 1) {
            setErro("O período deve ser um número inteiro maior que zero.");
            return;
        }
        if (valores.codigo.trim().length < 3 || valores.codigo.trim().length > 20) {
            setErro("O código deve ter entre 3 e 20 caracteres.");
            return;
        }

        onConfirm({
            ...valores,
            nome: valores.nome.trim(),
            tipo: valores.tipo as TipoDisciplina,
            periodo: valores.periodo,
            modalidade: valores.modalidade as Modalidade,
            tipoSala: valores.tipoSala as TipoSala,
        });
    }

    const corSelecionada =
        CORES_DISCIPLINA.find((c) => c.hex === valores.cor) ?? CORES_DISCIPLINA[0];

    return (
        <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">{titulo}</h2>

            <Input
                label="Nome"
                showLabel
                value={valores.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                placeholder="Digite aqui..."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    label="Carga horária"
                    showLabel
                    type="number"
                    min={20}
                    max={160}
                    value={valores.cargaHoraria}
                    onChange={(e) => atualizar("cargaHoraria", Number(e.target.value))}
                />

                <Input
                    label="Código da disciplina"
                    showLabel
                    type="text"
                    value={valores.codigo}
                    onChange={(e) => atualizar("codigo", e.target.value)}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">
                        Tipo da disciplina
                    </label>
                    <Select
                        options={[
                            { label: "Teórica", value: "Teórica" },
                            { label: "Prática", value: "Prática" },
                            { label: "50/50", value: "50/50" },
                        ]}
                        value={valores.tipo}
                        onChange={(v) => atualizar("tipo", v as TipoDisciplina)}
                        placeholder="Selecione..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Período</label>
                    <Input
                        type="number"
                        min={1}
                        value={valores.periodo}
                        onChange={(e) => atualizar("periodo", e.target.value)}
                        placeholder="Ex: 1"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Modalidade</label>
                    <Select
                        options={[
                            { label: "Presencial", value: "Presencial" },
                            { label: "EAD", value: "EAD" },
                        ]}
                        value={valores.modalidade}
                        onChange={(v) => atualizar("modalidade", v as Modalidade)}
                        placeholder="Selecione..."
                    />
                </div>

                {/* seletor de cor feito na mão — o Select novo só mostra texto,
            e aqui precisa da bolinha colorida */}
                <div className="relative flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Cor</label>
                    <button
                        type="button"
                        onClick={() => setCorAberta((v) => !v)}
                        className={`flex w-full items-center justify-between rounded-lg border bg-[#F2F2F2] px-3 py-2 text-sm transition-colors duration-200 ${corAberta ? "border-[#4471E6]" : "border-[#17264D]"
                            }`}
                    >
                        <span className="flex items-center gap-2 text-[#17264D]">
                            <span
                                className="size-4 rounded-full"
                                style={{ backgroundColor: corSelecionada.hex }}
                            />
                            {corSelecionada.nome}
                        </span>
                        <ChevronDown
                            className={`size-4 transition-transform duration-200 ${corAberta ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {corAberta && (
                        <div className="absolute left-0 top-full z-[99999] mt-1 w-full rounded-lg border bg-white shadow-md">
                            {CORES_DISCIPLINA.map((cor) => (
                                <button
                                    key={cor.hex}
                                    type="button"
                                    onClick={() => {
                                        atualizar("cor", cor.hex);
                                        setCorAberta(false);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#17264D] transition-colors hover:bg-[#F2F2F2]"
                                >
                                    <span
                                        className="size-3.5 rounded-full"
                                        style={{ backgroundColor: cor.hex }}
                                    />
                                    {cor.nome}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Curso vinculado</label>
                    <Select
                        options={cursos.map((c) => ({ label: c, value: c }))}
                        value={valores.cursoVinculado}
                        onChange={(v) => atualizar("cursoVinculado", v)}
                        placeholder="Selecione..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">Tipo de sala</label>
                    <Select
                        options={tiposSala.map((tipo) => ({ label: tipo, value: tipo }))}
                        value={valores.tipoSala}
                        onChange={(v) => atualizar("tipoSala", v)}
                        placeholder="Selecione..."
                    />
                </div>
            </div>

            {erro && <p className="text-sm text-[#BA1A1A]">{erro}</p>}

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
