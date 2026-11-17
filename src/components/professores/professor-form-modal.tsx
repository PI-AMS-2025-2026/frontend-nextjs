"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import type {
  ProfessorRequest,
  ProfessorResponse,
} from "@/types/api";

export type DadosProfessor = ProfessorRequest;
export type Professor = ProfessorResponse;

type ProfessorFormModalProps = {
  professor?: Professor;
  salvando?: boolean;
  erroExterno?: string | null;
  onClose: () => void;
  onConfirm: (dados: DadosProfessor) => Promise<void>;
};

export function ProfessorFormModal({
  professor,
  salvando = false,
  erroExterno,
  onClose,
  onConfirm,
}: ProfessorFormModalProps) {
  const [nome, setNome] = React.useState(professor?.nome ?? "");
  const [email, setEmail] = React.useState(professor?.email ?? "");

  const [status, setStatus] =
    React.useState<DadosProfessor["status"]>(
      professor?.status ?? "ATIVO",
    );

  const [erro, setErro] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    formRef.current
      ?.querySelector<HTMLInputElement>("input")
      ?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;

      if (
        focoAnterior instanceof HTMLElement &&
        focoAnterior.isConnected
      ) {
        focoAnterior.focus();
      }
    };
  }, []);

  async function confirmar(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (salvando) return;

    if (!nome.trim()) {
      setErro("Informe o nome do professor.");
      return;
    }

    setErro("");

    const dados: DadosProfessor = {
      nome: nome.trim(),
      email: email.trim(),
      status,
    };

    // Preserva a cidade existente, mesmo sem esse campo na tela.
    if (professor?.cidade !== undefined) {
      dados.cidade = professor.cidade;
    }

    await onConfirm(dados);
  }

  function controlarTeclado(
    event: React.KeyboardEvent<HTMLFormElement>,
  ) {
    if (event.key === "Escape") {
      event.stopPropagation();

      if (!salvando) onClose();

      return;
    }

    if (event.key !== "Tab") return;

    const elementos =
      event.currentTarget.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), button:not([disabled]), [tabindex="0"]',
      );

    const primeiro = elementos[0];
    const ultimo = elementos[elementos.length - 1];

    if (event.shiftKey && document.activeElement === primeiro) {
      event.preventDefault();
      ultimo?.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === ultimo
    ) {
      event.preventDefault();
      primeiro?.focus();
    }
  }

  const mensagemErro = erro || erroExterno;

  return (
    <Modal
      open
      onClose={onClose}
      className="max-h-[90dvh] max-w-[650px] overflow-y-auto"
    >
      <form
        ref={formRef}
        onSubmit={confirmar}
        onKeyDown={controlarTeclado}
        role="dialog"
        aria-modal="true"
        aria-busy={salvando}
        aria-labelledby={`${id}-titulo`}
        className="flex min-h-[340px] flex-col"
      >
        <h2
          id={`${id}-titulo`}
          className="pr-10 text-xl font-semibold"
        >
          {professor
            ? "Edição de Professor"
            : "Cadastro de Professor"}
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${id}-nome`}
              className="mb-2 block text-sm font-medium"
            >
              Nome
            </label>

            <Input
              id={`${id}-nome`}
              name="nome"
              placeholder="Digite o nome"
              autoComplete="name"
              value={nome}
              onChange={(event) => {
                setNome(event.target.value);
                setErro("");
              }}
              disabled={salvando}
              required
            />
          </div>

          <div>
            <label
              htmlFor={`${id}-email`}
              className="mb-2 block text-sm font-medium"
            >
              E-mail
            </label>

            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              placeholder="Digite o e-mail"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={salvando}
              required
            />
          </div>
        </div>

        <fieldset className="mt-6" disabled={salvando}>
          <legend className="mb-3 text-sm font-medium">
            Status
          </legend>

          <RadioGroup
            aria-label="Status do professor"
            value={status}
            disabled={salvando}
            onValueChange={(valor) => {
              if (valor === "ATIVO" || valor === "INATIVO") {
                setStatus(valor);
              }
            }}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={`${id}-ativo`}
                value="ATIVO"
              />

              <label
                htmlFor={`${id}-ativo`}
                className="text-sm"
              >
                Ativo
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={`${id}-inativo`}
                value="INATIVO"
              />

              <label
                htmlFor={`${id}-inativo`}
                className="text-sm"
              >
                Inativo
              </label>
            </div>
          </RadioGroup>
        </fieldset>

        {mensagemErro && (
          <p
            role="alert"
            className="mt-4 text-sm text-[#BA1A1A]"
          >
            {mensagemErro}
          </p>
        )}

        <div className="mt-auto flex justify-end gap-3 pt-10">
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="secondary"
            size="small"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}