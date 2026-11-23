import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

const { redefinirMock } = vi.hoisted(() => ({ redefinirMock: vi.fn() }));

vi.mock("@/services/auth.service", () => ({
  authService: { redefinirSenha: redefinirMock },
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("redefinição de senha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redefinirMock.mockResolvedValue(undefined);
  });

  it("pede outro link quando o token não está presente", () => {
    render(<RedefinirSenhaForm token={null} />);

    expect(screen.getByRole("alert")).toHaveTextContent("O link de redefinição está incompleto ou inválido.");
    expect(screen.getByRole("link", { name: "Solicitar novo link" })).toHaveAttribute("href", "/recuperar-senha");
    expect(authService.redefinirSenha).not.toHaveBeenCalled();
  });

  it("não chama a API quando as senhas não coincidem", async () => {
    render(<RedefinirSenhaForm token="token-seguro" />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "Senha-segura" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "Outra-senha" } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("As senhas não coincidem.");
    expect(authService.redefinirSenha).not.toHaveBeenCalled();
  });

  it("envia token e senha e oferece voltar ao login após sucesso", async () => {
    render(<RedefinirSenhaForm token="token-seguro" />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "Senha-segura" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "Senha-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));

    await waitFor(() => expect(authService.redefinirSenha).toHaveBeenCalledWith({ token: "token-seguro", senha: "Senha-segura" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Agora você pode entrar no sistema com sua nova senha.");
    expect(screen.getByRole("link", { name: "Ir para o login" })).toHaveAttribute("href", "/login");
  });

  it("informa que o link expirou ou é inválido", async () => {
    redefinirMock.mockRejectedValueOnce(new ApiError("Token de recuperação expirado", 400));
    render(<RedefinirSenhaForm token="token-expirado" />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "Senha-segura" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "Senha-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Este link é inválido ou expirou.");
    expect(screen.getByRole("link", { name: "Voltar ao login" })).toHaveAttribute("href", "/login");
  });

  it("não chama a API quando a senha não atende aos requisitos de força", async () => {
    render(<RedefinirSenhaForm token="token-seguro" />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "abcdefgh" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "abcdefgh" } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("uma letra maiúscula e uma letra minúscula");
    expect(authService.redefinirSenha).not.toHaveBeenCalled();
  });
});
