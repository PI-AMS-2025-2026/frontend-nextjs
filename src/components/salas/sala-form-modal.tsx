"use client";

import * as React from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  SalaResponse,
  TipoSalaResponse,
} from "@/types/api";

interface DadosSala {
  codigo: string;
  capacidade: number;
  tipoSalaId: number;
}

interface SalaFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "cadastrar" | "editar";
  sala?: SalaResponse | null;
  tiposSala: TipoSalaResponse[];
  onConfirm: (
    dados: DadosSala,
  ) => void;
}

export function SalaFormModal({
  open,
  onClose,
  mode,
  sala,
  tiposSala,
  onConfirm,
}: SalaFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-xl"
    >
      <SalaFormConteudo
        key={sala?.id ?? "novo"}
        mode={mode}
        sala={sala}
        tiposSala={tiposSala}
        onCancel={onClose}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}

function SalaFormConteudo({
  mode,
  sala,
  tiposSala,
  onCancel,
  onConfirm,
}: {
  mode: "cadastrar" | "editar";
  sala?: SalaResponse | null;
  tiposSala: TipoSalaResponse[];
  onCancel: () => void;
  onConfirm: (
    dados: DadosSala,
  ) => void;
}) {
  const [codigo, setCodigo] =
    React.useState(
      sala?.codigo ?? "",
    );

  const [capacidade, setCapacidade] =
    React.useState(
      sala?.capacidade ?? 0,
    );

  const [tipoSalaId, setTipoSalaId] =
    React.useState(
      sala?.tipoSala?.id
        ? String(sala.tipoSala.id)
        : "",
    );

  const [erro, setErro] =
    React.useState("");

  const titulo =
    mode === "cadastrar"
      ? "Cadastro de Sala"
      : "Edição de Sala";

  function handleConfirmar() {
    if (!codigo.trim()) {
      setErro(
        "Informe o código da sala.",
      );
      return;
    }

    if (capacidade <= 0) {
      setErro(
        "A capacidade deve ser maior que zero.",
      );
      return;
    }

    if (!tipoSalaId) {
      setErro(
        "Selecione o tipo de sala.",
      );
      return;
    }

    onConfirm({
      codigo: codigo.trim(),
      capacidade,
      tipoSalaId: Number(
        tipoSalaId,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="pr-12 text-xl font-semibold text-[#17264D]">
        {titulo}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Código da Sala:"
          showLabel
          value={codigo}
          onChange={(e) => {
            setCodigo(
              e.target.value,
            );
            setErro("");
          }}
          placeholder="Digite aqui..."
        />

        <Input
          label="Capacidade:"
          showLabel
          type="number"
          min={1}
          value={
            capacidade === 0
              ? ""
              : capacidade
          }
          onChange={(e) => {
            setCapacidade(
              Number(
                e.target.value,
              ),
            );
            setErro("");
          }}
          placeholder="Digite aqui..."
        />

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label
            htmlFor="tipoSala"
            className="text-sm font-medium text-[#17264D]"
          >
            Tipo de Sala:
          </label>

          <select
            id="tipoSala"
            value={tipoSalaId}
            onChange={(e) => {
              setTipoSalaId(
                e.target.value,
              );
              setErro("");
            }}
            className="h-11 w-full rounded-[8px] border border-[#C8CDD2] bg-white px-3 text-sm text-[#17264D] outline-none transition focus:border-[#0099AA]"
          >
            <option value="">
              Selecione...
            </option>

            {tiposSala.map(
              (tipo) => (
                <option
                  key={tipo.id}
                  value={tipo.id}
                >
                  {tipo.nome}
                </option>
              ),
            )}
          </select>
        </div>
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
        >
          Cancelar
        </Button>

        <Button
          variant="secondary"
          size="small"
          onClick={
            handleConfirmar
          }
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}