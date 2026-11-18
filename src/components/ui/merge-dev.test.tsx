import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./table";
import { TableFilters } from "./tablefilters";

describe("regressões de componentes compartilhados", () => {
  it("preserva ações desabilitadas no layout compacto", () => {
    const editar = vi.fn();
    render(<DataTable compact columns={[{ key: "nome", label: "Nome" }]}
      data={[{ nome: "Inativo", bloqueado: true }, { nome: "Ativo", bloqueado: false }]}
      actions={[{ label: "Editar", icon: null, onClick: editar, disabled: (item) => item.bloqueado }]} />);
    const botoes = screen.getAllByRole("button", { name: "Editar" });
    expect(botoes[0]).toBeDisabled();
    fireEvent.click(botoes[0]);
    expect(editar).not.toHaveBeenCalled();
    fireEvent.click(botoes[1]);
    expect(editar).toHaveBeenCalledWith({ nome: "Ativo", bloqueado: false });
  });

  it("atualiza defaults assíncronos e preserva edição e limpeza dos filtros", () => {
    const onChange = vi.fn();
    const fields = [{ name: "nome", label: "Nome", defaultValue: "" }];
    const { rerender } = render(<TableFilters fields={fields} onChange={onChange} />);
    rerender(<TableFilters fields={[{ ...fields[0], defaultValue: "ADS" }]} onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("ADS");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Teste" } });
    expect(onChange).toHaveBeenLastCalledWith({ nome: "Teste" });
    rerender(<TableFilters fields={[{ ...fields[0], defaultValue: "Outro" }]} onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("Teste");
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(onChange).toHaveBeenLastCalledWith({ nome: "" });
  });
});
