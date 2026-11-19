import type { HeaderConfig } from "@/components/header";

export const administratorHeaderConfig = {
  homeHref: "/administrador/home",
  homeEventName: "administrator:show-home",
  navigationGroups: [
    {
      label: "Gestão de Usuários",
      links: [
        { label: "Usuários", href: "/administrador/gestao-usuarios/usuarios" },
        { label: "Professores", href: "/administrador/gestao-usuarios/professores" },
        {
          label: "Vínculo Professor x Disciplina",
          href: "/administrador/gestao-usuarios/professor-disciplina",
        },
        {
          label: "Disponibilidade do Professor",
          href: "/administrador/gestao-usuarios/disponibilidade-professor",
        },
      ],
    },
    {
      label: "Estrutura acadêmica",
      links: [
        { label: "Cursos", href: "/administrador/estrutura-academica/cursos" },
        { label: "Disciplinas", href: "/administrador/estrutura-academica/disciplinas" },
      ],
    },
    {
      label: "Infraestrutura",
      links: [
        { label: "Salas", href: "/administrador/infraestrutura/salas" },
        { label: "Recursos", href: "/administrador/infraestrutura/recursos" },
      ],
    },
    {
      label: "Organização de tempo",
      links: [{ label: "Horários", href: "/administrador/organizacao-de-tempo/horarios" }],
    },
  ],
} satisfies HeaderConfig;
