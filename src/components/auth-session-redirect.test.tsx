import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthSessionRedirect } from "./auth-session-redirect";
import { authSessionEvents } from "@/services/auth-session";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("redirecionamento de sessão expirada", () => {
  afterEach(() => replace.mockClear());

  it("encaminha para o login com o motivo da sessão expirada", () => {
    render(<AuthSessionRedirect />);

    window.dispatchEvent(new Event(authSessionEvents.sessionExpired));

    expect(replace).toHaveBeenCalledWith("/login?motivo=sessao-expirada");
  });
});
