"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function hasExpiredSessionNotice() {
  return new URLSearchParams(window.location.search).get("motivo") === "sessao-expirada";
}

export default function LoginPage() {
  const { login } = useAuth();
  const sessaoExpirada = useSyncExternalStore(subscribeToNavigation, hasExpiredSessionNotice, () => false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Informe o e-mail.");
      return;
    }
    if (!senha.trim()) {
      setError("Informe a senha.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), senha });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "E-mail ou senha inválidos.");
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title="Bem-vindo ao Gini"
      description={<>Faça login para acessar<br />o sistema</>}
    >
        <form
          onSubmit={handleSubmit}
          className="mt-9 w-full max-w-[380px]"
          aria-label="Acesso ao sistema"
        >
          {sessaoExpirada && (
            <div role="status" className="mb-4 rounded-md border border-[#B1C9D1] bg-white/15 p-3 text-center text-sm text-white">
              Sua sessão expirou. Entre novamente.
            </div>
          )}

          {error && (
            <div role="alert" className="mb-4 rounded-md bg-red-500/20 border border-red-400 p-3 text-sm text-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-[7px]">
            <Label
              htmlFor="email"
              className="text-[18px] leading-6 font-semibold text-white sm:text-[20px]"
            >
              E-mail de usuário
            </Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-[7px] top-1/2 z-10 size-6 -translate-y-1/2 text-[#B1C9D1]"
                strokeWidth={1.5}
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Digite o seu e-mail"
                height="50px"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className={cn(
                  "border-[1.5px] border-[#B1C9D1] bg-[#C9C9C9]/26 pl-[43px] text-base text-white",
                  "placeholder:text-white/56 focus:border-white focus-visible:ring-2 focus-visible:ring-white/50",
                )}
              />
            </div>
          </div>

          <div className="mt-[10px] space-y-[7px]">
            <Label
              htmlFor="password"
              className="text-[18px] leading-6 font-semibold text-white sm:text-[20px]"
            >
              Senha
            </Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              height="50px"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setError(null); }}
              className={cn(
                "border-[1.5px] border-[#B1C9D1] bg-[#C9C9C9]/26 text-base text-white",
                "placeholder:text-white/56 focus:border-white focus-visible:ring-2 focus-visible:ring-white/50",
                "[&+button]:text-[#B1C9D1]",
              )}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-4 text-[#AAC1C9]">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id="remember-me"
                className="h-3 w-[13px] rounded-none border-[#B1C9D1] bg-white data-checked:border-white data-checked:bg-white data-checked:text-[#17264D]"
              />
              <Label
                htmlFor="remember-me"
                className="text-[12px] font-extrabold text-[#AAC1C9] sm:text-sm"
              >
                Lembrar de mim
              </Label>
            </div>
            <Link
              href="/recuperar-senha"
              className="text-[12px] leading-4 font-extrabold text-[#B1C9D1] underline underline-offset-2 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
            >
              Esqueci a senha
            </Link>
          </div>

          <Button
            type="submit"
            size="medium"
            disabled={submitting}
            className={cn(
              "mt-[54px] h-[50px] w-full rounded-[15px] border-[#AAC1C9]",
              "bg-[linear-gradient(90deg,#17264D_0%,#0099AA_100%)] text-[28px] font-medium text-white",
              "hover:border-white hover:bg-[linear-gradient(90deg,#223565_0%,#00A8BA_100%)] hover:text-white",
              "focus-visible:ring-white/70 flex items-center justify-center gap-2",
            )}
          >
            {submitting && <Loader2 className="h-6 w-6 animate-spin" />}
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
    </AuthPageShell>
  );
}
