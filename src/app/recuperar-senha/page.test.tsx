import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { authService } from "@/services/auth.service";
import RecuperarSenhaPage from "./page";

const { solicitarMock } = vi.hoisted(() => ({ solicitarMock: vi.fn() }));

vi.mock("@/services/auth.service", () => ({
  authService: { solicitarRecuperacao: solicitarMock },
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("solicitação de recuperação de senha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    solicitarMock.mockResolvedValue(undefined);
  });

  it("envia o e-mail e mostra confirmação que não revela se a conta existe", async () => {
    render(<RecuperarSenhaPage />);
    fireEvent.change(screen.getByLabelText("E-mail de usuário"), {
      target: { value: "pessoa@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    await waitFor(() => expect(authService.solicitarRecuperacao).toHaveBeenCalledWith({ email: "pessoa@example.com" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.",
    );
    expect(screen.getByRole("link", { name: "Voltar ao login" })).toHaveAttribute("href", "/login");
  });

  it("mostra falha da solicitação sem ocultar o formulário", async () => {
    solicitarMock.mockRejectedValueOnce(new Error("Falha temporária"));
    render(<RecuperarSenhaPage />);
    fireEvent.change(screen.getByLabelText("E-mail de usuário"), { target: { value: "pessoa@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar ao servidor.");
    expect(screen.getByRole("form", { name: "Solicitar recuperação de senha" })).toBeInTheDocument();
  });
});
