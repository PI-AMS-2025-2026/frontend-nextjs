"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
    CORES_DISCIPLINA,
    CURSOS_DISPONIVEIS,
    type Disciplina,
    type Modalidade,
    type Periodo,
    type StatusDisciplina,
    type TipoDisciplina,
    type TipoSala,
} from "@/lib/disciplinas";

export interface DisciplinaFormValues {
    nome: string;
    cargaHoraria: number;
    tipo: TipoDisciplina | "";
    periodo: Periodo | "";
    modalidade: Modalidade | "";
    codigo: number;
    cor: string;
    cursoVinculado: string;
    tipoSala: TipoSala | "";
    status: StatusDisciplina;
}

interface DisciplinaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "cadastrar" | "editar";
    disciplina?: Disciplina | null;
    onConfirm: (dados: {
        nome: string;
        cargaHoraria: number;
        tipo: TipoDisciplina;
        periodo: Periodo;
        modalidade: Modalidade;
        codigo: number;
        cor: string;
        cursoVinculado: string;
        tipoSala: TipoSala;
        status: StatusDisciplina;
    }) => void;
}

function valoresIniciais(disciplina?: Disciplina | null): DisciplinaFormValues {
    return {
        nome: disciplina?.nome ?? "",
        cargaHoraria: disciplina?.cargaHoraria ?? 0,
        tipo: disciplina?.tipo ?? "",
        periodo: disciplina?.periodo ?? "",
        modalidade: disciplina?.modalidade ?? "",
        codigo: disciplina?.codigo ?? 0,
        cor: disciplina?.cor ?? CORES_DISCIPLINA[0].hex,
        cursoVinculado: disciplina?.cursoVinculado ?? "",
        tipoSala: disciplina?.tipoSala ?? "",
        status: disciplina?.status ?? "Ativo",
    };
}

export function DisciplinaFormDialog({
    open,
    onOpenChange,
    mode,
    disciplina,
    onConfirm,
}: DisciplinaFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* key força o reset dos campos toda vez que o modal reabre com uma disciplina diferente */}
            <DisciplinaFormContent
                key={open ? (disciplina?.id ?? "novo") : "fechado"}
                mode={mode}
                disciplina={disciplina}
                onCancel={() => onOpenChange(false)}
                onConfirm={onConfirm}
            />
        </Dialog>
    );
}

interface DisciplinaFormContentProps {
    mode: "cadastrar" | "editar";
    disciplina?: Disciplina | null;
    onCancel: () => void;
    onConfirm: DisciplinaFormDialogProps["onConfirm"];
}

function DisciplinaFormContent({
    mode,
    disciplina,
    onCancel,
    onConfirm,
}: DisciplinaFormContentProps) {
    const [valores, setValores] = React.useState<DisciplinaFormValues>(() =>
        valoresIniciais(disciplina)
    );
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de disciplina" : "Edição de disciplina";

    function atualizar<K extends keyof DisciplinaFormValues>(
        campo: K,
        valor: DisciplinaFormValues[K]
    ) {
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
        onConfirm({
            nome: valores.nome.trim(),
            cargaHoraria: valores.cargaHoraria,
            tipo: valores.tipo as TipoDisciplina,
            periodo: valores.periodo as Periodo,
            modalidade: valores.modalidade as Modalidade,
            codigo: valores.codigo,
            cor: valores.cor,
            cursoVinculado: valores.cursoVinculado,
            tipoSala: valores.tipoSala as TipoSala,
            status: valores.status,
        });
    }

    const corSelecionada =
        CORES_DISCIPLINA.find((c) => c.hex === valores.cor) ?? CORES_DISCIPLINA[0];

    return (
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto !bg-white !text-[#0c2c3e]">
            <DialogHeader>
                <DialogTitle className="text-xl !text-[#0c2c3e]">{titulo}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 py-2">
                <div className="col-span-2 flex flex-col gap-1.5">
                    <Label htmlFor="disc-nome" className="!text-[#0c2c3e]">Nome</Label>
                    <Input
                        id="disc-nome"
                        value={valores.nome}
                        onChange={(e) => atualizar("nome", e.target.value)}
                        placeholder="Enter text here..."
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-carga" className="!text-[#0c2c3e]">Carga horária</Label>
                    <Input
                        id="disc-carga"
                        type="number"
                        min={0}
                        value={valores.cargaHoraria}
                        onChange={(e) => atualizar("cargaHoraria", Number(e.target.value))}
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-codigo" className="!text-[#0c2c3e]">Código da disciplina</Label>
                    <Input
                        id="disc-codigo"
                        type="number"
                        min={0}
                        value={valores.codigo}
                        onChange={(e) => atualizar("codigo", Number(e.target.value))}
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-tipo" className="!text-[#0c2c3e]">Tipo da disciplina</Label>
                    <NativeSelect
                        id="disc-tipo"
                        value={valores.tipo}
                        onChange={(e) => atualizar("tipo", e.target.value as TipoDisciplina | "")}
                        className="!bg-white !text-[#0c2c3e] w-full"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        <NativeSelectOption value="Teórica">Teórica</NativeSelectOption>
                        <NativeSelectOption value="Prática">Prática</NativeSelectOption>
                        <NativeSelectOption value="50/50">50/50</NativeSelectOption>
                    </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-periodo" className="!text-[#0c2c3e]">Período</Label>
                    <NativeSelect
                        id="disc-periodo"
                        value={valores.periodo}
                        onChange={(e) => atualizar("periodo", e.target.value as Periodo | "")}
                        className="!bg-white !text-[#0c2c3e] w-full"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        <NativeSelectOption value="Manhã">Manhã</NativeSelectOption>
                        <NativeSelectOption value="Tarde">Tarde</NativeSelectOption>
                        <NativeSelectOption value="Noite">Noite</NativeSelectOption>
                    </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-modalidade" className="!text-[#0c2c3e]">Modalidade</Label>
                    <NativeSelect
                        id="disc-modalidade"
                        value={valores.modalidade}
                        onChange={(e) => atualizar("modalidade", e.target.value as Modalidade | "")}
                        className="!bg-white !text-[#0c2c3e] w-full"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        <NativeSelectOption value="Presencial">Presencial</NativeSelectOption>
                        <NativeSelectOption value="EAD">EAD</NativeSelectOption>
                    </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="!text-[#0c2c3e]">Cor</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex h-8 items-center justify-between gap-2 rounded-lg border border-[#1c5468]/40 bg-white px-3 text-sm text-[#0c2c3e]"                            >
                                <span
                                    className="size-4 rounded-full"
                                    style={{ backgroundColor: corSelecionada.hex }}
                                />
                                <ChevronDown className="ml-auto size-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {CORES_DISCIPLINA.map((cor) => (
                                <DropdownMenuItem
                                    key={cor.hex}
                                    selected={valores.cor === cor.hex}
                                    onSelect={() => atualizar("cor", cor.hex)}
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="size-3.5 rounded-full"
                                            style={{ backgroundColor: cor.hex }}
                                        />
                                        {cor.nome}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-curso" className="!text-[#0c2c3e]">Curso vinculado</Label>
                    <NativeSelect
                        id="disc-curso"
                        value={valores.cursoVinculado}
                        onChange={(e) => atualizar("cursoVinculado", e.target.value)}
                        className="!bg-white !text-[#0c2c3e] w-full"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        {CURSOS_DISPONIVEIS.map((curso) => (
                            <NativeSelectOption key={curso} value={curso}>
                                {curso}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disc-sala" className="!text-[#0c2c3e]">Tipo de sala</Label>
                    <NativeSelect
                        id="disc-sala"
                        value={valores.tipoSala}
                        onChange={(e) => atualizar("tipoSala", e.target.value as TipoSala | "")}
                        className="!bg-white !text-[#0c2c3e] w-full"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        <NativeSelectOption value="Laboratório">Laboratório</NativeSelectOption>
                        <NativeSelectOption value="Sala">Sala</NativeSelectOption>
                    </NativeSelect>
                </div>

                <div className="col-span-2 flex flex-col gap-2">
                    <Label className="!text-[#0c2c3e]">Status</Label>
                    <RadioGroup
                        value={valores.status}
                        onValueChange={(v) => atualizar("status", v as StatusDisciplina)}
                        className="flex flex-row gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="Ativo"
                                id="disc-status-ativo"
                                className="!border-[#2563eb] data-[state=checked]:!bg-[#2563eb] data-[state=checked]:!border-[#2563eb]"
                            />
                            <Label htmlFor="disc-status-ativo" className="!text-[#0c2c3e] font-normal">
                                Ativo
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="Inativo"
                                id="disc-status-inativo"
                                className="!border-[#2563eb] data-[state=checked]:!bg-[#2563eb] data-[state=checked]:!border-[#2563eb]"
                            />
                            <Label htmlFor="disc-status-inativo" className="!text-[#0c2c3e] font-normal">
                                Inativo
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <DialogFooter className="!bg-transparent !border-t-0 !mx-0 !mb-0 !p-0 !pt-2">
                <Button
                    type="button"
                    variant="default"
                    className="!bg-transparent !text-[#0c2c3e]/70 !shadow-none font-semibold tracking-wide hover:!bg-muted"
                    onClick={onCancel}
                >
                    CANCELAR
                </Button>
                <Button
                    type="button"
                    className="bg-[#2fa4b5] font-semibold tracking-wide text-white hover:bg-[#2a93a2]"
                    onClick={handleConfirmar}
                >
                    CONFIRMAR
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}