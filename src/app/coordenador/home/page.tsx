"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type MetricId = "period" | "allocation" | "classes";

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
  chartTitle: string;
  chartDescription: string;
  manageLabel: string;
  manageHref: string;
  values: number[];
  chartMax: number;
};

type Shortcut = {
  title: string;
  description: string;
  color: string;
  href?: string;
  metricId?: MetricId;
};

const metrics: Metric[] = [
  {
    id: "period",
    title: "Período letivo",
    total: 9,
    increase: 2,
    color: "#1F59D6",
    softColor: "#DCE6FA",
    icon: "/images/coordinator/period.svg",
    iconWidth: 66,
    iconHeight: 66,
    chartTitle: "Período letivo cadastrados por mês",
    chartDescription: "Total de períodos letivos cadastrados no ano de 2025",
    manageLabel: "Gerenciar período letivo",
    manageHref: "/coordenador/estrutura-academica/periodo-letivo",
    values: [4, 5, 6, 8, 7, 7, 8, 9, 9, 10, 11, 12],
    chartMax: 14,
  },
  {
    id: "allocation",
    title: "Alocação",
    total: 96,
    increase: 14,
    color: "#E8588B",
    softColor: "#FBE1EA",
    icon: "/images/coordinator/allocation.svg",
    iconWidth: 69,
    iconHeight: 66,
    chartTitle: "Alocações cadastradas por mês",
    chartDescription: "Total de alocações cadastradas no ano de 2025",
    manageLabel: "Gerenciar alocações",
    manageHref: "/coordenador/grade-planejamento/alocacao",
    values: [62, 68, 72, 96, 88, 85, 91, 97, 102, 108, 115, 120],
    chartMax: 140,
  },
  {
    id: "classes",
    title: "Turmas",
    total: 42,
    increase: 7,
    color: "#F59B00",
    softColor: "#FFF0CC",
    icon: "/images/coordinator/classes.svg",
    iconWidth: 72,
    iconHeight: 66,
    chartTitle: "Turmas cadastradas por mês",
    chartDescription: "Total de turmas cadastradas no ano de 2025",
    manageLabel: "Gerenciar turmas",
    manageHref: "/coordenador/estrutura-academica/turmas",
    values: [24, 26, 29, 42, 38, 36, 40, 44, 47, 50, 54, 58],
    chartMax: 70,
  },
];

const shortcuts: Shortcut[] = [
  {
    title: "Professores",
    description: "Veja a listagem de professores na instituição",
    color: "#0BAFA8",
    href: "/coordenador/listagens/professores",
  },
  {
    title: "Salas",
    description: "Veja a listagem de salas na instituição",
    color: "#7B47C3",
    href: "/coordenador/listagens/sala",
  },
  {
    title: "Período letivo",
    description: "Cadastre, edite e gerencie os períodos letivos da instituição",
    color: "#1F59D6",
    metricId: "period",
  },
  {
    title: "Alocação",
    description: "Cadastre, edite e gerencie as alocações horárias da instituição",
    color: "#E8588B",
    metricId: "allocation",
  },
  {
    title: "Turmas",
    description: "Cadastre, edite e gerencie as turmas da instituição",
    color: "#F59B00",
    metricId: "classes",
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
          src="/images/coordinator/growth-arrow.svg"
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
          <Image src={metric.icon} alt="" width={metric.iconWidth} height={metric.iconHeight} className="shrink-0 object-contain" />
          <span className="text-5xl font-black">{String(metric.total).padStart(2, "0")}</span>
        </div>
        <GrowthIndicator metric={metric} />
      </Card>
    </button>
  );
}

function MetricsGrid({ selected, onSelect }: { selected: MetricId | null; onSelect: (id: MetricId) => void }) {
  return (
    <section aria-label="Resumo do sistema" className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} selected={selected === metric.id} onSelect={() => onSelect(metric.id)} />
      ))}
    </section>
  );
}

function ShortcutButton({ shortcut, onSelect }: { shortcut: Shortcut; onSelect: () => void }) {
  const className = "h-10 w-[175px] justify-between border bg-white/80 px-4 text-xl shadow-[0_0_4px_rgba(0,0,0,0.25)] hover:bg-white hover:opacity-80";
  const content = (
    <>
      Ver detalhes
      <ChevronRight className="size-6" aria-hidden="true" />
    </>
  );

  if (shortcut.href) {
    return (
      <Button asChild variant="ghost" size="small" className={className} style={{ borderColor: shortcut.color, color: shortcut.color }}>
        <Link href={shortcut.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button type="button" variant="ghost" size="small" onClick={onSelect} className={className} style={{ borderColor: shortcut.color, color: shortcut.color }}>
      {content}
    </Button>
  );
}

function ShortcutCard({ shortcut, onSelect }: { shortcut: Shortcut; onSelect: () => void }) {
  return (
    <Card
      className="h-[300px] w-full max-w-[230px] items-center gap-0 rounded-[20px] border bg-white px-5 py-9 text-center shadow-[0_0_12px_rgba(0,0,0,0.2)] ring-0"
      style={{ borderColor: shortcut.color }}
    >
      <h3 className="border-b pb-1 text-2xl font-extrabold" style={{ color: shortcut.color, borderColor: shortcut.color }}>
        {shortcut.title}
      </h3>
      <p className="mt-3 flex-1 text-lg leading-5 text-[#767676]">{shortcut.description}</p>
      <ShortcutButton shortcut={shortcut} onSelect={onSelect} />
    </Card>
  );
}

function HomeContent({ onSelect }: { onSelect: (id: MetricId) => void }) {
  return (
    <>
      <section className="border-b border-[#D9D9D9] bg-white px-4 py-3 sm:px-9">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2">
          <Image src="/images/coordinator/shortcuts.svg" alt="" width={66} height={66} className="size-[66px] shrink-0" />
          <div>
            <h2 className="text-2xl font-medium text-black">Funcionalidades disponíveis</h2>
            <p className="text-base font-medium text-[#767676]">Clique em qualquer atalho para acessar</p>
          </div>
        </div>
      </section>

      <section aria-label="Atalhos" className="mx-auto grid w-full max-w-[1280px] grid-cols-1 justify-items-center gap-6 px-4 py-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-[30px]">
        {shortcuts.map((shortcut) => (
          <ShortcutCard key={shortcut.title} shortcut={shortcut} onSelect={() => shortcut.metricId && onSelect(shortcut.metricId)} />
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
                <div className="min-h-1 rounded-t-xl transition-[height] duration-200 motion-reduce:transition-none" style={{ height: `${(value / metric.chartMax) * 100}%`, backgroundColor: metric.color }} />
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
          <Button asChild variant="ghost" size="small" className="h-11 w-fit justify-between border bg-white px-4 text-lg shadow-[0_0_4px_rgba(0,0,0,0.25)] hover:bg-white hover:opacity-80 sm:text-xl" style={{ borderColor: metric.color, color: metric.color }}>
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

export default function CoordenadorHomePage() {
  const [selected, setSelected] = React.useState<MetricId | null>(null);
  const selectedMetric = metrics.find((metric) => metric.id === selected);

  React.useEffect(() => {
    const showHome = () => {
      setSelected(null);
      scrollToTop();
    };

    window.addEventListener("coordenador:show-home", showHome);
    window.addEventListener("coordinator:show-home", showHome);

    return () => {
      window.removeEventListener("coordenador:show-home", showHome);
      window.removeEventListener("coordinator:show-home", showHome);
    };
  }, []);

  function selectMetric(id: MetricId) {
    setSelected(id);
    scrollToTop();
  }

  return (
    <div className="bg-white text-black">
      <main>
        <MetricsGrid selected={selected} onSelect={selectMetric} />
        {selectedMetric && <DashboardContent metric={selectedMetric} />}
        <HomeContent onSelect={selectMetric} />
      </main>
    </div>
  );
}
