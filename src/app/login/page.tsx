import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <main
      className={cn(
        "relative isolate flex min-h-svh items-center justify-center overflow-hidden",
        "bg-[linear-gradient(239.09deg,#0099AA_0%,#17264D_55%)] px-4 py-28 sm:px-8 lg:py-0",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/images/login/fatec-campus.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="left-[-1.85%]! w-[115.34%]! max-w-none object-cover opacity-20"
        />
      </div>

      <div
        className="pointer-events-none absolute right-0 top-[3.36%] -z-10 h-[93.28%] w-[54.3%] min-w-[520px] opacity-10 mix-blend-plus-lighter max-sm:right-[-54%]"
        aria-hidden="true"
      >
        <Image
          src="/images/login/geometric-pattern.png"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 55vw"
          className="object-fill"
        />
      </div>

      <div className="absolute left-5 top-5 h-[70px] w-[126px] overflow-hidden sm:left-[60px] sm:top-12">
        <Image
          src="/images/login/fatec-cps-logo.png"
          alt="Fatec Itu — Dom Amaury Castanho"
          width={866}
          height={288}
          priority
          className="absolute left-[-4.35%] top-[-21.88%] h-[143.75%] w-[240.3%] max-w-none"
        />
      </div>

      <section
        aria-labelledby="login-title"
        className={cn(
          "flex min-h-[550px] w-full max-w-[595px] flex-col items-center rounded-[25px]",
          "border border-[#AAC1C9] bg-white/10 px-6 pb-10 pt-12 text-white",
          "shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[5px]",
          "sm:min-h-[583px] sm:px-10 sm:pb-[68px] sm:pt-[52px]",
        )}
      >
        <header className="text-center">
          <h1
            id="login-title"
            className="text-[30px] leading-[1.18] font-semibold text-balance sm:text-[34px]"
          >
            Bem-vindo ao Gini
          </h1>
          <p className="mt-0 text-[20px] leading-[1.18] font-medium text-white/80 sm:text-[22px]">
            Faça login para acessar
            <br />o sistema
          </p>
        </header>

        <form
          className="mt-9 w-full max-w-[380px]"
          aria-label="Acesso ao sistema"
        >
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
              href="#"
              className="text-[12px] leading-4 font-extrabold text-[#B1C9D1] underline underline-offset-2 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
            >
              Esqueci a senha
            </Link>
          </div>

          <Button
            type="button"
            size="medium"
            className={cn(
              "mt-[54px] h-[50px] w-full rounded-[15px] border-[#AAC1C9]",
              "bg-[linear-gradient(90deg,#17264D_0%,#0099AA_100%)] text-[28px] font-medium text-white",
              "hover:border-white hover:bg-[linear-gradient(90deg,#223565_0%,#00A8BA_100%)] hover:text-white",
              "focus-visible:ring-white/70",
            )}
          >
            Entrar
          </Button>
        </form>
      </section>
    </main>
  );
}
