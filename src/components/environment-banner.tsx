"use client";

import { useEffect, useState } from "react";
import { parseAppEnvironment, type AppEnvironment } from "@/lib/app-environment";
import { cn } from "@/lib/utils";

// Ambientes que exibem a faixa. Produção não aparece aqui de propósito.
// Contraste do texto sobre o fundo acima de 7:1 (WCAG AAA); o texto identifica
// o ambiente, então a cor não é o único indicativo.
const FAIXAS: Partial<Record<AppEnvironment, { texto: string; classes: string }>> = {
  dev: {
    texto: "Ambiente de desenvolvimento",
    classes: "bg-amber-300 text-amber-950",
  },
  staging: {
    texto: "Ambiente de homologação",
    classes: "bg-violet-800 text-white",
  },
};

// Faixa fina no topo indicando ambientes não produtivos. O ambiente vem de
// /api/environment (mesma origem), que lê APP_ENVIRONMENT em runtime no
// servidor. Em produção, ambiente ausente ou qualquer falha, não renderiza nada.
export function EnvironmentBanner() {
  const [environment, setEnvironment] = useState<AppEnvironment | null>(null);

  useEffect(() => {
    let ativo = true;

    fetch("/api/environment", { cache: "no-store" })
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((dados: unknown) => {
        const valor =
          dados && typeof dados === "object" && "environment" in dados
            ? parseAppEnvironment(dados.environment)
            : null;
        if (ativo) setEnvironment(valor);
      })
      .catch(() => {
        // Falha silenciosa: sem faixa.
      });

    return () => {
      ativo = false;
    };
  }, []);

  const faixa = environment ? FAIXAS[environment] : undefined;
  if (!faixa) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex h-7 w-full shrink-0 items-center justify-center px-4",
        "text-xs font-semibold uppercase tracking-wider",
        faixa.classes,
      )}
    >
      {faixa.texto}
    </div>
  );
}
