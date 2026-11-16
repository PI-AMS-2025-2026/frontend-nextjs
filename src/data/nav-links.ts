
type NavChild = {
  label: string;
  href: string;
  description?: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  {
    label: "Gestão de Usuários",
    children: [
      { label: "Usuários", href: "/gestao/usuarios" },
      { label: "Professores", href: "/gestao/professores" },
    ],
  },
  {
    label: "Estrutura acadêmica",
    children: [
      {
        label: "Vínculo Professor x Disciplina",
        href: "/estrutura/vinculo",
      },
      {
        label: "Disponibilidade do Professor",
        href: "/estrutura/disponibilidade",
      },
    ],
  },
  {
    label: "Infraestrutura",
    children: [
      { label: "Salas", href: "/infraestrutura/salas" },
      { label: "Recursos", href: "/infraestrutura/recursos" },
    ],
  },
  {
    label: "Organização de tempo",
    children: [
      { label: "Bloco horário", href: "/organizacao/bloco-horario" },
    ],
  },
  {
    label: "Grade e planejamento",
    children: [
      { label: "Quadro horário", href: "/grade/quadro-horario" },
    ],
  },
];
