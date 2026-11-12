import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

// Teste de fumaça: garante que o pipeline de testes (jsdom + React 19 +
// Tailwind/cva) está funcionando e que o componente base renderiza.
describe("Button", () => {
  it("renderiza o texto informado", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("aplica o atributo disabled", () => {
    render(<Button disabled>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });
});
