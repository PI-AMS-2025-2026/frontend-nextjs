"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DisciplinaResponse, ProfessorResponse } from "@/types/api";

interface DadosVinculo {
    professorId: number;
    disciplinaId: number;
}

interface ProfessorDisciplinaFormModalProps {
    open: boolean;
    onClose: () => void;
    professores: ProfessorResponse[];
    disciplinas: DisciplinaResponse[];
    onConfirm: (dados: DadosVinculo) => void | Promise<void>;
}

export function ProfessorDisciplinaFormModal({
    open,
    onClose,
    professores,
    disciplinas,
    onConfirm,
}: ProfessorDisciplinaFormModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="max-w-2xl overflow-visible">
            <ProfessorDisciplinaFormConteudo
                professores={professores}
                disciplinas={disciplinas}
                onCancel={onClose}
                onConfirm={onConfirm}
            />
        </Modal>
    );
}

function ProfessorDisciplinaFormConteudo({
    professores,
    disciplinas,
    onCancel,
    onConfirm,
}: {
    professores: ProfessorResponse[];
    disciplinas: DisciplinaResponse[];
    onCancel: () => void;
    onConfirm: (dados: DadosVinculo) => void | Promise<void>;
}) {
    const [professor, setProfessor] = React.useState("");
    const [cursoId, setCursoId] = React.useState("");
    const [disciplinaId, setDisciplinaId] = React.useState("");
    const [erro, setErro] = React.useState("");
    const [salvando, setSalvando] = React.useState(false);

    // Cursos únicos derivados das disciplinas (para o filtro)
    const cursos = React.useMemo(() => {
        const mapa = new Map<number, string>();
        for (const d of disciplinas) {
            // ⚠️ se o tipo for flat, troque por: const id = d.cursoId; const nome = d.cursoNome;
            const curso = d.curso;
            if (curso && !mapa.has(curso.id)) {
                mapa.set(curso.id, curso.nome);
            }
        }
        return Array.from(mapa, ([id, nome]) => ({
            value: String(id),
            label: nome,
        }));
    }, [disciplinas]);

    const disciplinasFiltradas = React.useMemo(() => {
        if (!cursoId) return disciplinas;
        return disciplinas.filter(
            (d) => d.curso && String(d.curso.id) === cursoId,
        );
    }, [disciplinas, cursoId]);

    // Se o curso mudar e a disciplina selecionada não pertencer mais ao filtro, limpa
    React.useEffect(() => {
        if (!disciplinaId) return;
        const aindaValida = disciplinasFiltradas.some(
            (d) => String(d.id) === disciplinaId,
        );
        if (!aindaValida) setDisciplinaId("");
    }, [disciplinasFiltradas, disciplinaId]);

    async function handleConfirmar() {
        const nome = professor.trim().toLowerCase();
        const encontrado = professores.find(
            (p) => p.nome.trim().toLowerCase() === nome,
        );

        if (!nome) return setErro("Informe o professor.");
        if (!encontrado) return setErro("Professor não encontrado.");
        if (!disciplinaId) return setErro("Selecione a disciplina.");

        setSalvando(true);
        try {
            await onConfirm({
                professorId: encontrado.id,
                disciplinaId: Number(disciplinaId),
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
                Vincular Professor à Disciplina
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Input
                        label="Professor"
                        showLabel
                        height="36px"
                        className="rounded-[10px] text-sm"
                        placeholder="Digite o nome do professor..."
                        list="professores-vinculo"
                        value={professor}
                        onChange={(e) => {
                            setProfessor(e.target.value);
                            setErro("");
                        }}
                    />
                    <datalist id="professores-vinculo">
                        {professores.map((p) => (
                            <option key={p.id} value={p.nome} />
                        ))}
                    </datalist>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#17264D]">
                        Curso
                    </label>
                    <Select
                        options={cursos}
                        value={cursoId}
                        onChange={(v) => {
                            setCursoId(v);
                            setErro("");
                        }}
                        placeholder="Todos os cursos"
                        menuClassName="max-h-60 overflow-y-auto overscroll-contain"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-[#17264D]">
                        Disciplina
                    </label>
                    <Select
                        options={disciplinasFiltradas.map((d) => ({
                            label: d.nome,
                            value: String(d.id),
                        }))}
                        value={disciplinaId}
                        onChange={(v) => {
                            setDisciplinaId(v);
                            setErro("");
                        }}
                        placeholder={
                            cursoId
                                ? "Selecione a Disciplina"
                                : "Selecione a Disciplina (opcionalmente filtre por curso)"
                        }
                        menuClassName="max-h-60 overflow-y-auto overscroll-contain"
                    />
                </div>
            </div>

            {erro && <p className="text-sm text-[#BA1A1A]">{erro}</p>}

            <div className="flex justify-end gap-3">
                <Button variant="ghost" size="small" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    disabled={salvando}
                    onClick={handleConfirmar}
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
}