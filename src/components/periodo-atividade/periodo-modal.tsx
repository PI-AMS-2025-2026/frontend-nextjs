
"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";

import type {
  PeriodoAtividadeQuadroRequest,
  PeriodoAtividadeQuadroResponse,
  TipoPeriodoAtividadeQuadro,
  Status,
} from "@/types/api";

import { formularioInicial } from "./periodo-data";

interface PeriodoModalProps {
  open: boolean;
  mode: "cadastrar" | "editar";
  periodo?: PeriodoAtividadeQuadroResponse | null;
  onClose: () => void;
  onConfirm: (
    dados: PeriodoAtividadeQuadroRequest
  ) => Promise<void>;
}

const inputClass =
  "h-10 w-full rounded-lg border border-[#B8C2D1] bg-white px-3 text-sm text-[#17264D] outline-none transition-colors focus:border-[#0099AA] focus:ring-2 focus:ring-[#0099AA]/15";

const labelClass =
  "mb-2 block text-xs font-semibold text-[#17264D]";

export function PeriodoModal(props: PeriodoModalProps) {
  if (!props.open) return null;

  const periodoKey = props.periodo
    ? `${props.periodo.id}-${props.periodo.updatedAt}`
    : "novo";

  return (
    <PeriodoModalForm
      key={`${props.mode}-${periodoKey}`}
      {...props}
    />
  );
}

function PeriodoModalForm({
  open,
  mode,
  periodo,
  onClose,
  onConfirm,
}: PeriodoModalProps) {
  const [dados, setDados] =
    React.useState<PeriodoAtividadeQuadroRequest>(() =>
      mode === "editar" && periodo
        ? {
            ano: periodo.ano,
            periodo: periodo.periodo,
            tipoPeridoAtividadeQuadro:
              periodo.tipoPeridoAtividadeQuadro,
            dataInicio: periodo.dataInicio,
            dataFim: periodo.dataFim,
            status: periodo.status,
          }
        : { ...formularioInicial }
    );

  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || salvando) return;

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [open, salvando, onClose]);

  function atualizar<K extends keyof PeriodoAtividadeQuadroRequest>(
    campo: K,
    valor: PeriodoAtividadeQuadroRequest[K]
  ) {
    setDados((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function confirmar(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !Number.isSafeInteger(dados.periodo) ||
      dados.periodo < 1
    ) {
      setErro("Informe um período válido.");
      return;
    }

    if (
      !Number.isSafeInteger(dados.ano) ||
      dados.ano < 1
    ) {
      setErro("Informe um ano válido.");
      return;
    }

    if (dados.dataFim < dados.dataInicio) {
      setErro(
        "A data de término não pode ser anterior à data de início."
      );
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      await onConfirm(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o período."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          !salvando &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="periodo-modal-title"
        className="w-full max-w-[650px] rounded-xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-7 flex items-start justify-between gap-4">
          <h2
            id="periodo-modal-title"
            className="text-xl font-bold text-[#17264D]"
          >
            {mode === "cadastrar"
              ? "Cadastrar Período Atividade Quadro"
              : "Editar Período Atividade Quadro"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar"
            className="rounded-lg p-1 text-[#64748B] hover:bg-[#F2F2F2] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={confirmar}>
          {/* DATAS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="data-inicio"
                className={labelClass}
              >
                Data de início
              </label>
              <input
                id="data-inicio"
                type="date"
                required
                disabled={salvando}
                className={inputClass}
                value={dados.dataInicio}
                onChange={(event) =>
                  atualizar(
                    "dataInicio",
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label
                htmlFor="data-fim"
                className={labelClass}
              >
                Data de término
              </label>
              <input
                id="data-fim"
                type="date"
                required
                disabled={salvando}
                className={inputClass}
                value={dados.dataFim}
                onChange={(event) =>
                  atualizar(
                    "dataFim",
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          {/* PERÍODO, ANO E STATUS */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="periodo"
                className={labelClass}
              >
                Período
              </label>
              <input
                id="periodo"
                type="number"
                min={1}
                step={1}
                required
                disabled={salvando}
                placeholder="Ex.: 1"
                className={inputClass}
                value={dados.periodo}
                onChange={(event) =>
                  atualizar(
                    "periodo",
                    event.target.value === ""
                      ? 0
                      : Number(event.target.value)
                  )
                }
              />
            </div>

            <div>
              <label
                htmlFor="ano"
                className={labelClass}
              >
                Ano
              </label>
              <input
                id="ano"
                type="number"
                min={1}
                step={1}
                required
                disabled={salvando}
                className={inputClass}
                value={dados.ano}
                onChange={(event) =>
                  atualizar(
                    "ano",
                    event.target.value === ""
                      ? 0
                      : Number(event.target.value)
                  )
                }
              />
            </div>

            <fieldset disabled={salvando}>
              <legend className={labelClass}>
                Status
              </legend>

              <div className="flex flex-wrap gap-4 pt-2">
                {(["ATIVO", "INATIVO"] as Status[]).map(
                  (status) => (
                    <label
                      key={status}
                      className="flex cursor-pointer items-center gap-1.5 text-sm text-[#17264D]"
                    >
                      <input
                        type="radio"
                        name={`status-${mode}`}
                        checked={dados.status === status}
                        onChange={() =>
                          atualizar("status", status)
                        }
                        className="accent-[#0099AA]"
                      />
                      {status === "ATIVO"
                        ? "Ativo"
                        : "Inativo"}
                    </label>
                  )
                )}
              </div>
            </fieldset>
          </div>

          {/* TIPO DE PERÍODO */}
          <fieldset
            disabled={salvando}
            className="mt-6"
          >
            <legend className={labelClass}>
              Tipo período atividade quadro
            </legend>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              {(
                [
                  "SEMESTRAL",
                  "ANUAL",
                ] as TipoPeriodoAtividadeQuadro[]
              ).map((tipo) => (
                <label
                  key={tipo}
                  className="flex cursor-pointer items-center gap-2 text-sm text-[#17264D]"
                >
                  <input
                    type="radio"
                    name={`tipo-${mode}`}
                    checked={
                      dados.tipoPeridoAtividadeQuadro ===
                      tipo
                    }
                    onChange={() =>
                      atualizar(
                        "tipoPeridoAtividadeQuadro",
                        tipo
                      )
                    }
                    className="accent-[#0099AA]"
                  />
                  {tipo === "SEMESTRAL"
                    ? "Semestral"
                    : "Anual"}
                </label>
              ))}
            </div>
          </fieldset>

          {erro && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]"
            >
              {erro}
            </div>
          )}

          {/* BOTÕES */}
          <div className="mt-10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[#17264D] transition-colors hover:bg-[#F2F2F2] disabled:opacity-50"
            >
              CANCELAR
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-lg bg-[#0099AA] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#008795] disabled:opacity-60"
            >
              {salvando && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {salvando ? "SALVANDO..." : "CONFIRMAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}