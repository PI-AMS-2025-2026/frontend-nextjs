"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Sala } from "./tipos";

type RoomSelectProps = {
  salas: Sala[];
  value: string;
  onChange: (id: string) => void;
  erro?: boolean;
};

export default function RoomSelect({
  salas,
  value,
  onChange,
  erro,
}: RoomSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const id = useId();
  const selecionada = salas.find((sala) => sala.id === value);

  useEffect(() => {
    if (!aberto) return;
    lista.current?.focus();
    const handleOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target))
        setAberto(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [aberto]);

  useEffect(() => {
    if (aberto)
      document
        .getElementById(`${id}-option-${indiceAtivo}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [aberto, indiceAtivo, id]);

  function escolher(indice: number) {
    const sala = salas[indice];
    if (!sala) return;
    onChange(sala.id);
    setAberto(false);
    botao.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && aberto) {
      event.preventDefault();
      event.stopPropagation();
      setAberto(false);
      botao.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      setAberto(false);
      return;
    }
    if (
      !["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)
    )
      return;
    event.preventDefault();
    if (!aberto) {
      setIndiceAtivo(
        Math.max(
          0,
          salas.findIndex((sala) => sala.id === value),
        ),
      );
      setAberto(true);
      return;
    }
    if (event.key === "Enter" || event.key === " ") escolher(indiceAtivo);
    if (event.key === "ArrowDown")
      setIndiceAtivo((indice) => Math.min(salas.length - 1, indice + 1));
    if (event.key === "ArrowUp")
      setIndiceAtivo((indice) => Math.max(0, indice - 1));
    if (event.key === "Home") setIndiceAtivo(0);
    if (event.key === "End") setIndiceAtivo(salas.length - 1);
  }

  return (
    <div ref={ref} className="relative">
      <label
        id={`${id}-label`}
        className="mb-2 block text-xs font-medium text-[#171717]"
      >
        Salas disponíveis
      </label>
      <button
        ref={botao}
        type="button"
        data-autofocus
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-invalid={erro || undefined}
        aria-describedby={erro ? `${id}-error` : undefined}
        disabled={salas.length === 0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          setIndiceAtivo(
            Math.max(
              0,
              salas.findIndex((sala) => sala.id === value),
            ),
          );
          setAberto((valor) => !valor);
        }}
        className={`flex min-h-[42px] w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA] disabled:opacity-60 ${erro ? "border-red-500" : "border-[#9AA3B5]"}`}
      >
        <span
          id={`${id}-value`}
          className={selecionada ? "text-[#171717]" : "text-[#777777]"}
        >
          {selecionada?.nome ||
            (salas.length ? "Selecione a sala" : "Nenhuma sala cadastrada")}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition ${aberto ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {erro && (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-600">
          Selecione uma sala para confirmar.
        </p>
      )}
      {aberto && (
        <div
          ref={lista}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-option-${indiceAtivo}`}
          onKeyDown={handleKeyDown}
          className="relative z-10 mt-1 max-h-[220px] overflow-auto rounded-md border border-[#9AA3B5] bg-white shadow-lg outline-none"
        >
          {salas.map((sala, indice) => (
            <div
              key={sala.id}
              id={`${id}-option-${indice}`}
              role="option"
              aria-selected={value === sala.id}
              onMouseEnter={() => setIndiceAtivo(indice)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => escolher(indice)}
              className={`flex cursor-pointer items-start justify-between gap-2 border-b border-[#E4E7ED] px-3 py-3 last:border-b-0 ${indiceAtivo === indice ? "bg-[#E6F8F9]" : "bg-white"}`}
            >
              <div>
                <p className="text-xs font-semibold text-[#17264D]">
                  {sala.nome}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#777777]">
                  {sala.capacidade} lugares ·{" "}
                  {sala.recursos.join(", ") || "Sem recursos adicionais"}
                </p>
              </div>
              {value === sala.id && (
                <Check
                  className="h-4 w-4 shrink-0 text-[#0099AA]"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
