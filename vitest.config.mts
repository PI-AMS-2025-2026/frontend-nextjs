import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Testes unitários/de componente. Não é necessário o plugin do React:
// o esbuild do Vite já compila TSX usando o `jsx: "react-jsx"` do tsconfig.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
