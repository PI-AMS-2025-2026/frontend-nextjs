type NavChild = { label: string; href: string; description?: string };
export type NavItem = { label: string; href?: string; children?: NavChild[] };

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
      { label: "Vínculo Professor x Disciplina", href: "/estrutura/vinculo" },
      {
        label: "Disponibilidade do Professor",
        href: "/estrutura/disponibilidade",
      },
    ],
  },
  { label: "Infraestrutura", href: "/infraestrutura" },
  { label: "Organização de tempo", href: "/organizacao" },
  { label: "Grade e planejamento", href: "/grade" },
  { label: "Controle e auditoria", href: "/controle" },
];
