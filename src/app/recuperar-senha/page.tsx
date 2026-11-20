"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api";

function mensagemErro(error: unknown) {
  if (error instanceof ApiError) return error.message || "Não foi possível solicitar a recuperação.";
  return "Não foi possível conectar ao servidor. Tente novamente.";
}

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);

  async function solicitar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailNormalizado = email.trim();
    if (!emailNormalizado) {
      setErro("Informe o e-mail.");
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      await authService.solicitarRecuperacao({ email: emailNormalizado });
      setSolicitacaoEnviada(true);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthPageShell
      title="Recuperar senha"
      description="Informe seu e-mail para receber um link de recuperação."
    >
      {solicitacaoEnviada ? (
        <div className="mt-9 w-full max-w-[380px] text-center">
          <div role="status" className="rounded-md border border-[#B1C9D1] bg-white/15 p-4 text-sm text-white">
            Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha. Verifique sua caixa de entrada.
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-[#B1C9D1] underline underline-offset-2 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={solicitar} className="mt-9 w-full max-w-[380px]" aria-label="Solicitar recuperação de senha">
          {erro && <div role="alert" className="mb-4 rounded-md border border-red-400 bg-red-500/20 p-3 text-center text-sm text-red-100">{erro}</div>}
          <div className="space-y-[7px]">
            <Label htmlFor="email-recuperacao" className="text-[18px] leading-6 font-semibold text-white sm:text-[20px]">
              E-mail de usuário
            </Label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-[7px] top-1/2 z-10 size-6 -translate-y-1/2 text-[#B1C9D1]" strokeWidth={1.5} />
              <Input
                id="email-recuperacao"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Digite o seu e-mail"
                height="50px"
                value={email}
                disabled={enviando}
                onChange={(event) => { setEmail(event.target.value); setErro(null); }}
                className="border-[1.5px] border-[#B1C9D1] bg-[#C9C9C9]/26 pl-[43px] text-base text-white placeholder:text-white/56 focus:border-white focus-visible:ring-2 focus-visible:ring-white/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="medium"
            disabled={enviando}
            className="mt-10 flex h-[50px] w-full items-center justify-center gap-2 rounded-[15px] border-[#AAC1C9] bg-[linear-gradient(90deg,#17264D_0%,#0099AA_100%)] text-[20px] font-medium text-white hover:border-white hover:bg-[linear-gradient(90deg,#223565_0%,#00A8BA_100%)] hover:text-white focus-visible:ring-white/70"
          >
            {enviando && <Loader2 className="size-5 animate-spin" />}
            {enviando ? "Enviando..." : "Enviar link"}
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
