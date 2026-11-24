"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { senhaForte, SENHA_FORTE_MENSAGEM } from "@/lib/password-policy";
import { authService } from "@/services/auth.service";

type AlterarSenhaModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AlterarSenhaModal({ open, onClose }: AlterarSenhaModalProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function closeModal() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmacao("");
    setErro(null);
    setSucesso(false);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!senhaAtual) {
      setErro("Informe sua senha atual.");
      return;
    }
    if (!senhaForte(novaSenha)) {
      setErro(SENHA_FORTE_MENSAGEM);
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro("As novas senhas não coincidem.");
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      await authService.alterarSenha({ senhaAtual, novaSenha });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
      setSucesso(true);
    } catch (error) {
      setErro(error instanceof ApiError
        ? error.message || "Não foi possível alterar sua senha."
        : "Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeModal}
      labelledBy="alterar-senha-titulo"
      describedBy="alterar-senha-descricao"
      closeDisabled={salvando}
      className="max-w-lg"
    >
      {sucesso ? (
        <section className="space-y-5 pr-8" aria-live="polite">
          <h2 id="alterar-senha-titulo" className="text-xl font-semibold">Senha alterada</h2>
          <p id="alterar-senha-descricao" className="text-sm text-[#475569]">Sua senha foi atualizada com sucesso.</p>
          <Button type="button" onClick={closeModal} className="w-full">Fechar</Button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-label="Alterar senha" className="space-y-4 pr-8">
          <header className="mb-5">
            <h2 id="alterar-senha-titulo" className="text-xl font-semibold">Redefinir senha</h2>
            <p id="alterar-senha-descricao" className="mt-1 text-sm text-[#475569]">Confirme sua senha atual e escolha uma nova senha.</p>
          </header>
          {erro && <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{erro}</div>}
          <div className="space-y-1.5">
            <label htmlFor="senha-atual" className="block text-sm font-medium">Senha atual</label>
            <PasswordInput id="senha-atual" name="senhaAtual" autoComplete="current-password" required value={senhaAtual} disabled={salvando} onChange={(event) => { setSenhaAtual(event.target.value); setErro(null); }} placeholder="Digite sua senha atual" height="44px" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nova-senha-perfil" className="block text-sm font-medium">Nova senha</label>
            <PasswordInput id="nova-senha-perfil" name="novaSenha" autoComplete="new-password" minLength={8} required aria-describedby="requisitos-nova-senha" value={novaSenha} disabled={salvando} onChange={(event) => { setNovaSenha(event.target.value); setErro(null); }} placeholder="Digite sua nova senha" height="44px" />
            <p id="requisitos-nova-senha" className="text-xs text-[#475569]">Mínimo de 8 caracteres, com uma letra maiúscula e uma minúscula.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmar-nova-senha" className="block text-sm font-medium">Confirmar nova senha</label>
            <PasswordInput id="confirmar-nova-senha" name="confirmacao" autoComplete="new-password" minLength={8} required value={confirmacao} disabled={salvando} onChange={(event) => { setConfirmacao(event.target.value); setErro(null); }} placeholder="Digite novamente a nova senha" height="44px" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={salvando}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>
              {salvando && <Loader2 className="mr-2 size-4 animate-spin" />}
              {salvando ? "Salvando..." : "Alterar senha"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
