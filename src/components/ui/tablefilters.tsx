"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TableFiltersProps {
  onClear?: () => void;
  className?: string;
}

function TableFilters({ onClear, className }: TableFiltersProps) {
  const [codigo, setCodigo] = React.useState("");
  const [capacidade, setCapacidade] = React.useState("");
  const [tipo, setTipo] = React.useState("");

  const handleClear = () => {
    setCodigo("");
    setCapacidade("");
    setTipo("");
    onClear?.();
  };

  return (
    <div
      className={cn(
        "flex w-full items-end rounded-[5px] border border-[#C8DDE2] bg-[#F1FBFD] px-4 py-2",
        className,
      )}
    >
      <Input
        label="Código"
        showLabel
        height="32px"
        placeholder="Digite aqui..."
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        className="w-[173px] rounded-[10px] text-[14px]"
      />

      <Input
        label="Capacidade"
        showLabel
        height="32px"
        placeholder="Digite aqui..."
        value={capacidade}
        onChange={(e) => setCapacidade(e.target.value)}
        className="w-[173px] rounded-[10px] text-[14px]"
      />

      <Input
        label="Tipo"
        showLabel
        height="32px"
        placeholder="Digite aqui..."
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-[173px] rounded-[10px] text-[14px]"
      />

      <Button variant="secondary" size="small" onClick={handleClear}>
        Limpar filtros
      </Button>
    </div>
  );
}

export { TableFilters };
