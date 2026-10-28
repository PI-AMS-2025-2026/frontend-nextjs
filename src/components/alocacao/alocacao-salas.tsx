"use client";

import { Select } from "@/components/ui/select";
import type { Sala } from "./tipos";

type AlocacaoSalasProps = {
  salas: Sala[];
  value: string;
  onChange: (salaId: string) => void;
  erro?: boolean;
};

export default function AlocacaoSalas({
  salas,
  value,
  onChange,
  erro = false,
}: AlocacaoSalasProps) {
  const selecionada = salas.find((sala) => sala.id === value);

  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className="mb-2 text-sm font-semibold text-[#17264D]">
        Sala cadastrada
      </legend>
      {salas.length ? (
        <Select
          options={salas.map((sala) => ({ label: sala.nome, value: sala.id }))}
          value={value}
          onChange={onChange}
          placeholder="Selecione uma sala"
          className="[&>div]:max-h-60 [&>div]:overflow-y-auto [&>div]:bg-white"
        />
      ) : (
        <p className="text-sm text-[#777777]">
          Nenhuma sala cadastrada para esta grade.
        </p>
      )}
      {erro && (
        <p role="alert" className="text-sm text-[#BA1A1A]">
          Selecione uma sala para confirmar a alocação.
        </p>
      )}
      {selecionada && (
        <div className="rounded-lg border border-[#D9D9D9] bg-[#F2F2F2] p-3 text-sm text-[#17264D]">
          <p className="font-medium">Capacidade: {selecionada.capacidade}</p>
          {selecionada.recursos.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1">
              {selecionada.recursos.map((recurso, indice) => (
                <li key={recurso + "-" + indice}>{recurso}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </fieldset>
  );
}
