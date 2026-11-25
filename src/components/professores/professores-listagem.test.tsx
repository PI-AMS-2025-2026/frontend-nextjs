import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfessoresListagem } from "./professores-listagem";

const navigation = vi.hoisted(() => ({ pathname: "/administrador/listagens/professores" }));

vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
vi.mock("@/services/professores.service", () => ({
  professoresService: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn() },
}));
vi.mock("@/hooks/use-server-page", () => ({
  useServerPage: () => ({
    data: {
      content: [{ id: 12, nome: "Ana Silva", email: "ana@example.com", status: "ATIVO" }],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    },
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}));

describe("listagem de professores por perfil", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/administrador/listagens/professores";
  });

  it("mantém cadastro e edição na visão do administrador", () => {
    render(<ProfessoresListagem />);

    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("remove cadastro e edição da visão do coordenador", () => {
    navigation.pathname = "/coordenador/listagens/professores";
    render(<ProfessoresListagem />);

    expect(screen.getByText("Visualize os professores da instituição")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cadastrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });
});
