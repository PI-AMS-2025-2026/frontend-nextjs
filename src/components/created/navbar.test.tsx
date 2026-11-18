import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/coordenador/home",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const navigationGroups = [] as const;

function renderNavbar(tipo: "administrador" | "coordenador") {
  return render(
    <Navbar tipo={tipo} homeHref={`/${tipo}/home`} navigationGroups={navigationGroups} />,
  );
}

describe("perfil da navegação", () => {
  beforeEach(() => localStorage.clear());

  it("mostra nome e cargo com curso em linhas separadas para coordenador", () => {
    localStorage.setItem("usuario", JSON.stringify({
      nome: "Tadeu",
      tipoUsuario: "COORDENADOR",
      curso: { id: 7, nome: "ADS" },
    }));

    renderNavbar("coordenador");
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu do coordenador" }));

    expect(screen.getByText("Tadeu")).toBeInTheDocument();
    expect(screen.getByText("Coordenador ADS")).toBeInTheDocument();
    expect(screen.getByText("Tadeu").tagName).toBe("P");
    expect(screen.getByText("Coordenador ADS").tagName).toBe("P");
    expect(screen.getByText("Tadeu")).not.toBe(screen.getByText("Coordenador ADS"));
  });

  it("mostra apenas o cargo para administrador", () => {
    localStorage.setItem("usuario", JSON.stringify({
      nome: "Carlos",
      tipoUsuario: "ADMINISTRADOR",
    }));

    renderNavbar("administrador");
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu do administrador" }));

    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });
});
