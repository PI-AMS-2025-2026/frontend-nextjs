"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { senhaForte, SENHA_FORTE_MENSAGEM } from "@/lib/password-policy";

interface RedefinirSenhaFormProps {
  token: string | null;
}

function mensagemErro(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Este link é inválido ou expirou. Solicite um novo link de recuperação.";
    return error.message || "Não foi possível redefinir sua senha.";
  }
  return "Não foi possível conectar ao servidor. Tente novamente.";
}

export function RedefinirSenhaForm({ token }: RedefinirSenhaFormProps) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [redefinida, setRedefinida] = useState(false);

  async function redefinir(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (!senhaForte(senha)) {
      setErro(SENHA_FORTE_MENSAGEM);
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      await authService.redefinirSenha({ token, senha });
      setRedefinida(true);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthPageShell
      title={redefinida ? "Senha redefinida" : "Redefinir senha"}
      description={redefinida
        ? "Sua senha foi alterada com sucesso."
        : "Crie uma nova senha para acessar o Gini."}
    >
      {redefinida ? (
        <div className="mt-9 w-full max-w-[380px] text-center">
          <div role="status" className="rounded-md border border-[#B1C9D1] bg-white/15 p-4 text-sm text-white">
            Agora você pode entrar no sistema com sua nova senha.
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[15px] border border-[#AAC1C9] bg-[linear-gradient(90deg,#17264D_0%,#0099AA_100%)] px-6 text-base font-semibold text-white transition-colors hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ir para o login
          </Link>
        </div>
      ) : !token ? (
        <div className="mt-9 w-full max-w-[380px] text-center">
          <div role="alert" className="rounded-md border border-red-400 bg-red-500/20 p-4 text-sm text-red-100">
            O link de redefinição está incompleto ou inválido. Solicite um novo link.
          </div>
          <Link
            href="/recuperar-senha"
            className="mt-6 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-[#B1C9D1] underline underline-offset-2 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Solicitar novo link
          </Link>
        </div>
      ) : (
        <form onSubmit={redefinir} noValidate className="mt-9 w-full max-w-[380px]" aria-label="Redefinir senha">
          {erro && <div role="alert" className="mb-4 rounded-md border border-red-400 bg-red-500/20 p-3 text-center text-sm text-red-100">{erro}</div>}
          <div className="space-y-[7px]">
            <Label htmlFor="nova-senha" className="text-[18px] leading-6 font-semibold text-white sm:text-[20px]">
              Nova senha
            </Label>
            <PasswordInput
              id="nova-senha"
              name="senha"
              autoComplete="new-password"
              minLength={8}
              required
              aria-describedby="requisitos-senha"
              placeholder="Digite a nova senha"
              height="50px"
              value={senha}
              disabled={enviando}
              onChange={(event) => { setSenha(event.target.value); setErro(null); }}
              className="border-[1.5px] border-[#B1C9D1] bg-[#C9C9C9]/26 text-base text-white placeholder:text-white/56 focus:border-white focus-visible:ring-2 focus-visible:ring-white/50 [&+button]:text-[#B1C9D1]"
            />
            <p id="requisitos-senha" className="text-xs text-white/75">Mínimo de 8 caracteres, com uma letra maiúscula e uma minúscula.</p>
          </div>

          <div className="mt-4 space-y-[7px]">
            <Label htmlFor="confirmar-senha" className="text-[18px] leading-6 font-semibold text-white sm:text-[20px]">
              Confirmar nova senha
            </Label>
            <PasswordInput
              id="confirmar-senha"
              name="confirmacao"
              autoComplete="new-password"
              minLength={8}
              required
              aria-describedby="requisitos-senha"
              placeholder="Digite novamente a nova senha"
              height="50px"
              value={confirmacao}
              disabled={enviando}
              onChange={(event) => { setConfirmacao(event.target.value); setErro(null); }}
              className="border-[1.5px] border-[#B1C9D1] bg-[#C9C9C9]/26 text-base text-white placeholder:text-white/56 focus:border-white focus-visible:ring-2 focus-visible:ring-white/50 [&+button]:text-[#B1C9D1]"
            />
          </div>

          <Button
            type="submit"
            size="medium"
            disabled={enviando}
            className="mt-8 flex h-[50px] w-full items-center justify-center gap-2 rounded-[15px] border-[#AAC1C9] bg-[linear-gradient(90deg,#17264D_0%,#0099AA_100%)] text-[20px] font-medium text-white hover:border-white hover:bg-[linear-gradient(90deg,#223565_0%,#00A8BA_100%)] hover:text-white focus-visible:ring-white/70"
          >
            {enviando && <Loader2 className="size-5 animate-spin" />}
            {enviando ? "Salvando..." : "Redefinir senha"}
          </Button>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-[#B1C9D1] underline underline-offset-2 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Voltar ao login
            </Link>
          </div>
        </form>
      )}
    </AuthPageShell>
  );
}
