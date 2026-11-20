import { RedefinirSenhaForm } from "@/components/auth/redefinir-senha-form";

interface RedefinirSenhaPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function RedefinirSenhaPage({ searchParams }: RedefinirSenhaPageProps) {
  const parametros = await searchParams;
  const token = typeof parametros.token === "string" && parametros.token.trim()
    ? parametros.token
    : null;

  return <RedefinirSenhaForm token={token} />;
}
