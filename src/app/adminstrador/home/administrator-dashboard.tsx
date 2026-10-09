"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type MetricId = "professors" | "users" | "courses" | "schedule";

type Metric = {
  id: MetricId;
  title: string;
  total: number;
  increase: number;
  color: string;
  softColor: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  description: string;
  chartTitle: string;
  chartDescription: string;
  manageLabel: string;
  manageHref: string;
  values: number[];
  chartMax: number;
};

const metrics: Metric[] = [
  {
    id: "professors",
    title: "Professores",
    total: 64,
    increase: 8,
    color: "#0BAFA8",
    softColor: "#E1F5F4",
    icon: "/images/administrator/professors.svg",
    iconWidth: 69,
    iconHeight: 66,
    description: "Cadastre, edite e gerencie os professores da instituição",
    chartTitle: "Professores cadastrados por mês",
    chartDescription: "Total de professores cadastrados no ano de 2025",
    manageLabel: "Gerenciar professores",
    manageHref: "/adminstrador/gestao-usuarios/professores",
    values: [42, 46, 52, 64, 61, 57, 63, 68, 71, 73, 75, 78],
    chartMax: 100,
  },
  {
    id: "users",
    title: "Usuários",
    total: 12,
    increase: 2,
    color: "#7B47C3",
    softColor: "#E9DDF8",
    icon: "/images/administrator/users.svg",
    iconWidth: 60,
    iconHeight: 63,
    description: "Cadastre, edite e gerencie os usuários da instituição",
    chartTitle: "Usuários cadastrados por mês",
    chartDescription: "Total de usuários cadastrados no ano de 2025",
    manageLabel: "Gerenciar usuários",
    manageHref: "/adminstrador/gestao-usuarios/usuarios",
    values: [5, 6, 8, 12, 11, 10, 13, 14, 15, 16, 17, 19],
    chartMax: 25,
  },
  {
    id: "courses",
    title: "Cursos",
    total: 35,
    increase: 5,
    color: "#1F59D6",
    softColor: "#DCE6FA",
    icon: "/images/administrator/courses.svg",
    iconWidth: 55,
    iconHeight: 67,
    description: "Cadastre, edite e gerencie os cursos da instituição",
    chartTitle: "Cursos cadastrados por mês",
    chartDescription: "Total de cursos cadastrados no ano de 2025",
    manageLabel: "Gerenciar cursos",
    manageHref: "/adminstrador/estrutura-academica/cursos",
    values: [22, 25, 28, 35, 33, 31, 34, 37, 40, 43, 46, 50],
    chartMax: 80,
  },
  {
    id: "schedule",
    title: "Grade Horária",
    total: 90,
    increase: 9,
    color: "#E8588B",
    softColor: "#FBE1EA",
    icon: "/images/administrator/schedule.svg",
    iconWidth: 69,
    iconHeight: 70,
    description: "Cadastre, edite e gerencie as grades horárias da instituição",
    chartTitle: "Grades horárias cadastradas por mês",
    chartDescription: "Total de grades horárias cadastradas no ano de 2025",
    manageLabel: "Gerenciar grades horárias",
    manageHref: "/adminstrador/grade-planejamento/grade-horaria",
    values: [60, 65, 70, 90, 85, 80, 88, 92, 96, 100, 103, 110],
    chartMax: 140,
  },
];

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

function GrowthIndicator({ metric }: { metric: Metric }) {
  return (
    <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-[#00CE45]">
      <span className="relative block h-5 w-9" aria-hidden="true">
        <Image
          src="/images/administrator/growth-arrow.svg"
          alt=""
          width={19}
          height={36}
          className="absolute left-1/2 top-1/2 h-9 w-[19px] -translate-x-1/2 -translate-y-1/2 rotate-90"
        />
      </span>
      <span>+{metric.increase} esse mês</span>
    </div>
  );
}

function MetricCard({ metric, selected, onSelect }: { metric: Metric; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className="group w-full text-left focus-visible:outline-none">
      <Card
        className="h-[225px] gap-0 rounded-[20px] border-2 px-4 py-4 text-black shadow-[0_0_4px_rgba(217,217,217,0.52)] ring-0 transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-[#0099AA]"
        style={{ borderColor: selected ? metric.color : "#BEBEBE", backgroundColor: selected ? metric.softColor : "#FFFFFF" }}
      >
        <h2 className="text-center text-3xl leading-10 font-extrabold">{metric.title}</h2>
        <div className="mt-2 flex flex-1 items-center justify-center gap-5">
          <Image
            src={metric.icon}
            alt=""
            width={metric.iconWidth}
            height={metric.iconHeight}
            className="shrink-0 object-contain"
          />
          <span className="text-5xl font-black">{metric.total}</span>
        </div>
        <GrowthIndicator metric={metric} />
      </Card>
    </button>
  );
}

function MetricsGrid({ selected, onSelect }: { selected: MetricId | null; onSelect: (id: MetricId) => void }) {
  return (
    <section aria-label="Resumo do sistema" className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} selected={selected === metric.id} onSelect={() => onSelect(metric.id)} />
      ))}
    </section>
  );
}

function ShortcutCard({ metric, onSelect }: { metric: Metric; onSelect: () => void }) {
  return (
    <Card
      className="h-[300px] w-full max-w-[230px] items-center gap-0 rounded-[20px] border bg-white px-5 py-9 text-center shadow-[0_0_12px_rgba(0,0,0,0.2)] ring-0"
      style={{ borderColor: metric.color }}
    >
      <h3 className="border-b pb-1 text-2xl font-extrabold" style={{ color: metric.color, borderColor: metric.color }}>
        {metric.title}
      </h3>
      <p className="mt-3 flex-1 text-lg leading-5 text-[#767676]">{metric.description}</p>
      <Button
        type="button"
        variant="ghost"
        size="small"
        onClick={onSelect}
        className="h-10 w-[175px] justify-between border bg-white/80 px-4 text-xl shadow-[0_0_4px_rgba(0,0,0,0.25)] hover:bg-white hover:opacity-80"
        style={{ borderColor: metric.color, color: metric.color }}
      >
        Ver detalhes
        <ChevronRight className="size-6" aria-hidden="true" />
      </Button>
    </Card>
  );
}

function HomeContent({ onSelect }: { onSelect: (id: MetricId) => void }) {
  return (
    <>
      <section className="border-b border-[#D9D9D9] bg-white px-4 py-3 sm:px-9">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2">
          <Image src="/images/administrator/shortcuts.svg" alt="" width={66} height={66} className="size-[66px] shrink-0" />
          <div>
            <h2 className="text-2xl font-medium text-black">Funcionalidades disponíveis</h2>
            <p className="text-base font-medium text-[#767676]">Clique em qualquer atalho para acessar</p>
          </div>
        </div>
      </section>

      <section aria-label="Atalhos" className="mx-auto grid w-full max-w-[1040px] grid-cols-1 justify-items-center gap-6 px-4 py-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[35px]">
        {metrics.map((metric) => (
          <ShortcutCard key={metric.id} metric={metric} onSelect={() => onSelect(metric.id)} />
        ))}
      </section>

    </>
  );
}

function BarChart({ metric }: { metric: Metric }) {
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((metric.chartMax / 5) * (5 - index)));

  return (
    <div className="min-w-[760px] px-3 pb-3 pt-2">
      <div className="flex h-44 gap-2">
        <div className="flex w-9 flex-col justify-between pb-5 text-right text-xs text-slate-500">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 bottom-5 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-slate-200" />
            ))}
          </div>
          <div className="absolute inset-0 bottom-5 grid grid-cols-12 items-end gap-3 px-2">
            {metric.values.map((value, index) => (
              <div key={months[index]} className="flex h-full flex-col justify-end text-center">
                <span className="mb-0.5 text-[10px] text-slate-500">{value}</span>
                <div
                  className="min-h-1 rounded-t-xl transition-[height] duration-200 motion-reduce:transition-none"
                  style={{ height: `${(value / metric.chartMax) * 100}%`, backgroundColor: metric.color }}
                />
                <span className="mt-1 text-xs text-slate-600">{months[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-slate-500">Meses</p>
    </div>
  );
}

function DashboardContent({ metric }: { metric: Metric }) {
  return (
    <section className="px-4 pb-7 pt-2 sm:px-9">
      <div className="mx-auto max-w-[1407px] overflow-hidden rounded-2xl border bg-white shadow-[0_0_4px_rgba(0,0,0,0.15)]" style={{ borderColor: metric.color }}>
        <div className="flex flex-col gap-3 border-b px-3 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${metric.color}66` }}>
          <div>
            <h2 className="text-xl font-semibold text-black sm:text-2xl">{metric.chartTitle}</h2>
            <p className="text-sm text-[#767676] sm:text-base">{metric.chartDescription}</p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="small"
            className="h-11 w-fit justify-between border bg-white px-4 text-lg shadow-[0_0_4px_rgba(0,0,0,0.25)] hover:bg-white hover:opacity-80 sm:text-xl"
            style={{ borderColor: metric.color, color: metric.color }}
          >
            <Link href={metric.manageHref}>
              {metric.manageLabel}
              <ChevronRight className="size-6" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <BarChart metric={metric} />
        </div>
      </div>
    </section>
  );
}

export function AdministratorDashboard() {
  const [selected, setSelected] = React.useState<MetricId | null>(null);
  const selectedMetric = metrics.find((metric) => metric.id === selected);

  React.useEffect(() => {
    const showHome = () => {
      setSelected(null);
      scrollToTop();
    };

    window.addEventListener("administrator:show-home", showHome);
    return () => window.removeEventListener("administrator:show-home", showHome);
  }, []);

  function selectMetric(id: MetricId) {
    setSelected(id);
    scrollToTop();
  }

  return (
    <div className="bg-white text-black">
      <main>
        <MetricsGrid selected={selected} onSelect={selectMetric} />
        {selectedMetric ? <DashboardContent metric={selectedMetric} /> : <HomeContent onSelect={selectMetric} />}
      </main>
    </div>
  );
}
