import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => ({ login: vi.fn() }) }));
vi.mock("@/components/ui/checkbox", () => ({ Checkbox: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input type="checkbox" {...props} /> }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

describe("aviso de sessão expirada", () => {
  afterEach(() => window.history.replaceState({}, "", "/login"));

  it("direciona para recuperação de senha", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: "Esqueci a senha" })).toHaveAttribute("href", "/recuperar-senha");
  });

  it("mostra o aviso quando o logout automático encaminha ao login", () => {
    window.history.replaceState({}, "", "/login?motivo=sessao-expirada");

    render(<LoginPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Sua sessão expirou. Entre novamente.");
  });
});
