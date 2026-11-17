
"use client";

import * as React from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { BlocoHorarioResponse } from "@/types/api";

interface HorarioFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "cadastrar" | "editar";
  horario?: BlocoHorarioResponse | null;
  onConfirm: (dados: {
    horaInicio: string;
    horaFim: string;
  }) => Promise<void> | void;
}

export function HorarioFormModal({
  open,
  onClose,
  mode,
  horario,
  onConfirm,
}: HorarioFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-lg"
    >
      <HorarioFormConteudo
        key={`${mode}-${horario?.id ?? "novo"}`}
        mode={mode}
        horario={horario}
        onCancel={onClose}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}

function HorarioFormConteudo({
  mode,
  horario,
  onCancel,
  onConfirm,
}: {
  mode: "cadastrar" | "editar";
  horario?: BlocoHorarioResponse | null;
  onCancel: () => void;
  onConfirm: (dados: {
    horaInicio: string;
    horaFim: string;
  }) => Promise<void> | void;
}) {
  const [horaInicio, setHoraInicio] = React.useState(
    horario?.horaInicio?.slice(0, 5) ?? "",
  );

  const [horaFim, setHoraFim] = React.useState(
    horario?.horaFim?.slice(0, 5) ?? "",
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [erro, setErro] = React.useState("");

  const titulo =
    mode === "cadastrar"
      ? "Cadastrar Horário"
      : "Editar Horário";

  async function handleConfirmar() {
    setErro("");

    if (!horaInicio || !horaFim) {
      setErro("Preencha os horários de início e fim.");
      return;
    }

    if (horaInicio === horaFim) {
      setErro(
        "O horário de início e fim não podem ser iguais.",
      );
      return;
    }

    if (horaFim < horaInicio) {
      setErro(
        "O horário de fim deve ser posterior ao início.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm({
        horaInicio,
        horaFim,
      });
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao salvar horário.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
        {titulo}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Início"
          showLabel
          type="time"
          value={horaInicio}
          onChange={(e) => {
            setHoraInicio(e.target.value);
            setErro("");
          }}
        />

        <Input
          label="Fim"
          showLabel
          type="time"
          value={horaFim}
          onChange={(e) => {
            setHoraFim(e.target.value);
            setErro("");
          }}
        />
      </div>

      {erro && (
        <p className="text-sm text-[#BA1A1A]">
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          size="small"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>

        <Button
          variant="secondary"
          size="small"
          onClick={handleConfirmar}
          disabled={submitting}
        >
          {submitting ? "Salvando..." : "Confirmar"}
        </Button>
      </div>
    </div>
  );
}
