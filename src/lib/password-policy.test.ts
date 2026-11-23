import { describe, expect, it } from "vitest";
import { senhaForte } from "./password-policy";

describe("política de senha forte", () => {
  it("aceita o mínimo de caracteres com maiúsculas e minúsculas, incluindo acentos", () => {
    expect(senhaForte("Árvoreaz")).toBe(true);
  });

  it("rejeita senhas curtas ou sem maiúsculas/minúsculas", () => {
    expect(senhaForte("Abc1234")).toBe(false);
    expect(senhaForte("abcdefgh")).toBe(false);
    expect(senhaForte("ABCDEFGH")).toBe(false);
  });
});
