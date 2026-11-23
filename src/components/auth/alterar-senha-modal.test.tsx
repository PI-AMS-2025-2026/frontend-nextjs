import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlterarSenhaModal } from "./alterar-senha-modal";
import { authService } from "@/services/auth.service";

vi.mock("@/services/auth.service", () => ({
  authService: { alterarSenha: vi.fn() },
}));

function preencher(senhaAtual: string, novaSenha: string, confirmacao: string) {
  fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: senhaAtual } });
  fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: novaSenha } });
  fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: confirmacao } });
  fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
}

describe("AlterarSenhaModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bloqueia senha nova fora da política", () => {
    render(<AlterarSenhaModal open onClose={vi.fn()} />);
    preencher("Senha-atual", "fraca", "fraca");

    expect(screen.getByRole("alert")).toHaveTextContent("pelo menos 8 caracteres");
    expect(authService.alterarSenha).not.toHaveBeenCalled();
  });

  it("bloqueia confirmação diferente", () => {
    render(<AlterarSenhaModal open onClose={vi.fn()} />);
    preencher("Senha-atual", "Nova-senha", "Outra-senha");

    expect(screen.getByRole("alert")).toHaveTextContent("não coincidem");
    expect(authService.alterarSenha).not.toHaveBeenCalled();
  });

  it("envia as senhas e confirma sucesso", async () => {
    vi.mocked(authService.alterarSenha).mockResolvedValue(undefined);
    render(<AlterarSenhaModal open onClose={vi.fn()} />);
    preencher("Senha-atual", "Nova-senha", "Nova-senha");

    await waitFor(() => expect(authService.alterarSenha).toHaveBeenCalledWith({
      senhaAtual: "Senha-atual",
      novaSenha: "Nova-senha",
    }));
    expect(await screen.findByText("Sua senha foi atualizada com sucesso.")).toBeInTheDocument();
  });
});
