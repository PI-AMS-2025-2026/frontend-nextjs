import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthPageShellProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
}

export function AuthPageShell({ title, description, children }: AuthPageShellProps) {
  return (
    <main
      className={cn(
        "relative isolate flex flex-1 items-center justify-center overflow-hidden",
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
          loading="eager"
          className="absolute left-[-4.35%] top-[-21.88%] w-[240.3%] max-w-none"
          style={{ height: "auto" }}
        />
      </div>

      <section
        aria-labelledby="auth-page-title"
        className={cn(
          "flex min-h-[550px] w-full max-w-[595px] flex-col items-center rounded-[25px]",
          "border border-[#AAC1C9] bg-white/10 px-6 pb-10 pt-12 text-white",
          "shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[5px]",
          "sm:min-h-[583px] sm:px-10 sm:pb-[68px] sm:pt-[52px]",
        )}
      >
        <header className="text-center">
          <h1
            id="auth-page-title"
            className="text-[30px] leading-[1.18] font-semibold text-balance sm:text-[34px]"
          >
            {title}
          </h1>
          <div className="mt-1 text-[20px] leading-[1.18] font-medium text-white/80 sm:text-[22px]">
            {description}
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
