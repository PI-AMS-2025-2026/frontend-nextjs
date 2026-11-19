"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { professoresService } from "@/services/professores.service";
import { usuariosService } from "@/services/usuarios.service";
import { cursosService } from "@/services/cursos.service";

const items = [
  { title: "Professores", description: "Cadastre, edite e gerencie os professores da instituição", color: "#0BAFA8", icon: "/images/administrator/professors.svg", href: "/administrador/gestao-usuarios/professores" },
  { title: "Usuários", description: "Cadastre, edite e gerencie os usuários da instituição", color: "#7B47C3", icon: "/images/administrator/users.svg", href: "/administrador/gestao-usuarios/usuarios" },
  { title: "Cursos", description: "Cadastre, edite e gerencie os cursos da instituição", color: "#1F59D6", icon: "/images/administrator/courses.svg", href: "/administrador/estrutura-academica/cursos" },
  { title: "Quadro de Horários", description: "Cadastre, edite e gerencie os quadros de horários da instituição", color: "#E8588B", icon: null, href: "/administrador/quadro-planejamento" },
];

export function AdministratorDashboard() {
  const [totals, setTotals] = React.useState<(number | null)[]>([null, null, null]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    Promise.allSettled([
      professoresService.listar({ size: 1 }),
      usuariosService.listar({ size: 1 }),
      cursosService.listar({ size: 1 }),
    ]).then((results) => {
      if (!active) return;
      setTotals(results.map((result) => result.status === "fulfilled" ? result.value.totalElements : null));
      setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  return (
    <main className="bg-white text-black">
      <div className="border-b border-[#d9d9d9] px-4 py-5 sm:px-12">
        <p className="text-lg text-black/65"><strong className="mr-2 text-2xl text-black/80">Bem-vindo!</strong> Explore abaixo um pouco do nosso sistema</p>
      </div>
      <div className="mx-auto max-w-[1473px] px-4 py-10 sm:px-12">
        <section aria-labelledby="atalhos-title">
          <h1 id="atalhos-title" className="text-2xl font-semibold">Acessos Rápidos</h1>
          <p className="text-base text-[#8b8b8b]">Clique em um módulo para acessar as funcionalidades</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <Link key={item.title} href={item.href} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4" style={{ outlineColor: item.color }}>
                <Card className="flex min-h-[116px] flex-row items-center gap-4 rounded-md border-0 p-4 transition-transform hover:-translate-y-1" style={{ boxShadow: `1px 1px 5px 1px ${item.color}` }}>
                  <Image src={item.icon} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                  <div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold" style={{ color: item.color }}>{item.title}</h2><p className="text-sm leading-tight text-[#767676]">{item.description}</p></div>
                  <ChevronRight className="size-5 shrink-0" style={{ color: item.color }} aria-hidden="true" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section aria-labelledby="resumo-title" className="mt-14 rounded-[15px] bg-gradient-to-br from-[#038092] to-[#084d62] p-6 text-white sm:p-10">
          <h2 id="resumo-title" className="text-[26px] font-semibold">Resumo da Infraestrutura</h2>
          <p className="mt-1 text-white/60">Acompanhe os principais dados da estrutura física da instituição.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {items.slice(0, 3).map((item, index) => (
              <Card key={item.title} className="gap-4 rounded-[15px] border-0 bg-white/25 p-6 text-white shadow-none">
                <div className="flex items-center gap-4">
                  <Image src={item.icon!} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                  <div><h3 className="text-xl font-extrabold">{item.title} cadastrados</h3><p className="text-3xl font-extrabold" aria-live="polite">{totals[index] ?? (loaded ? "—" : "...")}</p></div>
                </div>
                <Button asChild variant="ghost" size="small" className="h-10 rounded-lg border border-[#1f59d6] bg-white/80 px-4 text-base text-[#1f59d6] hover:bg-white"><Link href={item.href}>Ver detalhes <ChevronRight className="size-5" /></Link></Button>
                {loaded && totals[index] === null && <p className="text-sm">Não foi possível carregar o total.</p>}
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
