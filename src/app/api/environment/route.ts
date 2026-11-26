import { NextResponse } from "next/server";
import { parseAppEnvironment } from "@/lib/app-environment";

// Informa ao navegador em qual ambiente esta instância está rodando, para a
// faixa indicativa (EnvironmentBanner). O valor vem de APP_ENVIRONMENT, lida em
// RUNTIME pelo servidor Node: a imagem Docker é única para todos os ambientes,
// então variáveis NEXT_PUBLIC_* (embutidas no build) não servem para isso.
// Pública (sem autenticação: o matcher de src/proxy.ts ignora /api) e nunca
// cacheada.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { environment: parseAppEnvironment(process.env.APP_ENVIRONMENT) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
