import type { HeaderConfig } from "@/components/header";

export const administratorHeaderConfig = {
  homeHref: "/adminstrador/home",
  homeEventName: "administrator:show-home",
  navigationGroups: [
    {
      label: "Gestão de Usuários",
      links: [
        { label: "Usuários", href: "/adminstrador/gestao-usuarios/usuarios" },
        { label: "Professores", href: "/adminstrador/gestao-usuarios/professores" },
        {
          label: "Vínculo Professor x Disciplina",
          href: "/adminstrador/gestao-usuarios/professor-disciplina",
        },
        {
          label: "Disponibilidade do Professor",
          href: "/adminstrador/gestao-usuarios/disponibilidade-professor",
        },
      ],
    },
    {
      label: "Estrutura acadêmica",
      links: [
        { label: "Cursos", href: "/adminstrador/estrutura-academica/cursos" },
        { label: "Disciplinas", href: "/adminstrador/estrutura-academica/disciplinas" },
      ],
    },
    {
      label: "Infraestrutura",
      links: [
        { label: "Salas", href: "/adminstrador/infraestrutura/salas" },
        { label: "Recursos", href: "/adminstrador/infraestrutura/recursos" },
      ],
    },
    {
      label: "Organização de tempo",
      links: [{ label: "Horários", href: "/adminstrador/grade-planejamento" }],
    },
    {
      label: "Grade e planejamento",
      links: [
        {
          label: "Grade Horária",
          href: "/adminstrador/grade-planejamento/grade-horaria",
        },
      ],
    },
    {
      label: "Controle e auditoria",
      links: [{ label: "Histórico de Alterações", href: "#historico-de-alteracoes" }],
    },
  ],
} satisfies HeaderConfig;
