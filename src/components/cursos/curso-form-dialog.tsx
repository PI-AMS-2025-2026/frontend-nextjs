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
import type { Curso, Periodicidade, StatusCurso } from "@/lib/cursos";

interface CursoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "cadastrar" | "editar";
    curso?: Curso | null;
    onConfirm: (dados: {
        nome: string;
        periodicidade: Periodicidade;
        duracao: string;
        status: StatusCurso;
    }) => void;
}

export function CursoFormDialog({
    open,
    onOpenChange,
    mode,
    curso,
    onConfirm,
}: CursoFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* key força o reset dos campos toda vez que o modal reabre com um curso diferente */}
            <CursoFormContent
                key={open ? (curso?.id ?? "novo") : "fechado"}
                mode={mode}
                curso={curso}
                onCancel={() => onOpenChange(false)}
                onConfirm={onConfirm}
            />
        </Dialog>
    );
}

interface CursoFormContentProps {
    mode: "cadastrar" | "editar";
    curso?: Curso | null;
    onCancel: () => void;
    onConfirm: (dados: {
        nome: string;
        periodicidade: Periodicidade;
        duracao: string;
        status: StatusCurso;
    }) => void;
}

function CursoFormContent({
    mode,
    curso,
    onCancel,
    onConfirm,
}: CursoFormContentProps) {
    const [nome, setNome] = React.useState(curso?.nome ?? "");
    const [periodicidade, setPeriodicidade] = React.useState<Periodicidade | "">(
        curso?.periodicidade ?? ""
    );
    const [duracao, setDuracao] = React.useState(curso?.duracao ?? "");
    const [status, setStatus] = React.useState<StatusCurso>(
        curso?.status ?? "Ativo"
    );
    const [erro, setErro] = React.useState("");

    const titulo = mode === "cadastrar" ? "Cadastro de Curso" : "Edição de Curso";

    function handleConfirmar() {
        if (!nome.trim()) {
            setErro("Informe o nome do curso.");
            return;
        }
        if (!periodicidade) {
            setErro("Selecione a periodicidade.");
            return;
        }
        if (!duracao.trim()) {
            setErro("Informe a duração do curso.");
            return;
        }
        onConfirm({ nome: nome.trim(), periodicidade, duracao: duracao.trim(), status });
    }

    return (
        <DialogContent className="sm:max-w-lg !bg-white !text-[#0c2c3e]">
            <DialogHeader>
                <DialogTitle className="text-xl !text-[#0c2c3e]">{titulo}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-2">
                <div className="col-span-2 flex flex-col gap-1.5">
                    <Label htmlFor="curso-nome" className="!text-[#0c2c3e]">
                        Nome do Curso
                    </Label>
                    <Input
                        id="curso-nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Enter text here..."
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="curso-periodicidade" className="!text-[#0c2c3e]">
                        Periodicidade
                    </Label>
                    <NativeSelect
                        id="curso-periodicidade"
                        value={periodicidade}
                        onChange={(e) =>
                            setPeriodicidade(e.target.value as Periodicidade | "")
                        }
                        className="!bg-white !text-[#0c2c3e]"
                    >
                        <NativeSelectOption value="">Selecione...</NativeSelectOption>
                        <NativeSelectOption value="Semestral">Semestral</NativeSelectOption>
                        <NativeSelectOption value="Anual">Anual</NativeSelectOption>
                        <NativeSelectOption value="Trimestral">Trimestral</NativeSelectOption>
                    </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="curso-duracao" className="!text-[#0c2c3e]">
                        Duração
                    </Label>
                    <Input
                        id="curso-duracao"
                        value={duracao}
                        onChange={(e) => setDuracao(e.target.value)}
                        placeholder="Ex: 3 anos"
                        className="!bg-white !text-[#0c2c3e] border-[#1c5468]/40 focus-visible:border-[#1c5468]"
                    />
                </div>

                <div className="col-span-2 flex flex-col gap-2">
                    <Label className="!text-[#0c2c3e]">Status</Label>
                    <RadioGroup
                        value={status}
                        onValueChange={(v) => setStatus(v as StatusCurso)}
                        className="flex flex-row gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="Ativo"
                                id="status-ativo"
                                className="!border-[#2563eb] data-[state=checked]:!bg-[#2563eb] data-[state=checked]:!border-[#2563eb]"
                            />
                            <Label htmlFor="status-ativo" className="!text-[#0c2c3e] font-normal">
                                Ativo
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="Inativo"
                                id="status-inativo"
                                className="!border-[#2563eb] data-[state=checked]:!bg-[#2563eb] data-[state=checked]:!border-[#2563eb]"
                            />
                            <Label htmlFor="status-inativo" className="!text-[#0c2c3e] font-normal">
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