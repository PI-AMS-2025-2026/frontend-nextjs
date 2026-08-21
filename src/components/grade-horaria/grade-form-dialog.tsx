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
    CURSOS_DISPONIVEIS,
    PERIODOS_LETIVOS,
    type GradeHoraria,
    type StatusGrade,
} from "@/lib/grade-horaria";

interface GradeFormValues {
    versao: number;
    dataCriacao: string;
    cursoVinculado: string;
    periodoLetivo: string;
    status: StatusGrade;
}

interface GradeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "cadastrar" | "editar";
    grade?: GradeHoraria | null;
    onConfirm: (dados: {
        versao: number;
        dataCriacao: string;
        cursoVinculado: string;
        periodoLetivo: string;
        status: StatusGrade;
    }) => void;
}

function valoresIniciais(grade?: GradeHoraria | null): GradeFormValues {
    return {
        versao: grade?.versao ?? 0,
        dataCriacao: grade?.dataCriacao ?? "",
        cursoVinculado: grade?.cursoVinculado ?? "",
        periodoLetivo: grade?.periodoLetivo ?? "",
        status: grade?.status ?? "Ativo",
    };
}

export function GradeFormDialog({
    open,
    onOpenChange,
    mode,
    grade,
    onConfirm,
}: GradeFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* key força o reset dos campos toda vez que o modal reabre com uma grade diferente */}
            <GradeFormContent
                key={open ? (grade?.id ?? "novo") : "fechado"}
                mode={mode}
                grade={grade}
                onCancel={() => onOpenChange(false)}
                onConfirm={onConfirm}
            />
        </Dialog>
    );
}

interface GradeFormContentProps {
    mode: "cadastrar" | "editar";
    grade?: GradeHoraria | null;
    onCancel: () => void;
    onConfirm: GradeFormDialogProps["onConfirm"];
}

function GradeFormContent({ mode, grade, onCancel, onConfirm }: GradeFormContentProps) {
    const [valores, setValores] = React.useState<GradeFormValues>(() =>
        valoresIniciais(grade)
    );
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Grade Horária" : "Edição de Grade Horária";

    function atualizar<K extends keyof GradeFormValues>(campo: K, valor: GradeFormValues[K]) {
        setValores((prev) => ({ ...prev, [campo]: valor }));
        setErro("");
    }

    function handleConfirmar() {
        if (!valores.dataCriacao || !valores.cursoVinculado || !valores.periodoLetivo) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }
        onConfirm({
            versao: valores.versao,
            dataCriacao: valores.dataCriacao,
            cursoVinculado: valores.cursoVinculado,
            periodoLetivo: valores.periodoLetivo,
            status: valores.status,
        });
    }

    return (
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto !bg-white !text-[#0c2c3e]">
            <DialogHeader>
                <DialogTitle className="text-xl !text-[#0c2c3e]">{titulo}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 py-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="grade-versao" className="!text-[#0c2c3e]">
                        Versão
                    </Label>
                    <Input
                        id="grade-versao"
                        type="number"
                        min={0}
                        value={valores.versao}
                        onChange={(e) => atualizar("versao", Number(e.target.value))}
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="grade-data" className="!text-[#0c2c3e]">
                        Data de Criação
                    </Label>
                    <Input
                        id="grade-data"
                        type="date"
                        value={valores.dataCriacao}
                        onChange={(e) => atualizar("dataCriacao", e.target.value)}
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="grade-curso" className="!text-[#0c2c3e]">
                        Curso Vinculado
                    </Label>
                    <NativeSelect
                        id="grade-curso"
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
                    <Label htmlFor="grade-periodo" className="!text-[#0c2c3e]">
                        Período Letivo
                    </Label>
                    <NativeSelect
                        id="grade-periodo"
                        value={valores.periodoLetivo}
                        onChange={(e) => atualizar("periodoLetivo", e.target.value)}
                        className="!bg-white !text-[#0c2c3e] w-full"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        {PERIODOS_LETIVOS.map((periodo) => (
                            <NativeSelectOption key={periodo} value={periodo}>
                                {periodo}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </div>

                <div className="col-span-2 flex flex-col gap-2">
                    <Label className="!text-[#0c2c3e]">Status</Label>
                    <RadioGroup
                        value={valores.status}
                        onValueChange={(v) => atualizar("status", v as StatusGrade)}
                        className="flex flex-row gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="Ativo"
                                id="grade-status-ativo"
                                className="!border-[#2563eb] data-[state=checked]:!bg-[#2563eb] data-[state=checked]:!border-[#2563eb]"
                            />
                            <Label htmlFor="grade-status-ativo" className="!text-[#0c2c3e] font-normal">
                                Ativo
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="Inativo"
                                id="grade-status-inativo"
                                className="!border-[#2563eb] data-[state=checked]:!bg-[#2563eb] data-[state=checked]:!border-[#2563eb]"
                            />
                            <Label htmlFor="grade-status-inativo" className="!text-[#0c2c3e] font-normal">
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