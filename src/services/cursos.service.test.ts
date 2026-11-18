import { beforeEach, describe, expect, it, vi } from "vitest";
import { cursosService } from "./cursos.service";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

describe("catálogo de cursos", () => {
  beforeEach(() => vi.clearAllMocks());
  it("consulta todas as páginas disponíveis preservando o filtro", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ content: [{ id: 1 }], totalPages: 2 } as never)
      .mockResolvedValueOnce({ content: [{ id: 2 }], totalPages: 2 } as never);
    const cursos = await cursosService.listarTodos({ status: "ATIVO" });
    expect(cursos.map(c => c.id)).toEqual([1, 2]);
    expect(api.get).toHaveBeenNthCalledWith(1, "/cursos", { status: "ATIVO", page: 0, size: 100 });
    expect(api.get).toHaveBeenNthCalledWith(2, "/cursos", { status: "ATIVO", page: 1, size: 100 });
  });
  it("não apresenta resultado parcial quando uma página falha", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ content: [{ id: 1 }], totalPages: 2 } as never)
      .mockRejectedValueOnce(new Error("erro na página"));
    await expect(cursosService.listarTodos()).rejects.toThrow("erro na página");
  });
});
