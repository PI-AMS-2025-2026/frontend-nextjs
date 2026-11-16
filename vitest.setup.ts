// Adiciona os matchers do jest-dom (toBeInTheDocument, toHaveClass, ...)
// e limpa o DOM entre os testes.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
