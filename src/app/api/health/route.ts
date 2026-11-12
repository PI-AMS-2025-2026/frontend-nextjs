import { NextResponse } from "next/server";

// Rota de health check consumida pelo HEALTHCHECK do Docker, pelo docker-compose
// e pelos orquestradores do repositório de infraestrutura.
// Precisa ser pública (sem autenticação) e nunca cacheada.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
