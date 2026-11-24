import type { HeaderConfig } from "@/components/header";

export const coordinatorHeaderConfig = {
  homeHref: "/coordenador/home",
  homeEventName: "coordinator:show-home",
  navigationGroups: [
    {
      label: "Quadros e planejamento",
      links: [
        {
          label: "Alocação",
          href: "/coordenador/quadro-planejamento/alocacao",
        },
        {
          label: "Quadros de Horários",
          href: "/coordenador/quadro-planejamento/quadro-horaria",
        },
      ],
    },
    {
      label: "Estrutura acadêmica",
      links: [
        {
          label: "Turmas",
          href: "/coordenador/estrutura-academica/turmas",
        },
        {
          label: "Período Atividade Quadro",
          href: "/coordenador/estrutura-academica/periodo-letivo",
        },
      ],
    },
    {
      label: "Listagens",
      links: [
        {
          label: "Professores",
          href: "/coordenador/listagens/professores",
        },
        {
          label: "Salas",
          href: "/coordenador/listagens/sala",
        },
      ],
    },
  ],
} satisfies HeaderConfig;
