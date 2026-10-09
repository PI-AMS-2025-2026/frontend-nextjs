import type { HeaderConfig } from "@/components/header";

export const coordinatorHeaderConfig = {
  homeHref: "/coordenador/home",
  homeEventName: "coordinator:show-home",
  navigationGroups: [
    {
      label: "Grade e planejamento",
      links: [
        {
          label: "Alocação",
          href: "/coordenador/grade-planejamento/alocacao",
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
          label: "Período Letivo",
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
